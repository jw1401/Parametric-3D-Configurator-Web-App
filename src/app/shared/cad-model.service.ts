import { Injectable,Inject } from '@angular/core';
import {Http, Response, ResponseContentType} from '@angular/http';
import { AngularFire, FirebaseApp,FirebaseObjectObservable, FirebaseListObservable  } from 'angularfire2';
import {CadModel} from './cad-model';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

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

  getEditModels(): FirebaseListObservable<any>
  {
    return this.af.database.list('/models',
    {
      query:
      {
        orderByChild: ('uid'),
        equalTo: (this.authData.uid),
      }
    });
  }

  getModelByKey(key: string): Promise<CadModel>
  {
    return this.af.database.object(`/models/${key}`).first().toPromise().then().catch();
  }

  getModelData (modelURL: string): Promise<any>
  {
    return this.http.get(modelURL, {responseType: ResponseContentType.Text })
     .map(response => response.text()).toPromise()
  }

  getLikedModels() : Promise<any>[]
  {
    let likedModels: FirebaseObjectObservable<any>
    let model: FirebaseObjectObservable<any>
    let list: any[]= new Array;

    likedModels = this.af.database.object(`/users/${this.authData.uid}/likedModels`);
    likedModels.first().toPromise().then(data=>
    {
      for (let entry of data)
      {
        model=this.af.database.object(`/models/${entry}`);
        model.first().toPromise().then(data=>
        {
          list.push(data);
        })
      }
    })
    return list;
  }

  addModel(model: CadModel, imageFile: any, modelFile: any)
  {
    //assigns the model to the auth_user_uid --> now you know to which user it belongs
    model.uid = this.authData.uid;
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
    this.models.update(key, {like:like});
  }

  getModelsByUser()
  {

  }

  deleteModel(key:string, imageURL:string, modelURL:string)
  {
    let imgDelRef = this.firebase.storage().refFromURL(imageURL);
    let modelDelRef = this.firebase.storage().refFromURL(modelURL);

    //remove database entry then files
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
