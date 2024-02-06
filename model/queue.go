package model

type Queue struct {
	Name     string             `json:"name"`
	Requests map[string]Request `json:"requests"`
}
