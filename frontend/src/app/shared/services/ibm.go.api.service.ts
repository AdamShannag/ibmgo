import { Injectable } from '@angular/core';
import { BrowseMessages, ConsumeAllMessages, CreateIbmmqConnection, SendBulkToQueue } from '../../../../wailsjs/go/mq/IbmMQ';
import { MessageService } from 'primeng/api';

export type QueueMessage = {
  MessageID: string;
  Timestamp: string;
  Data: string;
}

@Injectable({
  providedIn: 'root'
})
export class IbmGoApiService {

  constructor(private messageService: MessageService) { }

  async browseMessages(queueManager: string, channelName: string, queue: string) {
    const messages: QueueMessage[] = []
    const browseResponse = await BrowseMessages(queueManager, channelName, queue)

    if (!browseResponse.Status) {
      this.messageService.add({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Failed to refresh messages' });
      return messages
    }

    for (const message of browseResponse.Messages) {
      const newMsg: QueueMessage = {
        Timestamp: message.Timestamp,
        MessageID: message.MessageID,
        Data: message.Data
      }
      messages.push(newMsg);
    }
    return messages
  }

  async consumeAllMessages(queueManager: string, channelName: string, queue: string) {
    const consumeResponse = await ConsumeAllMessages(queueManager, channelName, queue)
    if (!consumeResponse) {
      this.messageService.add({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Failed to clear queue messages' });
      return
    }
    this.messageService.add({ key: 'queue', severity: 'success', summary: 'Cleared!', detail: 'Queue messages cleared!' });
  }

  async connectToIbmmq(port: number, queueManager: string, hostname: string, channel: string, username: string, password: string) {
    const createConnectionResponse = await CreateIbmmqConnection(port, queueManager, hostname, channel, username, password)

    if (!createConnectionResponse.Status) {
      this.messageService.add({ key: 'connect', severity: 'error', summary: 'Failed to connect!', detail: `${createConnectionResponse.ErrCode}: ${createConnectionResponse.ErrReason}` });
      return false
    }

    this.messageService.add({ key: 'connect', severity: 'success', summary: 'Connected!', detail: `Connected to ${queueManager}.${channel}` });
    return true
  }

  async sendBulkToQueue(queueManager: string, channelName: string, queue: string, message: string, amount: number) {
    const sendResponse = await SendBulkToQueue(queueManager, channelName, queue, message, amount)
    if (!sendResponse) {
      this.messageService.add({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Something went wrong!' });
      return
    }
    this.messageService.add({ key: 'queue', severity: 'success', summary: 'Sent!', detail: `${amount} Message/s sent!` });
  }

}
