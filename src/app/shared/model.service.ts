import { Injectable, Inject } from '@angular/core';
import { Http, Response, ResponseContentType, Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/do';
import { Observable, Subject } from 'rxjs/Rx';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { UserService } from './user.service';
import { FileService} from './fbStorage.service';
import { ModelItem } from './ModelItem.model'
import { FileItem } from './FileItem.model'

//this is the modelservice for model realated transactions in firebase
//
@Injectable()
export class ModelService
{
  dbModels : FirebaseListObservable <any> = null;

  constructor( private db: AngularFireDatabase, private http: Http, private userService: UserService, private fileService: FileService)
  {
    // sets refernece to models
    this.dbModels = this.db.list('/models');
  }

  // gets models all models with query and pagination
  getModelsList(query={}): FirebaseListObservable <any>
  {
    return this.db.list('/models', { query: query });
  }

  // gets the models that belong to user
  getEditModels(): Observable <ModelItem>
  {
    return this.getModelsForModelsKeys(this.getModelsKeysPerUser())
  }

  // gets the liked models per user
  getLikedModels(): Observable <any>
  {
    return this.getModelsForModelsKeys(this.getLikedModelsKeysPerUser())
  }

  // gets models for specified keys
  getModelsForModelsKeys(modelsKeys: Observable <string[]>): Observable <any>
  {
    return modelsKeys.map(mpu => mpu.map(modelKey => this.db.object(`models/`+ modelKey)))
      .flatMap(fbojs =>Observable.combineLatest(fbojs));
  }

  // gets the model keys for models per user
  getModelsKeysPerUser() : Observable <string[]>
  {
    return this.db.list(`/modelsPerUser/${this.userService.currentUserId}`, {preserveSnapshot: true})
      /*.do(val => this.log("val: ",val))*/
      .map(mspu => mspu.map(mpu=>mpu.key));
  }

  // gets the models keys for liked models per user
  getLikedModelsKeysPerUser() : Observable <string[]>
  {
    return this.db.list(`/likedModelsPerUser/${this.userService.currentUserId}`, {preserveSnapshot: true}).first()
      /*.do(val => this.log("val: ",val))*/
      .map(lmspu => lmspu.map(lmpu=>lmpu.key));
  }

  // get model by key
  getModelByKey(key: string): Promise <ModelItem>
  {
    return this.db.object(`/models/${key}`).first().toPromise().then().catch();
  }

  // get model Data per http get request
  getModelData (modelURL: string): Promise <any>
  {
    return this.http.get(modelURL, { responseType: ResponseContentType.Text})
     .map(response => response.text()).toPromise()
  }

  // get binary model Data per http get request
  getModelDataBinary (modelURL: string): Promise <any>
  {
    return this.http.get(modelURL, { responseType: ResponseContentType.ArrayBuffer})
     .map(response => response.arrayBuffer()).toPromise()
  }

  // Create a new model in firebase database and storage
  //
  createModel (model: ModelItem) : Promise <any>
  {
    // assigns the model to currentUserId
    model.userId = this.userService.currentUserId;

    return new Promise((resolve, reject) =>
    {
      // push data into datbase and go ahead if no error
      this.dbModels.push(model)
        .then((item) =>
          {
            // update models per user => then you know which model belongs to the user
            this.db.object (`/modelsPerUser/${this.userService.currentUserId}/${item.key}`).set(true);

            this.uploadImage(item.key, model)
              .then(() =>
              {
                this.uploadModel(item.key, model).then(()=>resolve('created model')).catch((err)=>reject(err))
              })
              .catch((err) => reject(err))
          }).catch((err) => reject (err.message))
    })
  }

  // Update the model database in firebase
  //
  updateModel(key: string, model: ModelItem) : Promise <any>
  {
    return new Promise((resolve, reject) =>
      {
        this.dbModels.update(key, model).then((success) => resolve("updated model")).catch((err) => reject (err));
      })
  }

  // deletes the whole model in database and all files in storage
  //
  deleteModel (key: string, imageName: string, modelName: string)
  {
    this.dbModels.remove(key)
      .then(()=>
        {
          this.db.list(`/likedModelsPerUser/${this.userService.currentUserId}/`).remove(key);
          this.db.list(`/modelsPerUser/${this.userService.currentUserId}/`).remove(key);

          this.deleteImageFile(key, imageName)
            .then((success) =>
              {
                this.log("deleted image")
              }).catch((err) => {this.log(err)})

          this.deleteModelFile(key, modelName)
            .then((success) =>
              {
                this.log("deleted model")
              }).catch((err) => {this.log(err)})
        })
  }

  // deletes the model in storage and db
  //
  deleteModelFile(key: string, name: any) : Promise <any>
  {
    let storagePath = `${this.userService.currentUserId}/${key}/files/${name}`;
    let dbPath =`/models/${key}/model`

    return new Promise((resolve, reject) =>
    {
      this.fileService.deleteFile2(storagePath, dbPath).then((success) => resolve(success)).catch((err) =>reject(err));
    })
  }

  // deletes the image in storage and db
  //
  deleteImageFile(key: string, name: any) : Promise <any>
  {
    let storagePath = `${this.userService.currentUserId}/${key}/files/${name}`;
    let dbPath = `/models/${key}/image`

    return new Promise((resolve, reject) =>
    {
      this.fileService.deleteFile2(storagePath, dbPath).then((success) => resolve(success)).catch((err) =>reject(err));
    })
  }

  // Uploads image to storage and database
  //
  uploadImage(key: string , model: ModelItem) : Promise <any>
  {
    return new Promise ((resolve, reject) =>
    {
      let storagePath =`${this.userService.currentUserId}/${key}/files/${model.image.file.name}`
      let dbPath =`/models/${key}/image`

      this.fileService.uploadFile2(model.image, storagePath, dbPath)
      .then((fileItem)=> resolve(`uploaded image ${fileItem.name}`))
      .catch((err)=> reject(err))
    });
  }

    // Uploads model to storage and database
    //
    uploadModel(key: string, model: ModelItem) : Promise <any>
    {
      return new Promise ((resolve, reject) =>
      {
        let storagePath =`${this.userService.currentUserId}/${key}/files/${model.model.file.name}`
        let dbPath =`/models/${key}/model`

        this.fileService.uploadFile2(model.model, storagePath, dbPath)
        .then((fileItem)=> resolve(`uploaded model ${fileItem.name}`))
        .catch((err)=> reject(err))
      });
    }

    // Update the likes in firebase
    //
    updateLike(key: string, like: number)
    {
      this.db.object(`/likedModelsPerUser/${this.userService.currentUserId}/${key}`).first().toPromise().then((data) =>
        {
          if (data.$value == null)
          {
            this.db.object(`/likedModelsPerUser/${this.userService.currentUserId}/${key}`).set(true);
            this.dbModels.update(key, {like:like+1});
          }
          else
          {
            this.db.object(`/likedModelsPerUser/${this.userService.currentUserId}/${key}`).remove();
            this.dbModels.update(key, {like:like-1});
          }
        });
    }

    // log function
    private log(txt: string)
    {
      console.log(`[ModelService]: ${txt}`)
    }

//end of class
}
