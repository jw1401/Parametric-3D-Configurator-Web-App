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
    this.dbModels = this.db.list('/models');
  }

  getModelsList(query={}): FirebaseListObservable <any>
  {
    return this.db.list('/models', { query: query });
  }

  getEditModels(): Observable <any>
  {
    return this.getModelsForModelsKeys(this.getModelsKeysPerUser())
  }

  getLikedModels(): Observable <any>
  {
    return this.getModelsForModelsKeys(this.getLikedModelsKeysPerUser())
  }

  getModelsForModelsKeys(modelsKeys: Observable <string[]>): Observable <any>
  {
    return modelsKeys.map(mpu => mpu.map(modelKey => this.db.object(`models/`+ modelKey)))
      .flatMap(fbojs =>Observable.combineLatest(fbojs));
  }

  getModelsKeysPerUser() : Observable <string[]>
  {
    return this.db.list(`/modelsPerUser/${this.userService.currentUserId}`, {preserveSnapshot: true})
      /*.do(val => console.log("val: ",val))*/
      .map(mspu => mspu.map(mpu=>mpu.key));
  }

  getLikedModelsKeysPerUser() : Observable <string[]>
  {
    return this.db.list(`/likedModelsPerUser/${this.userService.currentUserId}`, {preserveSnapshot: true}).first()
      /*.do(val => console.log("val: ",val))*/
      .map(lmspu => lmspu.map(lmpu=>lmpu.key));
  }

  getModelByKey(key: string): Promise <ModelItem>
  {
    return this.db.object(`/models/${key}`).first().toPromise().then().catch();
  }

  getModelData (modelURL: string): Promise <any>
  {
    return this.http.get(modelURL, { responseType: ResponseContentType.Text})
     .map(response => response.text()).toPromise()
  }

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
    let errorMessage = "Ooops something went wrong!";

    return new Promise((resolve, reject) =>
    {
      // push data into datbase and go ahead if no error
      this.dbModels.push(model)
        .then((item) =>
          {
            // update models per user => then you know which model belongs to the user
            this.db.object (`/modelsPerUser/${this.userService.currentUserId}/${item.key}`).set(true);

            this.uploadImage(item.key, model).then(() =>
            {
              this.uploadModel(item.key, model).then(()=>resolve('created model')).catch((err)=>reject(err))
            }).catch((err) => reject(err))
          }).catch((err) => {console.log(err); reject (errorMessage);})
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
                console.log("deleted image")
              }).catch((err) => {console.log(err)})

          this.deleteModelFile(key, modelName)
            .then((success) =>
              {
                console.log("deleted model")
              }).catch((err) => {console.log(err)})
        })
  }

  // deletes the model in storage and db
  //
  deleteModelFile(key: string, name: any) : Promise <any>
  {
    let storagePath = `${this.userService.currentUserId}/${key}/models/${name}`;
    let dbPath =`/models/${key}/model`

    return new Promise((resolve, reject) =>
    {
      this.fileService.deleteFile2(storagePath, dbPath).then((success) => resolve("deleted " + name)).catch((err) =>reject(err));
    })
  }

  // deletes the image in storage and db
  //
  deleteImageFile(key: string, name: any) : Promise <any>
  {
    let storagePath = `${this.userService.currentUserId}/${key}/images/${name}`;
    let dbPath = `/models/${key}/image`

    return new Promise((resolve, reject) =>
    {
      this.fileService.deleteFile2(storagePath, dbPath).then(() => resolve("deleted " + name)).catch((err) =>reject(err));
    })
  }


  // Uploads image to storage and database
  //
  uploadImage(key: string , model: ModelItem) : Promise <any>
  {
    return new Promise ((resolve, reject) =>
    {
      let storagePath =`${this.userService.currentUserId}/${key}/images/${model.image.file.name}`
      let dbPath =`/models/${key}/image`

      this.fileService.uploadFile2(model.image, storagePath, dbPath).then(()=>resolve('uploaded image')).catch((err)=> reject(err))
    });
  }

    // Uploads model to storage and database
    //
    uploadModel(key: string, model: ModelItem) : Promise <any>
    {
      return new Promise ((resolve, reject) =>
      {
        let storagePath =`${this.userService.currentUserId}/${key}/models/${model.model.file.name}`
        let dbPath =`/models/${key}/model`

        this.fileService.uploadFile2(model.model, storagePath, dbPath).then(()=>resolve('uploaded image')).catch((err)=> reject(err))
      });
    }

    // Update the likes in firebase
    //
    updateLike(key: string, like: number)
    {
      let item = this.db.object(`/likedModelsPerUser/${this.userService.currentUserId}/${key}`).first().single().subscribe((data) =>
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

//end of class
}
