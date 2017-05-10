import { Injectable,Inject } from '@angular/core';
import {Http, Response, ResponseContentType, Headers,RequestOptions} from '@angular/http';
import { AngularFire, FirebaseApp,FirebaseObjectObservable, FirebaseListObservable  } from 'angularfire2';
import {CadModel} from './cad-model';
//import {UserModel} from './user-model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';
import { Observable, Subject } from 'rxjs/Rx';


//this is the cad-model-service for cad-model realated transactions in firebase
@Injectable()
export class CadModelService
{
  //public error:any;
  public firebase : any;
  public authData : any;
  public models : FirebaseListObservable<any>;
  public limit : BehaviorSubject<number> = new BehaviorSubject<number>(10);

  constructor(@Inject(FirebaseApp) firebaseApp: any, private af: AngularFire,private http: Http)
  {
    console.log("Cad Model service is active!");
    this.af.auth.subscribe(auth =>
    {
      this.authData = auth;
      if(this.authData)
      {
        console.log("Cad-Model-Service active for " + this.authData.auth.email);
        this.models=this.af.database.list('/models');
      }
    });
    this.firebase = firebaseApp;
  }

  getModels(): FirebaseListObservable<any>
  {
    return this.af.database.list('/models',
    {
      query:
      {
        limitToFirst: this.limit,
        orderByKey : true
      }
    });
  }

  scroll()
  {
    this.limit.next( this.limit.getValue() + 10);
  }

  getEditModels(): Observable<any>
  {
    return this.getModelsForModelsKeys(this.getModelsKeysPerUser())
  }

  getLikedModels(): Observable<any>
  {
    return this.getModelsForModelsKeys(this.getLikedModelsKeysPerUser())
  }

  getModelsForModelsKeys(modelsKeys: Observable<string[]>): Observable<any>
  {
      return modelsKeys.map(mpu => mpu.map(modelKey => this.af.database.object(`models/`+ modelKey)))
      .flatMap(fbojs =>Observable.combineLatest(fbojs));
  }

  getModelsKeysPerUser() : Observable<string[]>
  {
    return this.af.database.list(`/modelsPerUser/${this.authData.uid}`, {preserveSnapshot: true})
    .do(val => console.log("val: ",val))
    .map(mspu => mspu.map(mpu=>mpu.key));
  }

  getLikedModelsKeysPerUser() : Observable<string[]>
  {
    return this.af.database.list(`/likedModelsPerUser/${this.authData.uid}`, {preserveSnapshot: true}).first()
    .do(val => console.log("val: ",val))
    .map(lmspu => lmspu.map(lmpu=>lmpu.key));
  }

  getModelByKey(key: string): Promise<CadModel>
  {
    return this.af.database.object(`/models/${key}`).first().toPromise().then().catch();
  }

  getModelData (modelURL: string): Promise<any>
  {
    return this.http.get(modelURL, { responseType: ResponseContentType.Text})
     .map(response => response.text()).toPromise()
  }

  getModelDataBinary (modelURL: string): Promise<any>
  {
    return this.http.get(modelURL, { responseType: ResponseContentType.ArrayBuffer})
     .map(response => response.arrayBuffer()).toPromise()
  }

  addModel(model: CadModel, imageFile: any, modelFile: any)
  {
    //assigns the model to the auth_user_uid --> now you know to which user it belongs
    model.userId = this.authData.uid;
    this.models.push(model).then(item=>
    {
      this.uploadImage(imageFile.name,imageFile.file,item.key);
      this.uploadModel(modelFile.name,modelFile.file,item.key);
      this.af.database.object(`/modelsPerUser/${this.authData.uid}/${item.key}`).set(true)
    });
  }

  updateModel(key:string, model:CadModel)
  {
    this.models.update(key, {name: model.name, description: model.description, power: model.power, isCustomizable: model.isCustomizable});
  }

