import { Injectable, signal } from '@angular/core';

export type QueueMangerConnectionData = {
  queueManager: string;
  hostname?: string;
  port?: number;
  channel: QueueChannelData;
  username?: string;
  password?: string;
}

export type QueueChannelData = {
  channelName: string;
  queues: QueueData[]
}

export type QueueData = {
  queueName: string;
  requests: QueueRequest[]
}

export type QueueRequest = {
  requestName: string;
  message: QueueRequestMessage;
}

export type QueueRequestMessage = {
  message: string;
  saved: boolean
}

export type QueuesData = {
  queueManager: string;
  data: QueueMangerConnectionData[];
}

@Injectable({
  providedIn: 'root'
})
export class IbmmqDataService {

  private queuesDataSginal = signal<QueuesData[]>([])
  readonly queues = this.queuesDataSginal.asReadonly()


  addQueueData(data: QueueMangerConnectionData) {
    this.queuesDataSginal.update(items => {
      const existingItem = items.find(item => item.queueManager === data.queueManager);
      if (existingItem) {
        existingItem.data = [...existingItem.data, data];
        return [...items];
      } else {
        return [...items, { queueManager: data.queueManager, data: [data] }];
      }
    });
  }


  addQueueToChannel(queueManager: string, channel: string, queue: string) {
    this.queuesDataSginal.update(items =>
      items.map(item =>
        item.queueManager === queueManager ? {
          ...item,
          data: item.data.map(dataItem =>
            dataItem.channel.channelName === channel ? {
              ...dataItem,
              channel: {
                ...dataItem.channel,
                queues: [...dataItem.channel.queues, { queueName: queue, requests: [] }]
              }
            } : dataItem
          )
        } : item
      )
    );
  }

  saveMessageToQueueRequest(queueManager: string, channelName: string, queueName: string, requestName: string, messageContent: string) {
    this.queuesDataSginal.update(items =>
      items.map(queueManagerItem =>
        queueManagerItem.queueManager === queueManager ? {
          ...queueManagerItem,
          data: queueManagerItem.data.map(channelItem =>
            channelItem.channel.channelName === channelName ? {
              ...channelItem,
              channel: {
                ...channelItem.channel,
                queues: channelItem.channel.queues.map(queue =>
                  queue.queueName === queueName ? {
                    ...queue,
                    requests: this.updateOrCreateRequest(queue.requests, requestName, messageContent)
                  } : queue
                )
              }
            } : channelItem
          )
        } : queueManagerItem
      )
    );
  }

  private updateOrCreateRequest(requests: QueueRequest[], requestName: string, messageContent: string): QueueRequest[] {
    // Check if the request already exists
    const existingRequestIndex = requests.findIndex(request => request.requestName === requestName);

    if (existingRequestIndex > -1) {
      // Update existing request's message content
      let updatedRequests = [...requests];
      updatedRequests[existingRequestIndex] = {
        ...updatedRequests[existingRequestIndex],
        message: { ...updatedRequests[existingRequestIndex].message, message: messageContent, saved: false }
      };
      return updatedRequests;
    } else {
      // Create a new request since it wasn't found
      return [
        ...requests,
        { requestName, message: { message: messageContent, saved: false } }
      ];
    }
  }


  getQueueManagerConnectionData(queueManager: string, channelName: string, queueName: string): QueueMangerConnectionData | undefined {
    // Find the queue manager by its name
    const queueManagerItem = this.queuesDataSginal().find(item => item.queueManager === queueManager);
    if (!queueManagerItem) return undefined; // Return undefined if the queue manager is not found

    // Find the channel data by its name within the found queue manager
    // and ensure the channel contains the specified queue
    const channelData = queueManagerItem.data.find(dataItem =>
      dataItem.channel.channelName === channelName &&
      dataItem.channel.queues.some(queue => queue.queueName === queueName));

    return channelData; // Return the found QueueMangerConnectionData or undefined if not found
  }



  // deletePanel(id: number) {
  //   this.panelsSignal.update(items => items.filter((item) => item.id !== id))
  // }
}
