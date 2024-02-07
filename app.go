package main

import (
	"context"

	"github.com/AdamShannag/model"
	"github.com/AdamShannag/mqcon"
	"github.com/AdamShannag/types"

	"github.com/ibm-messaging/mq-golang-jms20/mqjms"
)

type ConnectionResponse struct {
	Status    bool
	ErrCode   string
	ErrReason string
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
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
	for _, v := range mqcon.Get() {
		v.Close()
	}
}

func (a *App) CreateIbmmqConnection(port int, queueName, hostname, channeName, username, password string) ConnectionResponse {
	queueChannel := types.QueueChannel{
		QueueManager: queueName,
		Channel:      channeName,
	}
	if ok := mqcon.Get()[queueChannel]; ok != nil {
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

	mqcon.Set(queueChannel, context)

	return ConnectionResponse{true, "", ""}
}

func (a *App) ConnectToIbmmq(queueName, channeName string, connectionDetails model.ConnectionData) bool {
	queueChannel := types.QueueChannel{
		QueueManager: queueName,
		Channel:      channeName,
	}
	if ok := mqcon.Get()[queueChannel]; ok != nil {
		return true
	}

	cr := a.CreateIbmmqConnection(connectionDetails.Port, queueName, connectionDetails.Hostname, channeName, connectionDetails.Username, connectionDetails.Password)
	if cr.Status {
		return true
	}

	return false
}
