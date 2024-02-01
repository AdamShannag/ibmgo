package mq

import (
	"context"

	"github.com/ibm-messaging/mq-golang-jms20/jms20subset"
)

type QueueChannel struct {
	Queue   string
	Channel string
}

type QueueMessage struct {
	MessageID string
	Timestamp int64
	Data      string
}

type BrowseMessagesResponse struct {
	Status   bool
	Messages []QueueMessage
}

type IbmMQ struct {
	ctx         context.Context
	connections map[QueueChannel]jms20subset.JMSContext
}

// NewApp creates a new App application struct
func NewIbmMQ(connections map[QueueChannel]jms20subset.JMSContext) *IbmMQ {
	return &IbmMQ{connections: connections}
}

func (a *IbmMQ) SendMessageToQueue(queueName, channelName, sendTo, message string) bool {
	queueChannel := QueueChannel{
		Queue:   queueName,
		Channel: channelName,
	}
	jms := a.connections[queueChannel]
	queue := jms.CreateQueue(sendTo)

	msg1 := jms.CreateTextMessageWithString(message)

	err := jms.CreateProducer().Send(queue, msg1)
	if err != nil {
		return false
	}
	return true
}

func (a *IbmMQ) BrowseMessages(queueName, channelName, from string) BrowseMessagesResponse {

	response := BrowseMessagesResponse{
		Status:   false,
		Messages: nil,
	}
	queueChannel := QueueChannel{
		Queue:   queueName,
		Channel: channelName,
	}
	jms := a.connections[queueChannel]
	queue := jms.CreateQueue(from)

	browser, errCons := jms.CreateBrowser(queue)
	if browser != nil {
		defer browser.Close()
	}

	if errCons != nil {
		return response
	}

	msgIterator, err := browser.GetEnumeration()
	if err != nil {
		return response
	}

	messages := []QueueMessage{}

	for msg, err := msgIterator.GetNext(); err == nil && msg != nil; {
		textMsg := msg.(jms20subset.TextMessage)
		m := QueueMessage{
			MessageID: textMsg.GetJMSMessageID(),
			Timestamp: textMsg.GetJMSTimestamp(),
			Data:      *textMsg.GetText(),
		}
		messages = append(messages, m)
		msg, err = msgIterator.GetNext()
	}

	response.Messages = messages
	response.Status = true

	return response

}

func (a *IbmMQ) ConsumeAllMessages(queueName, channelName, from string) bool {

	queueChannel := QueueChannel{
		Queue:   queueName,
		Channel: channelName,
	}
	jms := a.connections[queueChannel]
	queue := jms.CreateQueue(from)

	j, err := jms.CreateConsumer(queue)

	if j != nil {
		defer j.Close()
	}

	if err != nil {
		return false
	}

	for {
		m, err := j.ReceiveNoWait()
		if err != nil {
			return false
		}
		if m == nil {
			return true
		}
	}
}
