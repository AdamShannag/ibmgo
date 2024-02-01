import { Component, ElementRef, ViewChild } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  standalone: true,

  imports: [CommonModule, RouterLink, ToggleButtonModule],
})
export class TopbarComponent {
  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(public layoutService: DashboardLayoutService) { }

  onConfigButtonClick() {
    this.layoutService.showConfigSidebar();
  }
}

