import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { SendMessageComponent } from '../../../shared/components/send-message/send-message.component';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService, Message } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { QueueMangerConnectionData } from '../../../shared/services/ibmmq.data.service';


@Component({
  selector: 'app-queue-requests',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    TabViewModule,
    SendMessageComponent,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ToastModule,
    DividerModule,
    TableModule],
  templateUrl: './queue-requests.component.html',
  styleUrl: './queue-requests.component.scss'
})
export class QueueRequestsComponent {
  isActive = true
  newTab = '';
  queueManager = 'Queue'
  channelName = 'Channel'
  queue = 'Queue1'

  tabs = signal<{ id: number, title: string, closable: boolean, selected: boolean, messageContent: string }[]>([]);

  constructor(private messageService: MessageService, private route: ActivatedRoute) {
  }

  addNewTab(tabData: { id: number, title: string, closable: boolean, selected: boolean, messageContent: string }) {
    this.tabs.update(items => {
      const newId = items.length;
      tabData.id = newId
      const newItems = [...items, tabData];
      return newItems;
    });

  }

  ngOnInit() {
    this.route.data.subscribe(r => {
      this.tabs.set([])
      const data = r['data'] as QueueMangerConnectionData
      this.queueManager = data.queueManager
      this.channelName = data.channel.channelName
      this.queue = data.channel.queues[0].queueName
      data.channel.queues[0].requests.forEach((item, i) => {
        this.addNewTab({ id: 0, title: item.requestName, closable: true, selected: i === data.channel.queues[0].requests.length - 1, messageContent: item.message.message })
      })
    })
  }

  addTab(tab: any) {
    const newTabName = this.newTab.trim() === '' ? 'New tab' : this.newTab.trim();
    this.tabs.update(items => {
      items.forEach(item => item.selected = false)
      const newId = items.length;
      const newTab = {
        id: newId,
        title: newTabName,
        closable: true,
        selected: true,
        messageContent: ''
      };
      const newItems = [...items, newTab];
      return newItems;
    });

    this.newTab = '';

    tab.selected = false
    console.log(this.tabs())
  }


  showToastMessage($event: Message) {
    this.messageService.add($event);
  }

}
