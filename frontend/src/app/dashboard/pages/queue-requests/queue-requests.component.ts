import { Component } from '@angular/core';
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
import { IbmmqDataService } from '../../../shared/services/ibmmq.data.service';
import { QueueResolverData } from '../../../shared/resolvers/queue-channel-connect.resolver';

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

  tabs: { title: string, closable: boolean, selected: boolean, messageContent: string }[] = []

  constructor(private messageService: MessageService, private route: ActivatedRoute, private ibmmqDataservice: IbmmqDataService) {
  }

  ngOnInit() {
    this.route.data.subscribe(r => {
      this.tabs = []
      const data = r['data'] as QueueResolverData
      this.queueManager = data.queueManager
      this.channelName = data.channel
      this.queue = data.queue.name
      this.ibmmqDataservice.getRequests(this.queueManager, this.channelName, this.queue).then(r => {
        r.forEach(item => {
          this.tabs.push({ title: item.name, closable: true, selected: false, messageContent: item.message })
        })
      })
    })
  }

  addTab(tab: any) {
    const newTabName = this.newTab.trim() === '' ? 'New tab' : this.newTab.trim();
    this.tabs.forEach(item => item.selected = false)

    const newTab = {
      title: newTabName,
      closable: true,
      selected: true,
      messageContent: ''
    };
    this.tabs.push(newTab)

    this.newTab = '';
    tab.selected = false
  }

  showToastMessage($event: Message) {
    this.messageService.add($event);
  }
}
