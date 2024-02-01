import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { QueueRequestsComponent } from './pages/queue-requests/queue-requests.component';
import { queueChannelConnectResolver } from '../shared/resolvers/queue-channel-connect.resolver';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: DashboardComponent
      },
      {
        path: 'queue/:queue/:channel',
        component: QueueRequestsComponent,
        resolve: {
          data: queueChannelConnectResolver,
        }
      }
    ]
  },
];

export default DASHBOARD_ROUTES;
