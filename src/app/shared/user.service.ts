import { Injectable,Inject } from '@angular/core';
import {Router} from '@angular/router';
//import { AngularFire, FirebaseApp,FirebaseObjectObservable  } from 'angularfire2';
import {UserModel} from './user-model';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

import { Observable } from 'rxjs/Observable';

// Do not import from 'firebase' as you'd lose the tree shaking benefits
import * as firebase from 'firebase/app';

//this is the user-service for the user-dashboard
@Injectable()
export class UserService
{
  public auth : any;
  public error : any;
  public authData : any;
  public userModel : UserModel;
  public firebase : any;
  public isLoggedIn = false;
  private user : FirebaseObjectObservable<any>;

  private user1: Observable<firebase.User>;

  constructor(/*@Inject(FirebaseApp) firebaseApp: any,*/ private afAuth: AngularFireAuth, private db: AngularFireDatabase)
  {
    //this.user1=afAuth.authState;
    //console.log(this.user1);
    this.afAuth.authState.subscribe(auth =>
    {
      if(auth)
      {
        this.authData = auth;
        console.log("UserService active for " + this.authData.email);
        this.user = this.db.object(`/users/${this.authData.uid}`);
        this.isLoggedIn=true;
      }
      else {this.isLoggedIn=false;}
    });

    //this.firebase = firebaseApp;
    //this.auth = firebaseApp.auth();
  }

  getUser () : Promise<UserModel>
  {
    /*let user: any;
    this.afAuth.authState.subscribe(auth=>
      {
        if(auth)
        {
          user = this.db.object(`/users/${auth.uid}`).first().toPromise();

        }
      });*/
    console.log("Hallo");
    //console.log("Auth = " + this.authData.uid);
    //return user;
    return this.db.object(`/users/${this.authData.uid}`).first().toPromise();
  }

  getUserById (id: string) : Promise<UserModel>
  {
    return this.db.object(`/users/${id}`).first().toPromise();
  }

  getAuthData():any
  {
    return this.authData;
  }

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
    this.auth.currentUser.updateProfile({displayName: accountData.value.accountName})
      .then((success) => {
        console.log('Success');
      })
      .catch((error) => {
        console.log(error);
      })
  }

  updateEmail(emailData: any) : Promise<any>
  {
      return this.auth.currentUser.updateEmail(emailData.value.email)
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
    return this.auth.currentUser.updatePassword(passwordData.value.newpassword).then((sucess) =>
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
        let auth = this.auth;

        // todo: implement to delete the user photo first on image change
        let promise = new Promise((res,rej) =>
        {
            let uploadTask = this.firebase.storage().ref(this.authData.uid+`/userData/${imageFileName}`).put(imagefile);

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
