import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Upload } from './user.model';


//this is the file-service for firebase storage
//
@Injectable()
export class FileService
{

  constructor()
  {}

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
