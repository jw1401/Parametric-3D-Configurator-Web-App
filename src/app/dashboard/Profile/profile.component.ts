import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { User } from '../../shared/user.model'
import { FirebaseObjectObservable } from 'angularfire2/database';
import { FileItem } from '../../shared/FileItem.model'
import * as $ from 'jquery';


@Component
({
  selector: 'profile',
  templateUrl: './profile.component.html'
})

export class ProfileComponent
{
  public error : any;
  public success: any;
  public user : User;
  public imagePreview : string = "../../assets/imgs/profilePicture.jpg"

  subscription : any;
  currentFile: FileItem = null;
  imageTypeCheck: string;


  constructor(private userService: UserService, private router: Router)
  {
    this.user = new User();
  }

  ngOnInit()
  {
    this.subscription = this.userService.currentUserData.subscribe(data =>
      {
        this.user = data;
        if (this.user.photo != undefined)
        {
          this.user.photo.url !="" ? this.imagePreview = this.user.photo.url : null
          this.imageTypeCheck = this.user.photo.type
        }
      })
  }

  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }

  fileImageChangeEvent(event: any)
  {
    this.error = null;
    this.success = null;
    this.currentFile = new FileItem(event.target.files[0]);
    this.imageTypeCheck = this.currentFile.type
    this.showImage();
  }

  UpdateUser(userForm: any)
  {
    this.error= null;
    this.success = null;

    if (userForm.valid)
    {
      this.userService.updateUserData(this.user)
        .then((success) =>
        {
          if (this.currentFile != null && this.user.photo.name == "")
          {
            this.userService.uploadProfilePicture(this.currentFile).then((success)=>
            {
              this.showSuccess(success);
              this.currentFile = null;
            });
          }
          else if (this.currentFile != null && this.user.photo.name != "")
          {
            this.userService.deleteProfilePicture(this.user.photo).then(()=>
            {
              this.userService.uploadProfilePicture(this.currentFile).then ((success) =>
              {
                 this.showSuccess(success);
                 this.currentFile = null;
              });
            })
          }
          this.showSuccess(success);
        })
        .catch((err) =>
        {
          this.error = err;
        })
    }
  }

  private showSuccess(success: any)
  {
    this.success = success;
    $(document).ready(function(){$('#success').fadeOut(4000);});
  }

  private showImage()
  {
    if (this.currentFile.type.match('image/*'))
    {
      var reader = new FileReader();
      reader.onload = (event:any) => {this.imagePreview = event.target.result;}
      reader.readAsDataURL(this.currentFile.file);
    }
    else this.error = "Only IMAGES"
  }

  private checkValid(userForm: any): boolean
  {
    try
    {
      if (userForm.valid && this.imageTypeCheck.match('image/*'))
      {
        return true;
      }
      else return false
    }
    catch(e)
    {
      return false
    }
  }
}