  updateLike(key: string, like)
  {
    let userId = this.authData.uid;
    let item = this.af.database.object(`/likedModelsPerUser/${userId}/${key}`).first().single().subscribe(data=>
      {
        //console.log(data.$value)
        if (data.$value == null)
        {
          this.af.database.object(`/likedModelsPerUser/${userId}/${key}`).set(true);
          this.models.update(key, {like:like+1});
        }
        else
        {
          this.af.database.object(`/likedModelsPerUser/${userId}/${key}`).remove();
          this.models.update(key, {like:like-1});
        }
      });
  }

  deleteModel(key:string, imageURL:string, modelURL:string)
  {
    let imgDelRef = this.firebase.storage().refFromURL(imageURL);
    let modelDelRef = this.firebase.storage().refFromURL(modelURL);

    //remove database entry then files
    this.af.database.list(`/likedModelsPerUser/${this.authData.uid}/`).remove(key);
    this.af.database.list(`/modelsPerUser/${this.authData.uid}/`).remove(key);

    this.models.remove(key).then(_=>
    {
      imgDelRef.delete().then(function()
      {
        console.log("Success deleting image...")
      }).catch(function(error)
      {
        this.error=error;
        console.log(error)
      });

      modelDelRef.delete().then(function()
      {
        console.log("Success deleting model...")
      }).catch(function(error)
      {
        this.error=error;
        console.log(error)
      });
      console.log("removed it...")
    }).catch(err=> console.log(err));

  }

  changeModelImage(imageFileName, imagefile, oldImageURL, itemKey) : Promise<any>
  {
    let models = this.models; //this is a must do
    let imgDelRef = this.firebase.storage().refFromURL(oldImageURL);

    imgDelRef.delete().then(function(){console.log("remove Model Image")});

    let promise = new Promise((res,rej) =>
    {
      let uploadTask = this.firebase.storage().ref(`${this.authData.uid}/${itemKey}/images/${imageFileName}`).put(imagefile);
      uploadTask.on('state_changed', function(snapshot){}, function(error){rej(error);},function()
      {
        var downloadURL = uploadTask.snapshot.downloadURL;
        res(downloadURL);
        models.update(itemKey,{imageURL:downloadURL}); //update the database with img url
      });
    });
    return promise
  }

  changeModelFile(modelFileName, modelfile, oldModelURL, itemKey) : Promise<any>
  {
    let models = this.models; //this is a must do
    let imgDelRef = this.firebase.storage().refFromURL(oldModelURL);

    imgDelRef.delete().then(function(){console.log("remove Model")});

    let promise = new Promise((res,rej) =>
    {
      let uploadTask = this.firebase.storage().ref(`${this.authData.uid}/${itemKey}/models/${modelFileName}`).put(modelfile);
      uploadTask.on('state_changed', function(snapshot){}, function(error){rej(error);},function()
      {
        var downloadURL = uploadTask.snapshot.downloadURL;
        res(downloadURL);
        models.update(itemKey,{modelURL:downloadURL}); //update the database with img url
      });
    });
    return promise
  }

  uploadImage(imageFileName, imagefile, itemKey)
  {
    let models = this.models; //this is a must do

    // gives back Promise with resolution or rejection
    let promise = new Promise((res,rej) =>
    {
      let uploadTask = this.firebase.storage().ref(this.authData.uid+'/'+itemKey+`/images/${imageFileName}`).put(imagefile);
      uploadTask.on('state_changed', function(snapshot){}, function(error){rej(error);},
        function()
        {
          var downloadURL = uploadTask.snapshot.downloadURL;
          res(downloadURL);
          models.update(itemKey,{imageURL:downloadURL}); //update the database with img url
        });
      });
    return promise;
  }

  uploadModel(modelFileName, modelfile, itemKey)
  {
    let models = this.models;

    let promise = new Promise((res,rej) =>
    {
      let uploadTask = this.firebase.storage().ref(this.authData.uid+'/'+itemKey+`/models/${modelFileName}`).put(modelfile);

      uploadTask.on('state_changed',function(snapshot){},function(error){rej(error);},
        function()
        {
          var downloadURL = uploadTask.snapshot.downloadURL;
          res(downloadURL);
          models.update(itemKey,{modelURL:downloadURL});//update the database with model url
        });
    });
    return promise;
  }

}
