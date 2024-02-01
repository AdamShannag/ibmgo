import { Component, Signal, computed } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';
import { MenuService } from '../service/menu.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';

@Component({
  selector: 'app-config',
  templateUrl: './app.config.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarModule,
    ButtonModule,
  ]
})
export class AppConfigComponent {
  scales: number[] = [12, 13, 14, 15, 16];

  constructor(
    public layoutService: DashboardLayoutService,
    public menuService: MenuService,
  ) { }

  get visible(): boolean {
    return this.layoutService.state.configSidebarVisible;
  }

  set visible(_val: boolean) {
    this.layoutService.state.configSidebarVisible = _val;
  }

  get scale(): number {
    return this.layoutService.config().scale;
  }

  set scale(_val: number) {
    this.layoutService.config().scale = _val;
  }

  decrementScale() {
    this.scale--;
    this.applyScale();
  }

  incrementScale() {
    this.scale++;
    this.applyScale();
  }

  applyScale() {
    this.layoutService.config.update((config) => ({
      ...config,
      scale: this.scale,
    }));
  }

  sidebarPosition(): string {
    return 'right';
  }
}
