import { Component, Inject } from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../shared/user.service';
import {UserModel} from '../shared/user-model'

@Component
({
  selector: 'profile',
  templateUrl: './profile.component.html'
})

export class ProfileComponent
{
    public authData: any;
    public userModel : UserModel;

    constructor(private userService: UserService)
    {
    }

    ngOnInit()
    {
      this.userService.getUser().then(data => {this.userModel = data;});
      this.authData = this.userService.getAuthData();
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
  public userModel : UserModel;
  public imageFile={"name":'', "file":'',"type":''};

  constructor(private userService: UserService, private router: Router)
  {
    this.userModel = new UserModel("","","","");
  }

  ngOnInit()
  {
    this.userService.getUser().then(data => {this.userModel=data;});
  }

  fileImageChangeEvent(fileInput: any)
  {
    this.imageFile.file = fileInput.target.files[0];
    this.imageFile.name = fileInput.target.files[0].name;
    this.imageFile.type = fileInput.target.files[0].type;


    if (fileInput.target.files && fileInput.target.files[0])
    {
      var reader = new FileReader();
      reader.onload = (event:any) => {this.userModel.photoURL = event.target.result;}
      reader.readAsDataURL(fileInput.target.files[0]);
    }

    //uploads the image imideatly
    if (this.imageFile.type.match('image/*'))
    {
      this.error = null;
      this.userService.uploadImage(this.imageFile.name,this.imageFile.file).then(()=>
      {
        console.log("changing image...");
      });
    }
    else this.error="Only images...";
  }

  changeUser(userData: any)
  {
    if (userData.valid)
    {
      this.userService.updateUser(userData);
    }
  }

  changeAccountName(accountData:any)
  {
    if(accountData.valid)
    {
      this.userService.updateAccountName(accountData);
    }
  }

  changeEmail(emailData)
  {
    if(emailData.valid)
    {
      this.userService.updateEmail(emailData).then(result =>{
        console.log(result)}).catch((error=>{
          console.log(error);
          this.router.navigate(['/login']);
        }));
    }
  }

  changePassword(passwordData)
  {
    if (passwordData.valid)
    {
      this.userService.updatePassword(passwordData).then(result=>{
        console.log(result);}).catch(error=>{
          console.log(error);
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
