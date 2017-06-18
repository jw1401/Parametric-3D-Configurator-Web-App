import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';

import {RoutingModule} from './routing.module';

import { AppComponent, PageNotFoundComponent } from './app.component';
import { AboutComponent } from './about/about.component';

import { AuthModule } from './auth/auth.module';
import { DashModule } from './dashboard/dashboard.module';
import { ManageModule } from './manage/manage.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ManageComponent } from './manage/manage.component';
import { CadviewComponent } from './cadview/cadview.component';

import {CadModelService} from './shared/cad-model.service';

import {Draggable} from 'ng2draggable/draggable.directive';

import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { environment } from '../environments/environment';


export const firebaseConfig = environment.firebaseConfig;


@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    HomeComponent,
    PageNotFoundComponent,
    CadviewComponent,
    Draggable,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AuthModule,
    DashModule,
    ManageModule,
    RoutingModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [CadModelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
