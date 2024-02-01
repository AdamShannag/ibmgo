import { OnInit, Component } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';
import { CommonModule } from '@angular/common';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewConnectionDialogComponent } from '../../../shared/components/new-connection-dialog/new-connection-dialog.component';
import { IbmmqDataService, QueueMangerConnectionData } from '../../../shared/services/ibmmq.data.service';

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

  menuItems() {
    const menuItem: MenuItem[] = []
    this.ibmmqService.queues().forEach(item => {
      const menuParentItem: MenuItem = { label: item.queueName, icon: 'pi pi-envelope' }
      const childMenuItems: MenuItem[] = []
      item.data.forEach(childItem => { childMenuItems.push({ label: childItem.channel, icon: 'pi pi-box', routerLink: ['queue', childItem.queueName, childItem.channel] }) })
      menuParentItem.items = [...childMenuItems]
      menuItem.push(menuParentItem)
    })
    console.log(menuItem)
    return menuItem;
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
        items: []
      },
    ];
  }
}
