import { ResolveFn } from '@angular/router';
import { IbmmqDataService } from '../services/ibmmq.data.service';
import { inject } from '@angular/core';
import { model } from '../../../../wailsjs/go/models';

export type QueueResolverData = {
  queueManager: string;
  channel: string;
  queue: model.Queue;
}

export const queueChannelConnectResolver: ResolveFn<Promise<QueueResolverData>> = async (route, state) => {
  const ibmDataService = inject(IbmmqDataService)
  const queueManager = route.paramMap.get('queueManager')
  const channel = route.paramMap.get('channel')
  const queue = route.paramMap.get('queue')

  const data = await ibmDataService.getQueueManagerConnectionData(queueManager!, channel!, queue!)
  return {
    queueManager: queueManager!,
    channel: channel!,
    queue: data
  }

};
