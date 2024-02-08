import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ConfirmationService, Message } from 'primeng/api';
import { IbmGoApiService, QueueMessage } from '../../services/ibm.go.api.service';
import { IbmmqDataService } from '../../services/ibmmq.data.service';
import { Editor, EditorModule, EditorTextChangeEvent } from 'primeng/editor';
import Quill from 'quill';
import { DeleteRequest } from '../../../../../wailsjs/go/store/queueStore';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EditTabNameDialogComponent } from '../edit-tab-name-dialog/edit-tab-name-dialog.component';

export type QueueMessageEvent = {
  queue: string;
  message: string;
}

export type EditRequestNameEvent = {
  oldName: string;
  newName: string;
}

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, InputTextModule, TableModule, EditorModule],
  templateUrl: './send-message.component.html',
  providers: [DialogService],
  styleUrl: './send-message.component.scss'
})
export class SendMessageComponent implements AfterViewInit {
  allowedCommands = ['UUID', `Date "yyyy-MM-dd"`, `Date "yyMMdd"`, `Date "yy/MM/dd"`, 'RandomString $']; // Add your specific words here

  @ViewChild('editorRef') editorComponent!: Editor;
  ref: DynamicDialogRef | undefined;

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

  @Output() deleteRequestEvent = new EventEmitter<boolean>();
  @Output() editRequestNameEvent = new EventEmitter<EditRequestNameEvent>();

  numberOfMessages: number | undefined;

  sendButtonDisabled = false
  refreshButtonDisabled = false
  clearButtonDisabled = false


  queueMessages = signal<QueueMessage[]>([]);

  @Output() toastMessageEvent = new EventEmitter<Message>();

  constructor(private ibmGoApiService: IbmGoApiService,
    private ibmDataService: IbmmqDataService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService) { }

  ngAfterViewInit(): void {
    const quill = this.editorComponent.getQuill() as Quill;
    quill.setText(this.message)
    this.formatText()
  }

  sendMessage() {
    this.sendButtonDisabled = true;
    if (!this.numberOfMessages)
      this.numberOfMessages = 1
    this.ibmGoApiService.sendBulkToQueue(this.queueManager, this.channelName, this.queue, this.text, this.numberOfMessages).then(() => {
      this.sendButtonDisabled = false;
    })
  }

  refreshMessages() {
    if (this.queue === '') {
      this.toastMessageEvent.emit({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Field: Queue name is empty!' });
      return
    }
    this.refreshButtonDisabled = true;
    this.ibmGoApiService.browseMessages(this.queueManager, this.channelName, this.queue).then(messages => {
      this.queueMessages.update(items => messages)
      this.refreshButtonDisabled = false;
    })
  }

  clearQueues() {
    if (this.queue === '') {
      this.toastMessageEvent.emit({ key: 'queue', severity: 'error', summary: 'Error', detail: 'Field: Queue name is empty!' });
      return
    }
    this.clearButtonDisabled = true
    this.ibmGoApiService.consumeAllMessages(this.queueManager, this.channelName, this.queue).then(_ => {
      this.ibmGoApiService.browseMessages(this.queueManager, this.channelName, this.queue).then(messages => {
        this.queueMessages.update(items => messages)
        this.clearButtonDisabled = false
      })
    })
  }

  updateRequestData() {
    this.ibmDataService.saveMessageToQueueRequest(this.queueManager, this.channelName, this.queue, this.request, this.message)
  }

  updateText(event: EditorTextChangeEvent) {
    this.formatText()
    this.text = event.textValue
    this.ibmDataService.saveMessageToQueueRequest(this.queueManager, this.channelName, this.queue, this.request, event.textValue)
  }

  formatText() {
    const quill = this.editorComponent.getQuill() as Quill; // Assuming this.editorComponent is your ViewChild reference
    const text = quill.getText();
    const regex = /\{\{\.(.*?)\}\}/g;// Regular expression to find text within {{}}

    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchedWord = match[1]; // The word inside {{...()}}
      const startPosition = match.index; // Move past the opening {{
      const length = match[1].length + 5; // Length of the matched group inside braces

      console.log(matchedWord.replace(/"\d+"/g, "$"))

      if (this.allowedCommands.includes(matchedWord) || this.allowedCommands.includes(matchedWord.replace(/\d+/g, "$"))) {
        // Apply italic style and orange color only to the text inside {{}}
        quill.formatText(startPosition, length, { 'italic': true, 'color': '#ba68c8', 'code': true, 'underline': false, 'background': '#17202A' });
        quill.removeFormat(startPosition + length, length)
      } else {
        quill.formatText(startPosition, length, { 'italic': false, 'color': '#f48fb1', 'code': false, 'underline': true });
        quill.removeFormat(startPosition + length, length)
      }
    }
  }

  deleteMessage() {
    this.confirmationService.confirm({
      message: `Do you want to proceed with deleting "${this.request}" request?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        DeleteRequest(this.queueManager, this.channelName, this.queue, this.request).then(() => {
          this.deleteRequestEvent.emit(true)
        })
      }
    });
  }


  editRequestName() {
    const ref = this.dialogService.open(EditTabNameDialogComponent, {
      data: {
        tabName: this.request
      },
      header: 'Edit Tab',
      width: '40%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false
    });

    ref.onClose.subscribe((tabName: string) => {
      if (tabName) {
        this.editRequestNameEvent.emit({ oldName: this.request, newName: tabName })
        this.request = tabName
      }
    });
  }
}
