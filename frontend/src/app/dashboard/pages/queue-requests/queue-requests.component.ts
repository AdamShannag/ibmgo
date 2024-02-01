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
  newTab = '';
  queueName = 'Queue'
  channelName = 'Channel'

  products = [{
    code: "1111",
    name: "test",
    category: "ASDSA",
    quantity: 10

  }]

  tabs = signal<{ id: number, title: string, closable: boolean }[]>([]);

  activeIndex: number = 0;

  constructor(private messageService: MessageService, private route: ActivatedRoute) {
    this.route.data.subscribe(r => {
      this.queueName = r['data']['queueName']
      this.channelName = r['data']['channel']
    })
  }

  ngOnInit() {
    this.tabs.set([
      { id: -999, title: 'add', closable: false },
    ])
  }

  addTab() {
    const id = this.tabs().length + 1
    const newTabName = this.newTab === '' ? 'New tab' : this.newTab
    this.tabs.update(items => {
      const lastItem = items.pop()
      if (lastItem) {
        return [...items, {
          id: id, title: newTabName, closable: true,
        }, lastItem]
      }
      return [...items, {
        id: id, title: newTabName, closable: true,
      }]
    })
    this.newTab = '';
    this.activeIndex = id - 2
  }

  showToastMessage($event: Message) {
    this.messageService.add($event);
  }

}
