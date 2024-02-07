import { Component } from '@angular/core';

import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ImageModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
