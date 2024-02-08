package store

import (
	"encoding/json"
	"fmt"

	"github.com/AdamShannag/model"
	"github.com/AdamShannag/mqcon"

	"github.com/boltdb/bolt"
)

var queueManagerBucket = []byte("queueManager")

type queueStore struct {
	db *bolt.DB
}

func NewQueueStore(db *bolt.DB) *queueStore {
	return &queueStore{db}
}

func (s *queueStore) newInitializedQueueManager(q model.QueueManager) model.QueueManager {
	channels := map[string]model.Channel{}
	for k, v := range q.Channels {
		queues := map[string]model.Queue{}
		for qk, vq := range v.Queues {
			requests := map[string]model.Request{}
			for kr, vk := range vq.Requests {
				requests[kr] = vk
			}
			queues[qk] = model.Queue{
				Name:     vq.Name,
				Requests: requests,
			}
		}
		channels[k] = model.Channel{
			Name:   v.Name,
			Queues: queues,
		}
	}

	return model.QueueManager{
		Name:               q.Name,
		ConnectionSettings: q.ConnectionSettings,
		Channels:           channels,
	}
}

func (s *queueStore) CreateQueueManager(q model.QueueManager) (model.QueueManager, error) {
	err := s.db.Update(func(tx *bolt.Tx) error {
		bucket, err := tx.CreateBucketIfNotExists(queueManagerBucket)
		if err != nil {
			return err
		}

		data, err := json.Marshal(s.newInitializedQueueManager(q))
		if err != nil {
			return err
		}

		err = bucket.Put([]byte(q.Name), data)
		if err != nil {
			return err
		}
		return nil
	})

	if err != nil {
		return q, err
	}

	return q, err
}

func (s *queueStore) AddQueueToChannel(queueManager, channel string, queue model.Queue) error {
	queueMan, err := s.GetQueueManager(queueManager)
	if err != nil {
		return err
	}

	queueMan.Channels[channel].Queues[queue.Name] = queue

	_, err = s.CreateQueueManager(queueMan)
	if err != nil {
		return err
	}

	return nil
}

func (s *queueStore) GetQueueManager(name string) (model.QueueManager, error) {
	var queueManager model.QueueManager
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket(queueManagerBucket)
		if bucket == nil {
			return fmt.Errorf("bucket %q not found", queueManagerBucket)
		}

		rawData := bucket.Get([]byte(name))
		err := json.Unmarshal(rawData, &queueManager)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return queueManager, err
	}

	return queueManager, nil
}

func (s *queueStore) GetAll() []model.QueueManager {
	queueManagers := []model.QueueManager{}
	s.db.View(func(tx *bolt.Tx) error {
		// Assume bucket exists and has keys
		b := tx.Bucket(queueManagerBucket)
		if b == nil {
			return nil
		}

		c := b.Cursor()
		var queueManager model.QueueManager
		for k, v := c.First(); k != nil; k, v = c.Next() {
			err := json.Unmarshal(v, &queueManager)
			if err != nil {
				return err
			}
			queueManagers = append(queueManagers, queueManager)
		}

		return nil
	})

	return queueManagers

}

func (s *queueStore) GetRequestForQueue(queueManager, channel, queue string) ([]model.Request, error) {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return nil, err
	}

	requests := []model.Request{}

	for _, v := range qm.Channels[channel].Queues[queue].Requests {
		requests = append(requests, v)
	}

	return requests, nil
}

func (s *queueStore) SaveMessageRequest(queueManager, channel, queue string, request model.Request) error {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return err
	}

	qm.Channels[channel].Queues[queue].Requests[request.Name] = request
	_, err = s.CreateQueueManager(qm)
	if err != nil {
		return err
	}

	return nil
}

func (s *queueStore) GetQueue(queueManager, channel, queue string) (model.Queue, error) {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return model.Queue{}, err
	}

	return qm.Channels[channel].Queues[queue], nil
}

func (s *queueStore) GetChannels(queueManager string) ([]model.Channel, error) {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return nil, err
	}

	channels := []model.Channel{}

	for _, v := range qm.Channels {
		channels = append(channels, v)
	}

	return channels, nil
}

func (s *queueStore) GetQueues(queueManager, channel string) ([]model.Queue, error) {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return nil, err
	}

	queues := []model.Queue{}

	for _, v := range qm.Channels[channel].Queues {
		queues = append(queues, v)
	}

	return queues, nil
}

func (s *queueStore) DeleteRequest(queueManager, channel, queue, request string) error {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return err
	}

	delete(qm.Channels[channel].Queues[queue].Requests, request)

	_, err = s.CreateQueueManager(qm)
	if err != nil {
		return err
	}

	return nil
}

func (s *queueStore) DeleteQueue(queueManager, channel, queue string) error {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return err
	}

	delete(qm.Channels[channel].Queues, queue)

	_, err = s.CreateQueueManager(qm)
	if err != nil {
		return err
	}

	return nil
}

func (s *queueStore) WipeData() error {
	return s.db.Update(func(tx *bolt.Tx) error {
		err := tx.DeleteBucket(queueManagerBucket)
		if err != nil {
			return err
		}
		for _, v := range mqcon.Get() {
			v.Close()
		}
		mqcon.Reset()
		return nil
	})
}

func (s *queueStore) ChangeRequestName(queueManager, channel, queue, oldRequest, newRequest string) error {
	qm, err := s.GetQueueManager(queueManager)
	if err != nil {
		return err
	}

	newRequestModel := model.Request{
		Name:    newRequest,
		Message: qm.Channels[channel].Queues[queue].Requests[oldRequest].Message,
	}

	delete(qm.Channels[channel].Queues[queue].Requests, oldRequest)

	qm.Channels[channel].Queues[queue].Requests[newRequest] = newRequestModel

	_, err = s.CreateQueueManager(qm)
	if err != nil {
		return err
	}

	return nil
}
