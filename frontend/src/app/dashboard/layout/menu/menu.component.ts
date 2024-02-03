import { OnInit, Component } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewConnectionDialogComponent } from '../../../shared/components/new-connection-dialog/new-connection-dialog.component';
import { IbmmqDataService, QueueChannelData, QueueMangerConnectionData } from '../../../shared/services/ibmmq.data.service';
import { NewQueueDialogComponent } from '../../../shared/components/new-queue-dialog/new-queue-dialog.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  standalone: true,
  imports: [CommonModule, MenuItemComponent],
  providers: [DialogService]
})
export class MenuComponent implements OnInit {
  model: MenuItem[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(public layoutService: DashboardLayoutService, private dialogService: DialogService, private ibmmqService: IbmmqDataService) {
  }


  menuItems(): MenuItem[] {
    return this.ibmmqService.queues().map(queueManager => ({
      label: queueManager.queueManager,
      icon: 'pi pi-envelope',
      items: queueManager.data.map(queueData => ({
        label: queueData.channel.channelName,
        icon: 'pi pi-box',
        items: this.constructQueueItems(queueManager.queueManager, queueData.channel)
      }))
    }));
  }

  private constructQueueItems(queueManager: string, channel: QueueChannelData): MenuItem[] {
    const queueItems = channel.queues.map(queue => ({
      label: queue.queueName,
      icon: 'pi pi-box',
      routerLink: ['queue', queueManager, channel.channelName, queue.queueName]
    }));

    const newQueueItem = {
      label: 'New Queue',
      icon: 'pi pi-plus',
      command: () => this.openNewQueueDialog(queueManager, channel.channelName)
    };

    return [newQueueItem, ...queueItems];
  }

  private openNewQueueDialog(queueManager: string, channelName: string): void {
    const ref = this.dialogService.open(NewQueueDialogComponent, {
      header: 'New Queue',
      width: '40%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false
    });

    ref.onClose.subscribe((queueName: string) => {
      if (queueName) {
        this.ibmmqService.addQueueToChannel(queueManager, channelName, queueName);
        this.addQueueMenuItem(queueName, queueManager, channelName)
      }
    });
  }

  addQueueMenuItem(queueName: string, queueManagerName: string, channelName: string): void {
    const queueManagerItem = this.model[1].items?.find(item => item.label === queueManagerName);
    if (!queueManagerItem) return;
    queueManagerItem.items = queueManagerItem.items ?? [];
    let channelItem = queueManagerItem.items.find(item => item.label === channelName);
    if (!channelItem) {
      channelItem = { label: channelName, icon: 'pi pi-box', items: [] };
      queueManagerItem.items.push(channelItem);
    }
    channelItem.items?.push({
      label: queueName,
      icon: 'pi pi-send',
      routerLink: ['queue', queueManagerName, channelName, queueName]
    });
  }


  ngOnInit() {
    this.model = [
      {
        label: 'Main',
        items: [
          {
            label: 'New Connection',
            icon: 'pi pi-fw pi-plus',
            command: () => {
              this.ref = this.dialogService.open(NewConnectionDialogComponent, {
                header: 'New MQ Connection',
                width: '40%',
                contentStyle: { overflow: 'auto' },
                baseZIndex: 10000,
                maximizable: false
              });

              this.ref.onClose.subscribe((queueInfo: QueueMangerConnectionData) => {
                if (queueInfo) {
                  this.ibmmqService.addQueueData(queueInfo)
                  this.model[1].items = this.menuItems()
                }
              });
            }
          },
        ],
      },
      {
        label: 'Connections',
      },
    ];
  }
}
