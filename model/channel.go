package model

type Channel struct {
	Name   string           `json:"name"`
	Queues map[string]Queue `json:"queues"`
}
