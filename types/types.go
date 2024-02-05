package types

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
