import { ResolveFn, Router } from '@angular/router';
import { IbmmqDataService } from '../services/ibmmq.data.service';
import { inject } from '@angular/core';
import { model } from '../../../../wailsjs/go/models';
import { GetQueueManager } from '../../../../wailsjs/go/store/queueStore';
import { ConnectToIbmmq } from '../../../../wailsjs/go/main/App';
import { MessageService } from 'primeng/api';

export type QueueResolverData = {
  queueManager: string;
  channel: string;
  queue: model.Queue;
}

export const queueChannelConnectResolver: ResolveFn<Promise<QueueResolverData>> = async (route, state) => {
  const ibmDataService = inject(IbmmqDataService)
  const router = inject(Router)
  const messageService = inject(MessageService)
  const queueManager = route.paramMap.get('queueManager')
  const channel = route.paramMap.get('channel')
  const queue = route.paramMap.get('queue')

  const qm = await GetQueueManager(queueManager!)
  const connection = await ConnectToIbmmq(qm.name, channel!, qm.connection_settings)

  if (!connection) {
    messageService.add({ key: 'queue', severity: 'error', summary: 'Error', detail: `${qm.name}.${channel} connection failed!` });
    router.navigateByUrl('/')
  }

  const data = await ibmDataService.getQueueData(queueManager!, channel!, queue!)
  return {
    queueManager: queueManager!,
    channel: channel!,
    queue: data
  }
};
