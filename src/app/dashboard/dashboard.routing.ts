import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../auth/auth-guard.service';

import { DashboardComponent } from './dashboard.component';
import { AccountComponent } from './Account/account.component';
import { YouComponent } from './You/you.component'
import { ProfileComponent } from './Profile/profile.component'


const appRoutes: Routes = [
  { path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: YouComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'you', component: YouComponent },
      { path: 'account', component: AccountComponent }
    ]
  },
];

export const dashRouting: ModuleWithProviders = RouterModule.forChild(appRoutes);
