import { NgModule }      from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthGuard } from '../auth/auth-guard.service';

import { manageRouting } from './manage.routing';
import { ManageComponent } from './manage.component';
import { NewmodelComponent } from './NewModel/newmodel.component';
import { EditmodelComponent } from './EditModel/editmodel.component';
import { LikedModelsComponent } from './LikedModels/likedmodels.component'
import { ModelFormComponent } from'./model-form.component'


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
    LikedModelsComponent,
    ModelFormComponent,
  ]
})
export class ManageModule { }
