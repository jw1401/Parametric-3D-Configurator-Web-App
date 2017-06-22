import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders }  from '@angular/core';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component'
import { HomeComponent } from './home/home.component';
import { DashboardComponent} from './dashboard/dashboard.component';
import { LoginComponent, SignupComponent } from './auth/auth.component';
import { PageNotFoundComponent } from './app.component';
import {CadviewComponent} from './cadview/cadview.component'

import { AuthGuard } from './auth/auth-guard.service';

const routes: Routes =
[
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  /*{ path: 'hello',
    component: HelloComponent},
    canActivate: [AuthGuard]},*/

  { path:'cadview/:model_uid',component:CadviewComponent},

  { path:'home',component:HomeComponent},
  { path: 'about',  component: AboutComponent },
  { path: 'disclaimer', component: DisclaimerComponent },
  { path: 'contact', component: ContactComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  declarations: []
})
export class RoutingModule { }
