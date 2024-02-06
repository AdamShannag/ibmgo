package model

type QueueManager struct {
	Name               string             `json:"name"`
	Channels           map[string]Channel `json:"channels"`
	ConnectionSettings ConnectionData     `json:"connection_settings"`
}
