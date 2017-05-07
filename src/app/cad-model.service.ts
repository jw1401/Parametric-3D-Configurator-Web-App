import { Injectable,Inject } from '@angular/core';
import {Router} from '@angular/router';
import { AngularFire, FirebaseApp,FirebaseObjectObservable, FirebaseListObservable  } from 'angularfire2';
import {CadModel} from './cad-model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';


//this is the cad-model-service for cad-model realated transactions in firebase
@Injectable()
export class CadModelService
{
  //public auth: any;
  public error:any;
  public  firebase:any;

  public userData:any;

  public cadModel:CadModel;

  public models: FirebaseListObservable<any>;
  public model:FirebaseObjectObservable<any>;

  public limit: BehaviorSubject<number> = new BehaviorSubject<number>(5);

  constructor(@Inject(FirebaseApp) firebaseApp: any, private af: AngularFire)
  {
    //this.auth = firebaseApp.auth();
    //console.log(this.auth);

    this.af.auth.subscribe(auth =>
    {
      this.userData = auth;
      console.log("Cad-Model-Service active for " + this.userData.auth.email);
    });

    this.firebase = firebaseApp;
  }

  getModels(): FirebaseListObservable<any>
  {
    this.models= this.af.database.list('/models',
    {
      query:
      {
        limitToFirst: this.limit,
        orderByKey : true
      }
    });
    return this.models;
  }

  scroll()
  {
    this.limit.next( this.limit.getValue() + 5);
  }

  getModelByKey(key: string): Promise<any>
  {
    this.model=this.af.database.object(`/models/${key}`)
    //this.model.take(1);
    return this.model.toPromise().then(response => response.json().data as CadModel);

  }

  getLikedModels()
  {

  }

  addModel()
  {

  }

  updateModel()
  {

  }

  getModelsByUser()
  {

  }

  deleteModel()
  {

  }

}
