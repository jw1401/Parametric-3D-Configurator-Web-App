import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { FileItem } from './FileItem.model'
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';


//this is the file-service for firebase storage
//
@Injectable()
export class FileService
{

  constructor(private db: AngularFireDatabase)
  {}

  // uploads file to storage and database
  //
  uploadFile2(fileItem: FileItem, storagePath, dbPath) : Promise <any>
  {
    let storageRef = firebase.storage().ref(storagePath)

    return new Promise((resolve,reject) =>
    {
      let uploadTask = storageRef.put(fileItem.file);

      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) =>
        {
          // upload in progress
          fileItem.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
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
          fileItem.url = uploadTask.snapshot.downloadURL;
          fileItem.name = fileItem.file.name;
          fileItem.file.type !="" ? fileItem.type = fileItem.file.type : null

          this.log(`uploaded ${fileItem.name}`);
          this.saveFileDataToDatabase(fileItem, dbPath).then(()=> resolve(fileItem)).catch((err)=> reject(err.message));
          });
      });
    }

    // saves file in db
    //
    private saveFileDataToDatabase(fileItem: FileItem, dbPath: string)
    {
      return this.db.object(`${dbPath}`).update(fileItem)
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
            this.log(`deleted Storage ${storagePath} //// and Database ${dbPath}`)
            resolve ('deleted File')
          })
          .catch((err)=>
          {
            this.log(err.message)
            reject (err.message)
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

// class end
}
