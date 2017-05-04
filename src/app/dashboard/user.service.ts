import { Injectable,Inject } from '@angular/core';
import {Router} from '@angular/router';
import { AngularFire, FirebaseApp,FirebaseObjectObservable  } from 'angularfire2';
import {UserModel} from './user-model';

//this is the user-service for the user-dashboard
@Injectable()
export class UserService
{
  public auth: any;
  public error:any;
  public userData:any;

  public userModel = new UserModel("","","","");
  public  firebase:any;

  private user: FirebaseObjectObservable<any>;

  public imageFile={"name":'', "file":'',"type":''};

  constructor(@Inject(FirebaseApp) firebaseApp: any, private af: AngularFire)
  {
    this.auth = firebaseApp.auth();

    this.af.auth.subscribe(auth =>
    {
      this.userData = auth;
      console.log("UserService active");
    });

    //this.user =af.database.object('/users/'+this.userData.uid);
    this.firebase = firebaseApp;
  }

  getUserData () : Promise<any>
  {
    this.af.auth.take(1).subscribe(auth =>
    {
      if (auth!=null)
      {
        this.userData = auth;
        this.user =this.af.database.object('/users/'+this.userData.uid);
        this.user.take(1).subscribe(data=>
          {
            this.userModel.name = data.name;
            this.userModel.country =data.country;
            this.userModel.bio =data.bio;
            this.userModel.image = this.userData.auth.photoURL;
          });
        }
    });

    return Promise.resolve(this.userModel);
  }

  updateUser(userData: any)
  {
    if(userData.valid)
    {
      this.user.update({name: userData.value.displayName, country: userData.value.country, bio:userData.value.bio}).then((user)=>{}).catch((err)=>
      {
        this.error = err;
        console.log(err)
      });
    }
  }

  updateAccountName(accountData:any)
  {
    if(accountData.valid)
    {
      this.auth.currentUser.updateProfile({displayName: accountData.value.accountName})
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
        let auth = this.auth;

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
