import { Component, Inject } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../shared/user.service';
import {User, Upload} from '../shared/user.model'

import * as $ from 'jquery';

@Component
({
  selector: 'profile',
  templateUrl: './profile.component.html'
})

export class ProfileComponent
{
    public authData: any;
    public userModel : User;


    constructor(private userService: UserService)
    {
    }

    ngOnInit()
    {
      this.authData = this.userService.currentUser; //gets the authState Data
      this.userService.CurrentUserData.then((data) => {this.userModel = data;});
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
  public userModel : User;

  upload : Upload;
  //selectedFiles: FileList;

  constructor(private userService: UserService, private router: Router)
  {
    this.userModel = new User("","","");
    this.upload = new Upload();
  }

  ngOnInit()
  {
    this.userService.CurrentUserData.then(data =>
      {
        this.userModel = data;
      });
      //this.userService.unsubscribeUser();

  }

  fileImageChangeEvent(event: any)
  {
    this.success = null;

    this.upload.file = event.target.files[0];
    this.upload.name = event.target.files[0].name;
    this.upload.type = event.target.files[0].type;

    //uploads the image imideatly
    if (this.upload.type.match('image/*'))
    {

      /*this.userService.CurrentUserData.then(data =>
        {
          this.userModel = data;
        });*/

      this.userModel.photo != null ? this.userService.deleteProfilePicture(this.userModel.photo.name) : undefined

      var reader = new FileReader();
      reader.onload = (event:any) =>
      {
        this.userModel.photo.photoURL = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);

      this.error = null;
      this.userService.uploadProfilePicture(this.upload)
        .then((success) =>
        {
          this.success = success;
          $(document).ready(function(){$('#success').fadeOut(4000);});
          this.userModel.photo.name = this.upload.name;
        });
    }
    else this.error = "Only images...";
  }

  UpdateUser(userForm: any)
  {
    this.success = null;
    if (userForm.valid)
    {
      this.userService.updateUserData(this.userModel)
        .then(success=>
        {
          this.success = success;
          $(document).ready(function(){$('#success').fadeOut(4000);})
        })
        .catch(err=>
        {
          this.error = err
        });
    }
  }

  updateAccountName(accountData:any)
  {
    this.success = null;
    if(accountData.valid)
    {
      this.userService.updateAccountName(accountData)
      .then(success=>
      {
        this.success = success;
        $(document).ready(function(){$('#success').fadeOut(4000);})
      })
      .catch(err=>
      {
        this.error = err
      });
    }
  }

  updateAccountEmail(emailData)
  {
    this.success = null;
    if(emailData.valid)
    {
      this.userService.updateAccountEmail(emailData)
      .then(success =>
        {
          this.success = success;
          $(document).ready(function(){$('#success').fadeOut(4000);})
        })
        .catch(err=>
        {
          console.log(err);
          this.router.navigate(['/login']);
        });
    }
  }

  updatePassword(passwordData)
  {
    this.success = null;
    if (passwordData.valid)
    {
      this.userService.updateAccountPassword(passwordData)
        .then(success =>
        {
          this.success = success;
          $(document).ready(function(){$('#success').fadeOut(4000);})
        })
        .catch(err =>
        {
          console.log(err);
          this.router.navigate(['/login']);
        });
      }
    }
}

//////////////////////////////////////////////////////////////////////////

@Component({
  selector: 'profile',
  templateUrl: './settings.component.html'
})

export class SettingsComponent { }
