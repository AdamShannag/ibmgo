package mq

import (
	"context"

	"github.com/AdamShannag/model"
	"github.com/AdamShannag/mqcon"
	"github.com/AdamShannag/qmparser"
	"github.com/AdamShannag/types"

	"github.com/ibm-messaging/mq-golang-jms20/jms20subset"
	"github.com/ibm-messaging/mq-golang-jms20/mqjms"
)

type IbmMQ struct {
	ctx    context.Context
	parser qmparser.QueueMessageParser
}

func NewIbmMQ(parser qmparser.QueueMessageParser) *IbmMQ {
	return &IbmMQ{parser: parser}
}

func (a *IbmMQ) CreateIbmmqConnection(port int, queueName, hostname, channeName, username, password string) types.ConnectionResponse {
	queueChannel := types.QueueChannel{
		QueueManager: queueName,
		Channel:      channeName,
	}
	if ok := mqcon.Get()[queueChannel]; ok != nil {
		return types.ConnectionResponse{Status: false, ErrCode: "Error", ErrReason: "Connection already exists!"}
	}

	cf := mqjms.ConnectionFactoryImpl{
		QMName:      queueName,
		Hostname:    hostname,
		PortNumber:  port,
		ChannelName: channeName,
		UserName:    username,
		Password:    password,
	}

	context, errCtx := cf.CreateContext()

	if errCtx != nil {
		return types.ConnectionResponse{Status: false, ErrCode: errCtx.GetErrorCode(), ErrReason: errCtx.GetReason()}
	}

	mqcon.Set(queueChannel, context)

	return types.ConnectionResponse{Status: true, ErrCode: "", ErrReason: ""}
}

func (a *IbmMQ) ConnectToIbmmq(queueName, channelName string, connectionDetails model.ConnectionData) bool {
	queueChannel := types.QueueChannel{
		QueueManager: queueName,
		Channel:      channelName,
	}

	if ok := mqcon.Get()[queueChannel]; ok != nil {
		mqcon.Set(queueChannel, nil)
	}

	cr := a.CreateIbmmqConnection(connectionDetails.Port, queueName, connectionDetails.Hostname, channelName, connectionDetails.Username, connectionDetails.Password)
	if cr.Status {
		return true
	}

	return false
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

	msg, err := msgIterator.GetNext()
	for msg != nil && err == nil {
		textMsg := msg.(jms20subset.TextMessage)

		data := "Unavailable"
		if textMsg.GetText() != nil {
			data = *textMsg.GetText()
		}

		m := types.QueueMessage{
			MessageID: textMsg.GetJMSMessageID(),
			Timestamp: textMsg.GetJMSTimestamp(),
			Data:      data,
		}

		messages = append(messages, m)
		msg, err = msgIterator.GetNext()
		if err != nil {
			break
		}
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
