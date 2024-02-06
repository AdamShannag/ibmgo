package main

import (
	"embed"
	"log"

	"github.com/AdamShannag/mq"
	"github.com/AdamShannag/qmparser"
	"github.com/AdamShannag/store"
	"github.com/AdamShannag/types"
	"github.com/boltdb/bolt"

	"github.com/ibm-messaging/mq-golang-jms20/jms20subset"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

var ibmmqConnectionsMap = map[types.QueueChannel]jms20subset.JMSContext{}
var db *bolt.DB

func main() {
	// Create an instance of the app structure
	db, err := bolt.Open("./ibmgo.db", 0644, nil)
	if err != nil {
		log.Fatal(err)
	}
	queueStore := store.NewQueueStore(db)
	app := NewApp(ibmmqConnectionsMap)
	parser := qmparser.NewParser()
	queue := mq.NewIbmMQ(ibmmqConnectionsMap, parser)

	// Create application with options
	err = wails.Run(&options.App{
		Title:             "ibmgo",
		Width:             1440,
		Height:            900,
		MinWidth:          1280,
		MinHeight:         800,
		MaxWidth:          1900,
		MaxHeight:         1200,
		DisableResize:     false,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Menu:             nil,
		Logger:           nil,
		LogLevel:         logger.DEBUG,
		OnStartup:        app.startup,
		OnDomReady:       app.domReady,
		OnBeforeClose:    app.beforeClose,
		OnShutdown:       app.shutdown,
		WindowStartState: options.Normal,
		Bind: []interface{}{
			app, queue, queueStore,
		},
		Linux: &linux.Options{
			Icon: icon,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			// DisableFramelessWindowDecorations: false,
			WebviewUserDataPath: "",
			ZoomFactor:          1.0,
		},
		// Mac platform specific options
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  false,
				HideTitleBar:               false,
				FullSizeContent:            false,
				UseToolbar:                 false,
				HideToolbarSeparator:       true,
			},
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "ibmgo",
				Message: "",
				Icon:    icon,
			},
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
