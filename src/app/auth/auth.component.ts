import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
//import { AngularFire, FirebaseApp, AuthMethods, AuthProviders } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
//import { environment } from '../environments/environment';

// Do not import from 'firebase' as you'd lose the tree shaking benefits
import * as firebase from 'firebase/app';


@Component({
  templateUrl: './signup.component.html'
})

export class SignupComponent
{
  public error: any;

  constructor(private afAuth: AngularFireAuth, private router: Router)
  {
  }

  onSubmit(formData)
  {
    if(formData.valid)
    {
      //console.log(formData.value);
      this.afAuth.auth.createUserWithEmailAndPassword(formData.value.email,formData.value.password).then(
        (success) => {
        console.log(success);
        this.router.navigate(['/login'])
      }).catch(
        (err) => {
        console.log(err);
        this.error=err;
        //this.router.navigate(['/login']);
      })
    } else {
      this.error = 'Your form is invalid';
    }
  }
}

@Component({
  templateUrl: './login.component.html'
})

export class LoginComponent
{
  public error: any;

  constructor(private afAuth: AngularFireAuth, private router: Router)
  {
  }

  onSubmit(formData)
  {
    if(formData.valid)
    {
      //console.log(formData.value);
      this.afAuth.auth.signInWithEmailAndPassword(formData.value.email, formData.value.password).then(
        (success) => {
        console.log("success");
        this.router.navigate(['/dashboard']);
      }).catch(
        (err) => {
        console.log(err);
        this.error=err;
        this.router.navigate(['/dashboard']);
      })
    } else {
      this.error = 'Your form is invalid';
    }
  }
}

@Component({
  templateUrl: './resetpassword.component.html'
})

export class ResetpassComponent
{
  public auth: any;
  public message: any;

  constructor(private afAuth: AngularFireAuth, /*@Inject(FirebaseApp) firebaseApp: any*/)
  {
    //this.auth = firebaseApp.auth()
    //console.log(this.auth);
  }

  onSubmit(formData)
  {
     if(formData.valid)
     {
       console.log('Submission worked');
       this.afAuth.auth.sendPasswordResetEmail(formData.value.email)
         .then( (response) => {
           console.log('Sent successfully');
           this.message = 'Check your email for reset link';
         })
         .catch( (error) => {
           this.message = error;
           console.log(error);
         })
     }
  }
}
