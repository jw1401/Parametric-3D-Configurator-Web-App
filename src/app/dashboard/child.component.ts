import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/user.service';
import { User, Upload } from '../shared/user.model'
import { FirebaseObjectObservable } from 'angularfire2/database';
import * as $ from 'jquery';

@Component
({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})

export class ProfileComponent
{
    public auth: any;
    public user : any;

    constructor(private userService: UserService)
    {
    }

    ngOnInit()
    {
      this.auth = this.userService.currentUser; // gets the authState Data
      this.user = this.userService.currentUserData; // gets the Observable for async pipe
    }
}

////////////////////////////////////////////////////////////////////////////////////////////7

@Component
({
  selector: 'profile',
  templateUrl: './account.component.html'
})

export class AccountComponent
{
  public error : any;
  public success: any;
  public user : User;

  subscription : any;
  upload : Upload;

  constructor(private userService: UserService, private router: Router)
  {
    this.user = new User();
    this.upload = new Upload();
    console.log(this.user);
  }

  ngOnInit()
  {
    this.subscription = this.userService.currentUserData.subscribe(data =>
      {
        this.user = data;
          console.log(this.user);
      });
  }

  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }

  fileImageChangeEvent(event: any)
  {
    this.success = null;
    this.error = null;

    this.upload.file = event.target.files[0];
    this.upload.name = event.target.files[0].name;
    this.upload.type = event.target.files[0].type;

    if (event.target.files && event.target.files[0] && event.target.files[0].type.match('image/*'))
    {
      var reader = new FileReader();
      reader.onload = (event:any) => {this.user.photo.URL = event.target.result;}
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  UpdateUser(userForm: any)
  {
    this.success = null;

    if (userForm.valid)
    {
      console.log(this.user)
      this.userService.updateUserData(this.user)
        .then((success) => { this.showSuccess(success); })
        .catch((err) => { this.error = err; console.log(err) });

      if (this.upload.name != undefined && this.upload.name != this.user.photo.name)
      {
        if (this.upload.type.match('image/*'))
        {
          this.user.photo != null ? this.userService.deleteProfilePicture(this.user.photo.name)
            .then((success) =>
            {
              this.userService.uploadProfilePicture(this.upload)
                .then((success) => { this.showSuccess(success); })
                .catch((err) => { this.error = err });
            })
            .catch((err) => this.error = err) : undefined



        } else this.error = "Only images...";
      }
    }
  }

  updateAccount(accountForm : any)
  {
    this.success = null

    if (accountForm.valid)
    {
      if (accountForm.value.newEmail != null && accountForm.value.newEmail !='')
      {
        this.userService.updateAccountEmail(accountForm.value.newEmail, accountForm.value.email, accountForm.value.password)
        .then((success) => { this.showSuccess(success); })
        .catch((err) =>
          {
            console.log(err);
            this.router.navigate(['/login']);
          });
      }

      if (accountForm.value.newPassword != null && accountForm.value.newPassword !='')
      {
        this.userService.updateAccountPassword(accountForm.value.newPassword, accountForm.value.email, accountForm.value.password)
          .then((success) =>{ this.showSuccess(success); })
          .catch(err =>
            {
              console.log(err);
              this.router.navigate(['/login']);
            });
      }

      if (accountForm.value.accountName != null && accountForm.value.accountName !='')
      {
        this.userService.updateAccountName(accountForm.value.accountName)
        .then((success) => { this.showSuccess(success); })
        .catch((err) => { this.error = err });
      }
    }
  }

  showSuccess(success: any)
  {
    this.success = success;
    $(document).ready(function(){$('#success').fadeOut(4000);});
  }
}

//////////////////////////////////////////////////////////////////////////

@Component({
  selector: 'profile',
  templateUrl: './settings.component.html'
})

export class SettingsComponent { }
