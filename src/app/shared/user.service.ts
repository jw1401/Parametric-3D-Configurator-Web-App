import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { FileService} from './fbStorage.service';
import { User, Upload } from './user.model';
import { File } from './File.model'


//this is the user-service for the user-dashboard
//
@Injectable()
export class UserService
{
  authState: any = null;
  rawFirebaseAuth : any;
  subscriber : any;

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private fileService : FileService)
  {
    this.subscriber = afAuth.authState.subscribe((auth) =>
    {
      this.authState = auth;

      if(this.authState)
      {
        this.log("User Service active for " + this.authState.email);
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
          this.log("User data saved");
          resolve ("User data saved")
        })
        .catch((err)=>
        {
          this.log(err.message)
          reject (err);
        });
    }) : null
  }

  // upodate the account name in the firebase auth User Object
  updateAccountName(name : any) : Promise<any>
  {
    return this.rawFirebaseAuth.currentUser.updateProfile({displayName: name})
      .then((success) =>
      {
        this.log('Account name updated');
        return Promise.resolve ("Account name updated")
      })
      .catch((err) =>
      {
        this.log(err);
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
                  this.log("Email changed")
                  resolve("Email changed");
                })
              .catch((err) =>
                {
                  this.log(err)
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
                  this.log("Password changed")
                  resolve("Password changed")
                })
              .catch((err) =>
                {
                  this.log(err)
                  reject(err);
                })
          });
    });
  }

  uploadProfilePicture(file : File) : Promise<any>
  {
    let storagePath = `${this.currentUserId}/userData/${file.file.name}`
    let dbPath = `/users/${this.currentUserId}/photo`

    return new Promise ((resolve, reject) =>
    {
      this.fileService.dbBasePath = dbPath;
      this.fileService.storagePath =storagePath;

      this.fileService.uploadFile2(file).then((success) =>{

        resolve(success.file.name)
      }).catch((err) => reject(err))
    });
  }

    deleteProfilePicture(file : File) : Promise<any>
    {
      let storagePath = `${this.currentUserId}/userData/${file.name}`
      let dbPath = `/users/${this.currentUserId}/photo`

      return new Promise ((resolve, reject) =>
      {
        try
        {
          this.fileService.dbBasePath = dbPath;
          this.fileService.storagePath = storagePath;
          this.fileService.deleteFile2(file)
          resolve()
        }
        catch(e)
        {
          this.log(e)
          reject(e)
        }
      })
    }

private log(txt: string)
{
  console.log(`[UserService]: ${txt}`)
}

// class end
}
