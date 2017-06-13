import { Injectable,Inject } from '@angular/core';
import { Http, Response, ResponseContentType, Headers,RequestOptions } from '@angular/http';
import { CadModel } from './cad-model';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';
import { Observable, Subject } from 'rxjs/Rx';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { UserService } from './user.service';
import { FileService} from './fbStorage.service';
import { Upload } from './user.model';


//this is the cad-model-service for cad-model realated transactions in firebase
@Injectable()
export class CadModelService
{
  public firebase = firebase;

  authState : any =null;
  rawFirebaseAuth : any;
  models : FirebaseListObservable <any> = null;

  constructor( private db: AngularFireDatabase, private http: Http, private afAuth: AngularFireAuth, private userService: UserService, private fileService: FileService)
  {
    afAuth.authState.subscribe((auth) =>
    {
      this.authState = auth;

      if(this.authState)
      {
        console.log("Cad-Model-Service active for " + this.authState.email);
        this.models=this.db.list('/models');
      }
    });

    this.rawFirebaseAuth = firebase.auth();


  }

  getModelsList(query={}): FirebaseListObservable<any>
  {
    return this.db.list('/models', { query: query });
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
      return modelsKeys.map(mpu => mpu.map(modelKey => this.db.object(`models/`+ modelKey)))
      .flatMap(fbojs =>Observable.combineLatest(fbojs));
  }

  getModelsKeysPerUser() : Observable<string[]>
  {
    return this.db.list(`/modelsPerUser/${this.userService.currentUserId}`, {preserveSnapshot: true})
    .do(val => console.log("val: ",val))
    .map(mspu => mspu.map(mpu=>mpu.key));
  }

  getLikedModelsKeysPerUser() : Observable<string[]>
  {
    return this.db.list(`/likedModelsPerUser/${this.userService.currentUserId}`, {preserveSnapshot: true}).first()
    .do(val => console.log("val: ",val))
    .map(lmspu => lmspu.map(lmpu=>lmpu.key));
  }

  getModelByKey(key: string): Promise<CadModel>
  {
    return this.db.object(`/models/${key}`).first().toPromise().then().catch();
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
    model.userId = this.userService.currentUserId;
    this.models.push(model).then(item=>
    {
      //this.uploadImage(imageFile.name,imageFile.file,item.key);
      this.uploadImage2(item.key , model);
      //this.uploadModel(modelFile.name,modelFile.file,item.key);
      this.uploadModel2(item.key , model);
      this.db.object(`/modelsPerUser/${this.userService.currentUserId}/${item.key}`).set(true)
    });
  }

  updateModel(key:string, model:CadModel)
  {
    console.log(model);
    delete model.$key;

    this.models.update(key, model);//{name: model.name, description: model.description, power: model.power, isCustomizable: model.isCustomizable, license: model.license});
  }

  updateLike(key: string, like)
  {
    let item = this.db.object(`/likedModelsPerUser/${this.userService.currentUserId}/${key}`).first().single().subscribe(data=>
      {
        //console.log(data.$value)
        if (data.$value == null)
        {
          this.db.object(`/likedModelsPerUser/${this.userService.currentUserId}/${key}`).set(true);
          this.models.update(key, {like:like+1});
        }
        else
        {
          this.db.object(`/likedModelsPerUser/${this.userService.currentUserId}/${key}`).remove();
          this.models.update(key, {like:like-1});
        }
      });
  }

  deleteModel (key:string, imageURL:string, modelURL:string)
  {
    let imgDelRef = this.firebase.storage().refFromURL(imageURL);
    let modelDelRef = this.firebase.storage().refFromURL(modelURL);

    //remove database entry then files
    this.db.list(`/likedModelsPerUser/${this.authState.uid}/`).remove(key);
    this.db.list(`/modelsPerUser/${this.authState.uid}/`).remove(key);

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
      let uploadTask = this.firebase.storage().ref(`${this.authState.uid}/${itemKey}/images/${imageFileName}`).put(imagefile);
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
      let uploadTask = this.firebase.storage().ref(`${this.authState.uid}/${itemKey}/models/${modelFileName}`).put(modelfile);
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
      let uploadTask = this.firebase.storage().ref(this.authState.uid+'/'+itemKey+`/images/${imageFileName}`).put(imagefile);
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


  uploadImage2(key , model: CadModel) : Promise<any>
  {
    let dbUser = this.db.list(`/models/`);
    let rawFirebaseAuth = this.rawFirebaseAuth;
    let storagePath = `${this.userService.currentUserId}/${key}/images/${model.image.name}`

    return new Promise ((resolve, reject) =>
    {
      this.fileService.uploadFile(storagePath, model.image.file)
        .then((uploadURL) =>
          {
            model.image.URL = uploadURL;

            dbUser.update(key, model)
              .then((success) =>
                {
                  resolve("Success changing image ");
                })
              .catch((err) =>
                {
                  console.log (err)
                  reject (err);
                });
            })
          .catch ((err) =>
            {
              console.log (err);
              reject(err);
            })
          });
      }

      uploadModel2(key , model: CadModel) : Promise<any>
      {
        let dbUser = this.db.list(`/models/`);
        let rawFirebaseAuth = this.rawFirebaseAuth;
        let storagePath = `${this.userService.currentUserId}/${key}/models/${model.model.name}`

        return new Promise ((resolve, reject) =>
        {
          this.fileService.uploadFile(storagePath, model.model.file)
            .then((uploadURL) =>
              {
                model.model.URL = uploadURL;

                dbUser.update(key, model)
                  .then((success) =>
                    {
                      resolve("Success changing model ");
                    })
                  .catch((err) =>
                    {
                      console.log (err)
                      reject (err);
                    });
                })
              .catch ((err) =>
                {
                  console.log (err);
                  reject(err);
                })
              });
          }














  uploadModel(modelFileName, modelfile, itemKey)
  {
    let models = this.models;

    let promise = new Promise((res,rej) =>
    {
      let uploadTask = this.firebase.storage().ref(this.authState.uid+'/'+itemKey+`/models/${modelFileName}`).put(modelfile);

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
