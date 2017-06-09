import { Injectable, Inject } from '@angular/core';
import {Router} from '@angular/router';
import {UserModel} from './user-model';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';

//this is the user-service for the user-dashboard
@Injectable()
export class UserService
{
  authState: any = null;
  rawFirebaseAuth : any;

  public error : any;

  public userModel : UserModel;

  private user : FirebaseObjectObservable<any>;


  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private router: Router)
  {
    afAuth.authState.subscribe((auth) =>
    {
      this.authState = auth;

      if(this.authState)
      {
        console.log("UserService active for " + this.authState.email);
        this.user = this.db.object(`/users/${this.authState.uid}`);
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

  // Returns
  get currentUserObservable(): any
  {
    return this.afAuth.authState
  }

  // Returns current user UID
  get currentUserId(): string
  {
    return this.authenticated ? this.authState.uid : '';
  }

  get CurrentUserData() : Promise<UserModel>
  {
    console.log("CurrentUserData()");
    return this.db.object(`/users/${this.authState.uid}`).first().toPromise();
  }

  getUserById (id: string) : Promise<UserModel>
  {
    return this.db.object(`/users/${id}`).first().toPromise();
  }

  /*getAuthData():any
  {
    return this.authState;
  }*/

  updateUser(user: any)
  {
    this.user.update({name: user.value.displayName, country: user.value.country, bio:user.value.bio}).then((user)=>{}).catch((err)=>
    {
      this.error = err;
      console.log(err)
    });
  }

  updateAccountName(accountData:any)
  {
    this.rawFirebaseAuth.currentUser.updateProfile({displayName: accountData.value.accountName})
      .then((success) => {
        console.log('Success');
      })
      .catch((error) => {
        console.log(error);
      })
  }

  updateEmail(emailData: any) : Promise<any>
  {
      return this.rawFirebaseAuth.currentUser.updateEmail(emailData.value.email)
        .then((success) =>
        {
          return Promise.resolve("Success in changeEmail ");
        })
        .catch((error) =>
        {
          return Promise.reject("Error in changeEmail " + error);
        })
  }

  updatePassword(passwordData: any) : Promise<any>
  {
    return this.rawFirebaseAuth.currentUser.updatePassword(passwordData.value.newpassword).then((sucess) =>
      {
        return Promise.resolve("Password changed")
      }).catch((error) =>
      {
        return Promise.reject(error);
      })
  }

  uploadImage(imageFileName, imagefile)
  {
        let user = this.user;
        let auth = this.rawFirebaseAuth;

        // todo: implement to delete the user photo first on image change
        let promise = new Promise((res,rej) =>
        {
            let uploadTask = firebase.storage().ref(this.authState.uid+`/userData/${imageFileName}`).put(imagefile);

            uploadTask.on('state_changed', function(snapshot){}, function(error){rej(error);},
            function()
            {
              var downloadURL = uploadTask.snapshot.downloadURL;
              res(downloadURL);

              auth.currentUser.updateProfile({photoURL: downloadURL});

              user.update({photoURL: downloadURL}).then((user)=>{}).catch((err)=>
              {
                this.error = err;
                console.log(err)
              });
            });
        });
        return promise;
    }
}
