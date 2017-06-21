import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageComponent } from './manage.component';
import { NewmodelComponent } from './NewModel/newmodel.component';
import { EditmodelComponent } from './EditModel/editmodel.component';
import { LikedModelsComponent } from './LikedModels/likedmodels.component';
import { AuthGuard } from '../auth/auth-guard.service';

const appRoutes: Routes =
[
  { path: 'manage',
    component: ManageComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: NewmodelComponent },
      { path: 'newmodel', component: NewmodelComponent },
      { path: 'editmodel', component: EditmodelComponent },
      { path: 'likedmodels', component: LikedModelsComponent},
    ]
  },
];

export const manageRouting: ModuleWithProviders = RouterModule.forChild(appRoutes);
