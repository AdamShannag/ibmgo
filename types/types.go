package types

type QueueChannel struct {
	QueueManager string
	Channel      string
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
