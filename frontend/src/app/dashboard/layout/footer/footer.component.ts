import { Component } from '@angular/core';
import { DashboardLayoutService } from '../service/layout.service';

@Component({
  selector: 'app-footer',
  template: ` <div class="layout-footer">
    <img
      src="assets/layout/images/logo-ys.png"
      alt="Logo"
      height="40"
      class="mr-2"
    />
  </div>`,
  standalone: true,
})
export class FooterComponent {}
