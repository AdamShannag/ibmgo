import { Injectable, signal } from '@angular/core';
import { AddQueueToChannel, CreateQueueManager, GetAll, GetChannels, GetQueue, GetQueues, GetRequestForQueue, SaveMessageRequest, WipeData } from '../../../../wailsjs/go/store/queueStore';
import { model } from '../../../../wailsjs/go/models';


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
  message: string;
}

export type QueuesData = {
  queueManager: string;
  data: model.QueueManager[];
}

@Injectable({
  providedIn: 'root'
})
export class IbmmqDataService {

  private queuesDataSginal = signal<model.QueueManager[]>([])
  readonly queues = this.queuesDataSginal.asReadonly()


  addQueueData(data: model.QueueManager) {
    CreateQueueManager(data).then(queueManager => {
      let qm = new model.QueueManager()
      qm.name = queueManager.name
      qm.channels = queueManager.channels
      qm.connection_settings = queueManager.connection_settings
      this.queuesDataSginal.update(items => {
        return [...items, qm]
      })
    })
  }

  async addQueueToChannel(queueManager: string, channel: string, queue: string) {
    const queueModel = new model.Queue()
    queueModel.name = queue
    await AddQueueToChannel(queueManager, channel, queueModel)
    this.updateDataSignal()
  }

  async saveMessageToQueueRequest(queueManager: string, channelName: string, queueName: string, requestName: string, messageContent: string) {
    const request = new model.Request()
    request.name = requestName
    request.message = messageContent
    await SaveMessageRequest(queueManager, channelName, queueName, request)
    this.updateDataSignal()
  }

  async getQueueManagerConnectionData(queueManager: string, channelName: string, queueName: string) {
    return await GetQueue(queueManager, channelName, queueName)
  }

  async getChannels(queueManager: string): Promise<model.Channel[]> {
    return await GetChannels(queueManager)
  }

  async getQueues(queueManager: string, channel: string): Promise<model.Queue[]> {
    return await GetQueues(queueManager, channel)
  }

  async getRequests(queueManager: string, channel: string, queue: string): Promise<model.Request[]> {
    return await GetRequestForQueue(queueManager, channel, queue)
  }

  async wipeData() {
    await WipeData()
  }

  private updateDataSignal() {
    GetAll().then(queueManagers => {
      this.queuesDataSginal.set(queueManagers)
    })
  }
}
