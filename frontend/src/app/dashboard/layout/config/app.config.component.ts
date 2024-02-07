import { Component } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';
import { MenuService } from '../service/menu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { IbmmqDataService } from '../../../shared/services/ibmmq.data.service';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-config',
  templateUrl: './app.config.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarModule,
    ButtonModule,
    ConfirmDialogModule
  ],
})
export class AppConfigComponent {
  disabled: boolean = false

  constructor(
    public layoutService: DashboardLayoutService,
    public menuService: MenuService,
    private ibmmqDataService: IbmmqDataService,
    private router: Router,
    private confirmationService: ConfirmationService,
  ) { }

  get visible(): boolean {
    return this.layoutService.state.configSidebarVisible;
  }

  set visible(_val: boolean) {
    this.layoutService.state.configSidebarVisible = _val;
  }

  wipeData() {
    this.confirmationService.confirm({
      message: 'Do you want to wipe out all data?',
      header: 'Wipe Out Confirmation',
      icon: 'pi pi-exclamation-circle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",

      accept: () => {
        this.ibmmqDataService.wipeData().then(r => {
          this.router.navigateByUrl('/').then(() => {
            location.reload()
          })
        })
      },
      reject: () => {
      }
    });
  }

  sidebarPosition(): string {
    return 'right';
  }
}
