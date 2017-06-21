import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { FileItem } from './FileItem.model'
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';


//this is the file-service for firebase storage
//
@Injectable()
export class FileService
{

  private _dbBasePath: string;
  private _storageBasePath: string;


  constructor(private db: AngularFireDatabase)
  {}

  set dbBasePath(path)
  {
    this._dbBasePath=path;
  }

  set storageBasePath(path)
  {
    this._storageBasePath=path;
  }

  // uploads file to storage and database
  //
  uploadFile2(file: FileItem, storagePath, dbPath) : Promise<any>
  {
    let storageRef = firebase.storage().ref(storagePath)

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
          file.file.type !="" ? file.type = file.file.type : null

          this.log(`uploaded ${file.name}`);
          this.saveFileDataToDatabase(file, dbPath).then(()=> resolve(file)).catch((err)=> reject(err.message));
          });
      });
    }

    // saves file in db
    //
    private saveFileDataToDatabase(file: FileItem, dbPath: string)
    {
      return this.db.object(`${dbPath}`).update(file)
    }

    // deletes file in storage and database
    //
    public deleteFile2 (storagePath: string, dbPath: string) : Promise<any>
    {
      return new Promise((resolve, reject) =>
      {
        this.deleteFileDataInDatabase(dbPath).then(()=>
        {
          this.deleteFileInStorage(storagePath).then(() =>
          {
            this.log(`deleted Storage ${storagePath} and Database ${dbPath}`)
            resolve('deleted File')
          })
          .catch((err)=>
          {
            this.log(err.message)
            reject(err.message)
          })
        })
        .catch((err)=>
        {
          this.log(err.message)
          reject (err.message)
        })
      })
    }

    // deletes file in database
    //
    private deleteFileDataInDatabase(dbPath: string)
    {
      return this.db.object(`${dbPath}`).remove()
    }

    // dletes file in storagePath
    //
    private deleteFileInStorage(storagePath: string)
    {
      let storageRef = firebase.storage().ref();
      return storageRef.child(storagePath).delete()
    }

    private log (txt: string)
    {
      console.log(`[fbStorageService]: ${txt}`);
    }

  // upload a file with full firebase storage Path and file data
  // returns a Promise : resolves with the upload URL or rejects on error
  //
  /*
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
    }*/


// class end
}
