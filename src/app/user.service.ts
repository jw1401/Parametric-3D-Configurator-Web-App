import { Injectable,Inject } from '@angular/core';
import {Router} from '@angular/router';
import { AngularFire, FirebaseApp,FirebaseObjectObservable  } from 'angularfire2';

//this is the user-service for the user-dashboard
@Injectable()
export class UserService
{
  public auth: any;
  public error:any;
  public userData:any;

  public  firebase:any;

  private user: FirebaseObjectObservable<any>;

  public imageFile={"name":'', "file":'',"type":''};

  constructor(@Inject(FirebaseApp) firebaseApp: any, private af: AngularFire)
  {
    this.auth = firebaseApp.auth();
    this.af.auth.subscribe(auth =>
    {
      console.log("UserService active");
      this.userData = auth;
    });
    this.user =af.database.object('/users/'+this.userData.uid);
    this.firebase = firebaseApp;
  }

  getPhotoURL () : Promise<any>
  {
    return Promise.resolve(this.userData.auth.photoURL);
  }

  updateUser(userData: any)
  {
    if(userData.valid)
    {
      this.auth.currentUser.updateProfile(userData.value)
        .then((success) => {
          console.log('Success');
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }

  updateEmail(emailData: any) : Promise<any>
  {
    if(emailData.valid)
    {
      console.log(emailData.value);
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
    else{return Promise.reject("big Error in changeEmail");}
  }

  updatePassword(passwordData: any) : Promise<any>
  {
    if(passwordData.valid)
    {
      return this.auth.currentUser.updatePassword(passwordData.value.newpassword).then((sucess) =>
      {
        return Promise.resolve("Password changed")
      }).catch((error) =>
      {
        return Promise.reject(error);
      })
    }
    else {return Promise.reject("Big Error in update Password");}
  }

  uploadImage(imageFileName, imagefile)
  {
        let user = this.user;
        let auth =this.auth;

        // todo: implement to delete the user photo first on image change
        let promise = new Promise((res,rej) =>
        {
            let uploadTask = this.firebase.storage().ref(this.userData.uid+`/userData/${imageFileName}`).put(imagefile);

            uploadTask.on('state_changed', function(snapshot){}, function(error){rej(error);},
            function()
            {
              var downloadURL = uploadTask.snapshot.downloadURL;
              res(downloadURL);

              auth.currentUser.updateProfile({photoURL: downloadURL});

              user.set({photoURL: downloadURL}).then((user)=>{}).catch((err)=>
              {
                this.error = err;
                console.log(err)
              });
            });
        });
        return promise;
    }
}
