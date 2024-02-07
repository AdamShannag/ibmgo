package mqcon

import (
	"sync"

	"github.com/AdamShannag/types"
	"github.com/ibm-messaging/mq-golang-jms20/jms20subset"
)

var once sync.Once

var ibmmqConnectionsMap map[types.QueueChannel]jms20subset.JMSContext

func Get() map[types.QueueChannel]jms20subset.JMSContext {
	once.Do(func() {
		ibmmqConnectionsMap = make(map[types.QueueChannel]jms20subset.JMSContext)
	})

	return ibmmqConnectionsMap
}

func Reset() {
	ibmmqConnectionsMap = make(map[types.QueueChannel]jms20subset.JMSContext)
}

func Set(qc types.QueueChannel, conn jms20subset.JMSContext) {
	ibmmqConnectionsMap[qc] = conn
}
