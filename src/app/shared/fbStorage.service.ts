import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Upload } from './user.model';
import { File } from './file.model'

import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';


//this is the file-service for firebase storage
//
@Injectable()
export class FileService
{

  private _dbBasePath: string;
  private _storagePath: string;

  constructor(private db: AngularFireDatabase)
  {}

  set dbBasePath (path)
  {
    this._dbBasePath = path
  }

  set storagePath (path)
  {
    this._storagePath = path
  }



  uploadFile2(file: File) : Promise<any>
  {
    let storageRef = firebase.storage().ref(this._storagePath)

    return new Promise((resolve,reject) =>
    {
      let uploadTask = storageRef.put(file.file);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) =>
        {
          // upload in progress
          file.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        },
        (err) =>
        {
          // upload error
          this.log(err.message);
          reject (err.message);
        },
        ()=>
        {
          // upload success
          file.url = uploadTask.snapshot.downloadURL;
          file.name = file.file.name;
          file.type = file.file.type

          this.log(`${file.name} uploaded`);
          this.saveFileDataToDatabase(file);
          resolve (file);
          });
      });
    }

    private saveFileDataToDatabase(file: File) : Promise<any>
    {
      return new Promise ((resolve, reject) => {
        this.db.object(`${this._dbBasePath}`).update(file).then(()=> {
          this.log('save File Data To Database');
          resolve ();
        }).catch((err) =>{
          this.log(err.message)
          reject();
        })
      });
    }

    private deleteFileDataInDatabase()
    {
      return new Promise ((resolve, reject) => {
        this.db.object(`${this._dbBasePath}`).remove().then(()=> {
          this.log('deleted File Data In Database');
          resolve ();
        }).catch((err) =>{
          this.log(err.message)
          reject();
        })
      });
    }

    private deleteFileInStorage()
    {
      let storageRef = firebase.storage().ref();

      return new Promise ((resolve, reject) => {
        storageRef.child(this._storagePath).delete().then(()=> {
          this.log('deleted File In Storage');
          resolve ();
        }).catch((err) => {
          this.log(err.message)
          reject();
        })
      });
    }

    public deleteFile2 (file: File) : Promise<any>
    {
      return new Promise((resolve, reject) =>
      {
        this.deleteFileDataInDatabase().then(()=>{
          this.deleteFileInStorage().then(() =>{
            this.log("deleted File in storage and db" + file.name)
            resolve()
          }).catch((err)=> this.log(err));
        }).catch((err)=> this.log(err));
      })
    }



    private log (txt: string)
    {
      console.log(`[fbStorageService]: ${txt}`);
    }







  // upload a file with full firebase storage Path and file data
  // returns a Promise : resolves with the upload URL or rejects on error
  //
  uploadFile(storagePath : string, file : any) : Promise<any>
  {
    let storageRef = firebase.storage().ref(storagePath)

    return new Promise((resolve,reject) =>
    {
      let uploadTask = storageRef.put(file);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) =>
        {
          // upload in progress
        },
        (err) =>
        {
          // upload error
          console.log(err);
          reject(err);
        },
        ()=>
        {
          // upload success
          let uploadURL = uploadTask.snapshot.downloadURL;
          console.log("Upload task with URL " + uploadURL + " successfull");
          resolve (uploadURL);
          });
      });
    }

    // delete a file in firebase storage with full storagePath
    // returns a Promise : resolves with success or rejects on error
    //
    public deleteFile (storagePath: string) : Promise<any>
    {
      let storageRef = firebase.storage().ref();

      return new Promise((resolve, reject) =>
      {
        storageRef.child(storagePath).delete()
          .then((success) =>
            {
              console.log("Deleting file successfull");
              resolve(success);
            })
          .catch((err) =>
            {
              reject(err);
            });
        })
    }


// class end
}
