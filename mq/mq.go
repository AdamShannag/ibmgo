package mq

import (
	"context"

	"github.com/AdamShannag/mqcon"
	"github.com/AdamShannag/qmparser"
	"github.com/AdamShannag/types"

	"github.com/ibm-messaging/mq-golang-jms20/jms20subset"
)

type IbmMQ struct {
	ctx    context.Context
	parser qmparser.QueueMessageParser
}

func NewIbmMQ(parser qmparser.QueueMessageParser) *IbmMQ {
	return &IbmMQ{parser: parser}
}

func (q *IbmMQ) SendMessageToQueue(queueManager, channelName, sendTo, message string) bool {
	message = q.parser.ParseMessage(message)
	jms, queue := q.getJmsAndQueue(queueManager, channelName, sendTo)

	msg1 := jms.CreateTextMessageWithString(message)

	err := jms.CreateProducer().Send(queue, msg1)
	if err != nil {
		return false
	}
	return true
}

func (q *IbmMQ) SendBulkToQueue(queueManager, channelName, sendTo, message string, amount int) bool {
	jms, queue := q.getJmsAndQueue(queueManager, channelName, sendTo)

	doneCh := make(chan error, amount)

	for i := 0; i < amount; i++ {
		go func(msg string) {
			parsedMessage := q.parser.ParseMessage(msg)
			msgToSend := jms.CreateTextMessageWithString(parsedMessage)
			err := jms.CreateProducer().Send(queue, msgToSend)
			doneCh <- err
		}(message)
	}

	var failed bool
	for i := 0; i < amount; i++ {
		err := <-doneCh
		if err != nil {
			failed = true
		}
	}

	return !failed
}

func (q *IbmMQ) BrowseMessages(queueManager, channelName, from string) types.BrowseMessagesResponse {
	jms, queue := q.getJmsAndQueue(queueManager, channelName, from)

	response := types.BrowseMessagesResponse{
		Status:   false,
		Messages: nil,
	}

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

	messages := []types.QueueMessage{}

	for msg, err := msgIterator.GetNext(); err == nil && msg != nil; {
		textMsg := msg.(jms20subset.TextMessage)
		m := types.QueueMessage{
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

func (q *IbmMQ) ConsumeAllMessages(queueManager, channelName, from string) bool {
	jms, queue := q.getJmsAndQueue(queueManager, channelName, from)

	consumer, err := jms.CreateConsumer(queue)

	if consumer != nil {
		defer consumer.Close()
	}

	if err != nil {
		return false
	}

	for {
		m, err := consumer.ReceiveNoWait()
		if err != nil {
			return false
		}
		if m == nil {
			return true
		}
	}
}

func (q *IbmMQ) getJmsAndQueue(queueManager, channelName, queue string) (jms20subset.JMSContext, jms20subset.Queue) {
	queueChannel := types.QueueChannel{
		QueueManager: queueManager,
		Channel:      channelName,
	}
	jms := mqcon.Get()[queueChannel]
	return jms, jms.CreateQueue(queue)
}
