import { Component, EventEmitter, Input, Output, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { Message } from 'primeng/api';
import { IbmGoApiService, QueueMessage } from '../../services/ibm.go.api.service';
import { IbmmqDataService } from '../../services/ibmmq.data.service';
import { Editor, EditorModule, EditorTextChangeEvent } from 'primeng/editor';
import Quill from 'quill';

export type QueueMessageEvent = {
  queue: string;
  message: string;
}

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, InputTextModule, TableModule, EditorModule],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.scss'
})
export class SendMessageComponent {
  allowedCommands = ['UUID', `Date "yyyy-MM-dd"`, `Date "yyMMdd"`, `Date "yy/MM/dd"`]; // Add your specific words here

  @ViewChild('editorRef') editorComponent!: Editor;

  @Input()
  queueManager = ''
  @Input()
  channelName = ''

  @Input()
  queue = ''
  @Input()
  message = ''
  @Input()
  request = ''
  text = ''

  queueMessages = signal<QueueMessage[]>([]);

  @Output() toastMessageEvent = new EventEmitter<Message>();

  constructor(private ibmGoApiService: IbmGoApiService, private ibmDataService: IbmmqDataService) { }

  sendMessage() {
    this.ibmGoApiService.sendMessageToQueue(this.queueManager, this.channelName, this.queue, this.text).finally()
  }

  refreshMessages() {
    if (this.queue === '') {
      this.toastMessageEvent.emit({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Field: Queue name is empty!' });
      return
    }
    this.ibmGoApiService.browseMessages(this.queueManager, this.channelName, this.queue).then(messages => this.queueMessages.update(items => messages))
  }

  clearQueues() {
    if (this.queue === '') {
      this.toastMessageEvent.emit({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Field: Queue name is empty!' });
      return
    }
    this.ibmGoApiService.consumeAllMessages(this.queueManager, this.channelName, this.queue).then(_ => {
      this.ibmGoApiService.browseMessages(this.queueManager, this.channelName, this.queue).then(messages => this.queueMessages.update(items => messages))
    })
  }

  updateRequestData() {
    this.ibmDataService.saveMessageToQueueRequest(this.queueManager, this.channelName, this.queue, this.request, this.message)
  }

  updateText(event: EditorTextChangeEvent) {
    const quill = this.editorComponent.getQuill() as Quill; // Assuming this.editorComponent is your ViewChild reference
    const text = quill.getText();
    const regex = /\{\{\.(.*?)\}\}/g;// Regular expression to find text within {{}}
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchedWord = match[1]; // The word inside {{...()}}
      const startPosition = match.index; // Move past the opening {{
      const length = match[1].length + 5; // Length of the matched group inside braces

      if (this.allowedCommands.includes(matchedWord)) {
        // Apply italic style and orange color only to the text inside {{}}
        quill.formatText(startPosition, length, { 'italic': true, 'color': 'orange', 'code': true, 'underline': false, 'background': '#17202A' });
        quill.removeFormat(startPosition + length, length)
      } else {
        quill.formatText(startPosition, length, { 'italic': false, 'color': 'red', 'code': false, 'underline': true });
        quill.removeFormat(startPosition + length, length)
      }
    }

    this.text = event.textValue
    this.ibmDataService.saveMessageToQueueRequest(this.queueManager, this.channelName, this.queue, this.request, event.textValue)

  }
}
