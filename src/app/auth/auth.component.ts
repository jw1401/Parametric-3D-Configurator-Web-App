import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
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
      this.afAuth.auth.createUserWithEmailAndPassword(formData.value.email,formData.value.password)
        .then((success) =>
          {
            console.log(success);
            this.router.navigate(['/dashboard'])
          })
        .catch((err) =>
          {
            console.log(err);
            this.error=err;
            //this.router.navigate(['/login']);
          })
    }
    else
    {
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
      this.afAuth.auth.signInWithEmailAndPassword(formData.value.email, formData.value.password)
        .then((success) =>
          {
            console.log("success");
            this.router.navigate(['/dashboard']);
          })
        .catch((err) =>
          {
            console.log(err);
            this.error=err;
            this.router.navigate(['/dashboard']);
          })
    }
    else
    {
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

  constructor(private afAuth: AngularFireAuth)
  {
  }

  onSubmit(formData)
  {
     if(formData.valid)
     {
       this.afAuth.auth.sendPasswordResetEmail(formData.value.email)
        .then( (response) =>
          {
            console.log('Sent successfully');
            this.message = 'Check your email for reset link';
          })
        .catch((error) =>
          {
            this.message = error;
            console.log(error);
          })
     }
  }
}
