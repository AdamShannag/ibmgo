import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/api';
import { IbmGoApiService, QueueMessage } from '../../services/ibm.go.api.service';

export type QueueMessageEvent = {
  queue: string;
  message: string;
}

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, InputTextModule, InputTextareaModule, TableModule],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.scss'
})
export class SendMessageComponent {
  @Input()
  queueName = ''
  @Input()
  channelName = ''

  queue = ''
  message = ''

  queueMessages = signal<QueueMessage[]>([]);

  @Output() toastMessageEvent = new EventEmitter<Message>();

  constructor(private ibmGoApiService: IbmGoApiService) { }

  sendMessage() {
    this.ibmGoApiService.sendMessageToQueue(this.queueName, this.channelName, this.queue, this.message).finally()
  }

  refreshMessages() {
    if (this.queue === '') {
      this.toastMessageEvent.emit({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Field: Queue name is empty!' });
      return
    }
    this.ibmGoApiService.browseMessages(this.queueName, this.channelName, this.queue).then(messages => this.queueMessages.update(items => messages))
  }

  clearQueues() {
    if (this.queue === '') {
      this.toastMessageEvent.emit({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Field: Queue name is empty!' });
      return
    }
    this.ibmGoApiService.consumeAllMessages(this.queueName, this.channelName, this.queue).then(_ => {
      this.ibmGoApiService.browseMessages(this.queueName, this.channelName, this.queue).then(messages => this.queueMessages.update(items => messages))
    })
  }
}
