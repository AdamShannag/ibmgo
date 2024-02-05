import { ResolveFn } from '@angular/router';
import { IbmmqDataService, QueueMangerConnectionData } from '../services/ibmmq.data.service';
import { inject } from '@angular/core';

export const queueChannelConnectResolver: ResolveFn<QueueMangerConnectionData> = (route, state) => {
  const ibmDataService = inject(IbmmqDataService)
  const queueManager = route.paramMap.get('queueManager')
  const channel = route.paramMap.get('channel')
  const queue = route.paramMap.get('queue')

  const data = ibmDataService.getQueueManagerConnectionData(queueManager!, channel!, queue!)!
  const clonedData = { ...data, channel: { ...data.channel } };
  clonedData.channel.queues = clonedData.channel.queues.filter(q => q.queueName === queue);

  return clonedData;
};
