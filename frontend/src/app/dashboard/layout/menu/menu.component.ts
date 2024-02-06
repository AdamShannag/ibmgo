import { OnInit, Component } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewConnectionDialogComponent } from '../../../shared/components/new-connection-dialog/new-connection-dialog.component';
import { IbmmqDataService } from '../../../shared/services/ibmmq.data.service';
import { NewQueueDialogComponent } from '../../../shared/components/new-queue-dialog/new-queue-dialog.component';
import { model } from '../../../../../wailsjs/go/models';
import { GetAll } from '../../../../../wailsjs/go/store/queueStore';

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


  async menuItems(): Promise<MenuItem[]> {
    const result = await GetAll();
    const menuItemsPromises = result.map(async (queueManager) => {
      const channels = await this.ibmmqService.getChannels(queueManager.name);
      const itemsPromises = channels.map(async (chan) => {
        const queueItems = await this.constructQueueItems(queueManager.name, chan.name);
        return {
          label: chan.name,
          icon: 'pi pi-box',
          items: queueItems
        };
      });
      const items = await Promise.all(itemsPromises);
      return {
        label: queueManager.name,
        icon: 'pi pi-envelope',
        items: items
      };
    });

    const m = await Promise.all(menuItemsPromises);
    return m;
  }

  private async constructQueueItems(queueManager: string, channel: string): Promise<MenuItem[]> {
    const queueItems = await this.ibmmqService.getQueues(queueManager, channel)
    const convertedItems = queueItems.map(q => ({
      label: q.name,
      icon: 'pi pi-plus',
      routerLink: ['queue', queueManager, channel, q.name]
    }))

    const newQueueItem = {
      label: 'New Queue',
      icon: 'pi pi-plus',
      command: () => this.openNewQueueDialog(queueManager, channel)
    };

    return [newQueueItem, ...convertedItems];
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
        this.ibmmqService.addQueueToChannel(queueManager, channelName, queueName)
          .then(() => this.addQueueMenuItem(queueName, queueManager, channelName));
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

              this.ref.onClose.subscribe((queueInfo: model.QueueManager) => {
                if (queueInfo) {
                  this.ibmmqService.addQueueData(queueInfo)
                  this.menuItems().then(r => {
                    this.model[1].items = r
                  })
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

    this.menuItems().then(r => {
      this.model[1].items = r
    })
  }
}
