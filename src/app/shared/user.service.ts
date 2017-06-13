import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { FileService} from './fbStorage.service';
import { User, Upload } from './user.model';


//this is the user-service for the user-dashboard
//
@Injectable()
export class UserService
{
  authState: any = null;
  rawFirebaseAuth : any;
  subscriber : any;

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private router: Router, private fileService : FileService)
  {
    this.subscriber = afAuth.authState.subscribe((auth) =>
    {
      this.authState = auth;

      if(this.authState)
      {
        console.log("User Service active for " + this.authState.email);
      }
    });

    this.rawFirebaseAuth = firebase.auth();
  }

  get authenticated(): boolean
  {
    return this.authState !== null;
  }

  // Returns current user data
  get currentUser(): any
  {
    return this.authenticated ? this.authState : null;
  }

  // Returns Observable
  get currentUserObservable(): any
  {
    return this.afAuth.authState
  }

  // Returns current user UID
  get currentUserId(): string
  {
    return this.authenticated ? this.authState.uid : '';
  }

  // Gets the UserData from db of current user
  get currentUserData() :  FirebaseObjectObservable <any>
  {
    return this.authenticated ? this.db.object(`/users/${this.currentUserId}`) : null;
  }

  // Gets an specific user by id
  getUserById (id: string) : Promise<User>
  {
    return this.db.object(`/users/${id}`).first().toPromise()
  }

  // Updates the UserData in the db
  updateUserData(user: User) : Promise<any>
  {
    let dbUser = this.db.object(`/users/${this.currentUserId}`);

    return this.authenticated ? new Promise((resolve, reject) =>
    {
      dbUser.update(user)  //{name: value, country: value, bio: value})
        .then((success)=>
        {
          console.log("Success");
          resolve ("Success saving user data")
        })
        .catch((err)=>
        {
          console.log(err)
          reject ("Error: " + err);
        });
    }) : null
  }

  // upodate the account name in the firebase auth User Object
  updateAccountName(name : any) : Promise<any>
  {
    return this.rawFirebaseAuth.currentUser.updateProfile({displayName: name})
      .then((success) =>
      {
        console.log('Success');
        return Promise.resolve ("Success updating account name")
      })
      .catch((err) =>
      {
        console.log(err);
        return Promise.reject (err);
      })
  }

  // upodate the account email in the firebase auth User Object
  updateAccountEmail(newEmail: any, email : any, password : any) : Promise <any>
  {
    const credential = firebase.auth.EmailAuthProvider.credential(email, password)

    return new Promise ((resolve, reject) =>
    {
      firebase.auth().currentUser.reauthenticateWithCredential(credential)
        .then(() =>
          {
            this.rawFirebaseAuth.currentUser.updateEmail(newEmail)
              .then((success) =>
                {
                  resolve("Success changing email");
                })
              .catch((err) =>
                {
                  reject(err);
                })
          });
    });
  }

  // upodate the account password
  updateAccountPassword(newPassword: any, email : any, password : any) : Promise<any>
  {
    const credential = firebase.auth.EmailAuthProvider.credential(email, password)

    return new Promise ((resolve, reject) =>
    {
      firebase.auth().currentUser.reauthenticateWithCredential(credential)
        .then(() =>
          {
            this.rawFirebaseAuth.currentUser.updatePassword(newPassword)
              .then((success) =>
                {
                  resolve("Success changing password")
                })
              .catch((err) =>
                {
                  reject(err);
                })
          });
    });
  }

  uploadProfilePicture(upload : Upload) : Promise<any>
  {
    let dbUser = this.db.object(`/users/${this.currentUserId}/photo`);
    let rawFirebaseAuth = this.rawFirebaseAuth;
    let storagePath = `${this.currentUserId}/userData/${upload.name}`

    return new Promise ((resolve, reject) =>
    {
      this.fileService.uploadFile(storagePath,upload.file)
        .then((uploadURL) =>
          {
            upload.URL = uploadURL;

            dbUser.update(upload)
              .then((success) =>
                {
                  rawFirebaseAuth.currentUser.updateProfile({photoURL: uploadURL}); // update auth object with photoURL
                  resolve("Success changing profile picture ");
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

    deleteProfilePicture(name : any)
    {
      let dbUser = this.db.object(`/users/${this.currentUserId}/photo`);
      let storagePath = `${this.currentUserId}/userData/${name}`;

      this.fileService.deleteFile(storagePath)
        .then((success) =>
          {
            dbUser.remove()
              .then((success) =>
                {
                  console.log("Success removing photo node from user db");
                })
                .catch(err =>
                {
                  console.log(err);
                })
          })
        .catch((err) =>
          {
            console.log(err);
          })

    }



// class end
}
