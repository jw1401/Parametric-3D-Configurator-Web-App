import { NgModule }      from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthGuard } from '../auth/auth-guard.service';

import { manageRouting } from './manage.routing';
import { ManageComponent } from './manage.component';
import {NewmodelComponent} from './newmodel.component';
import {EditmodelComponent} from './editmodel.component';
//import { ProfileComponent, AccountComponent, SettingsComponent } from './child.component';

@NgModule({
  imports:      [
    manageRouting,
    FormsModule,
    CommonModule
   ],
   providers: [AuthGuard],
  declarations: [
    ManageComponent,
    NewmodelComponent,
    EditmodelComponent,
  ]
})
export class ManageModule { }
