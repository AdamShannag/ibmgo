import { Injectable, signal } from '@angular/core';

export type QueueMangerConnectionData = {
  queueName: string;
  hostname?: string;
  port?: number;
  channel: string;
  username?: string;
  password?: string;
}

export type QueuesData = {
  queueName: string;
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
      const indexOfQueue = items.findIndex(item => item.queueName === data.queueName)
      if (indexOfQueue === -1) {
        return [...items, { queueName: data.queueName, data: [data] }]
      }
      items[indexOfQueue].data = [...items[indexOfQueue].data, data]
      return items
    })
  }

  // deletePanel(id: number) {
  //   this.panelsSignal.update(items => items.filter((item) => item.id !== id))
  // }
}
