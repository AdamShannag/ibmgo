import { Component, ElementRef } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-sidebar',
  template: `<app-menu></app-menu>`,
  standalone: true,
  imports: [MenuComponent],
})
export class SidebarComponent {
  constructor(
    public layoutService: DashboardLayoutService,
    public el: ElementRef
  ) {}
}
