import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

import { User, Upload } from './user.model';


//this is the user-service for the user-dashboard
//
@Injectable()
export class UserService
{
  authState: any = null;
  rawFirebaseAuth : any;
  userModel : User;
  subscriber : any;

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private router: Router)
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
  get CurrentUserData() :  Promise<User>
  {
    return this.authenticated ? this.db.object(`/users/${this.currentUserId}`).first().toPromise() : null;
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
  updateAccountName(accountData:any) : Promise<any>
  {
    return this.rawFirebaseAuth.currentUser.updateProfile({displayName: accountData.value.accountName})
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
  updateAccountEmail(emailData: any) : Promise<any>
  {
    return this.rawFirebaseAuth.currentUser.updateEmail(emailData.value.email)
      .then((success) =>
      {
        return Promise.resolve("Success changing email");
      })
      .catch((err) =>
      {
        return Promise.reject(err);
      })
  }

  // upodate the account password
  updateAccountPassword(passwordData: any) : Promise<any>
  {
    return this.rawFirebaseAuth.currentUser.updatePassword(passwordData.value.newpassword)
      .then((success) =>
      {
        return Promise.resolve("Success changing password")
      })
      .catch((err) =>
      {
        return Promise.reject(err);
      })
  }

  uploadProfilePicture(upload : Upload) : Promise<any>
  {
    let dbUser = this.db.object(`/users/${this.currentUserId}/photo`);
    let storageRef = firebase.storage().ref(this.currentUserId+`/userData/${upload.name}`)
    let rawFirebaseAuth = this.rawFirebaseAuth;

    // todo: implement to delete the user photo first on image change
    return new Promise((resolve,reject) =>
    {
      let uploadTask = storageRef.put(upload.file);

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
          console.log("Profile picture upload task with URL " + uploadURL + " successfull");

          // update user DB with uploadFile Data
          upload.photoURL = uploadURL;
          dbUser.update(upload)
            .then((user) =>
            {
              rawFirebaseAuth.currentUser.updateProfile({photoURL: uploadURL}); // update auth object with photoURL
              resolve("Success changing profile picture");
            })
            .catch((err) =>
            {
              console.log(err)
              reject(err);
            });
          });
      });
    }

    deleteProfilePicture(name : any)
    {
      let dbUser = this.db.object(`/users/${this.currentUserId}/photo`);

      dbUser.remove()
        .then(success =>
          {
            console.log("Success removing photo node from user db");
            this.deleteFileStorage(name);
          })
          .catch(err =>
          {
            console.log(err);
          })
    }

    private deleteFileStorage (name: any)
    {
      let storageRef = firebase.storage().ref();
      storageRef.child(`${this.currentUserId}/userData/${name}`).delete();
    }

    unsubscribeUser()
    {
      this.subscriber.unsubscribe();
      this.authState=null;
    }


// class end
}
