import { ResolveFn } from '@angular/router';
import { QueueMangerConnectionData } from '../services/ibmmq.data.service';

export const queueChannelConnectResolver: ResolveFn<QueueMangerConnectionData> = (route, state) => {
  const queue = route.paramMap.get('queue')
  const channel = route.paramMap.get('channel')
  // call go code to connect to ibmq
  const data: QueueMangerConnectionData = {
    queueName: queue!,
    channel: channel!,
  }
  return data;
};
