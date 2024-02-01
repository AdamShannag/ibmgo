package main

import (
	"changeme/mq"
	"context"

	"github.com/ibm-messaging/mq-golang-jms20/jms20subset"
	"github.com/ibm-messaging/mq-golang-jms20/mqjms"
)

type ConnectionResponse struct {
	Status    bool
	ErrCode   string
	ErrReason string
}

// App struct
type App struct {
	ctx         context.Context
	connections map[mq.QueueChannel]jms20subset.JMSContext
}

// NewApp creates a new App application struct
func NewApp(connections map[mq.QueueChannel]jms20subset.JMSContext) *App {
	return &App{connections: connections}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	for _, v := range a.connections {
		v.Close()
	}
}

func (a *App) CreateIbmmqConnection(port int, queueName, hostname, channeName, username, password string) ConnectionResponse {
	queueChannel := mq.QueueChannel{
		Queue:   queueName,
		Channel: channeName,
	}
	if ok := ibmmqConnectionsMap[queueChannel]; ok != nil {
		return ConnectionResponse{false, "Error", "Connection already exists!"}
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
		return ConnectionResponse{false, errCtx.GetErrorCode(), errCtx.GetReason()}
	}

	ibmmqConnectionsMap[queueChannel] = context

	return ConnectionResponse{true, "", ""}

}
