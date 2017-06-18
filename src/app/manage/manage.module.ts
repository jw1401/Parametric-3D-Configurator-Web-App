import { NgModule }      from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthGuard } from '../auth/auth-guard.service';

import { manageRouting } from './manage.routing';
import { ManageComponent } from './manage.component';
import { NewmodelComponent } from './newmodel.component';
import { EditmodelComponent } from './editmodel.component';
import { LikedModelsComponent } from './liked-models.component'
import { ModelDetailComponent} from './model-detail.component'

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
    ModelDetailComponent,
  ]
})
export class ManageModule { }
