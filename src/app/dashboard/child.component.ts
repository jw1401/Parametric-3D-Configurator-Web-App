import { Component, Inject } from '@angular/core';
import { AngularFire, FirebaseApp,FirebaseObjectObservable  } from 'angularfire2';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {FormsModule} from'@angular/forms';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {UserModel} from './user-model'

@Component
({
  selector: 'profile',
  templateUrl: './profile.component.html'
})

export class ProfileComponent
{
    public userData: any;
    private user: FirebaseObjectObservable<any>;
    public userModel = new UserModel("","","","");

    constructor(private af: AngularFire)
    {
    }

    ngOnInit()
    {
        this.af.auth.subscribe(auth =>{
          this.userData = auth;

          this.user =this.af.database.object('/users/'+this.userData.uid);
          this.user.take(1).subscribe(data=>
            {
            this.userModel.name = data.name;
            this.userModel.country =data.country;
            this.userModel.bio =data.bio;
            this.userModel.image = this.userData.auth.photoURL;
          });

        });
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
  public error:any;
  public photoURL:any;
  private userService:any;
  public userModel = new UserModel("","","","");
  public trustedURL: SafeUrl;
  public imageFile={"name":'', "file":'',"type":''};

  constructor(@Inject(UserService) userService:any, private router: Router, private sanitizer: DomSanitizer)
  {
    // injects the userService
    this.userService = userService;
    this.userService.getUserData().then(data => {this.userModel=data;
      //this.photoURL=data.image
    });
  }

  ngOnInit()
  {}

  fileImageChangeEvent(fileInput: any)
  {
    this.imageFile.file = fileInput.target.files[0];
    this.imageFile.name = fileInput.target.files[0].name;
    this.imageFile.type = fileInput.target.files[0].type;


    if (fileInput.target.files && fileInput.target.files[0])
    {
      var reader = new FileReader();
      reader.onload = (event:any) => {this.userModel.image = event.target.result;}
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
    this.userService.updateUser(userData);
  }

  changeAccountName(accountData:any)
  {
    console.log(accountData.value);
    this.userService.updateAccountName(accountData);
  }
  changeEmail(emailData)
  {
    this.userService.updateEmail(emailData).then(result =>
      {
        console.log(result)
      }).catch((error=>
        {
          console.log(error);
          this.router.navigate(['/login']);
        }));
  }

  changePassword(passwordData)
  {
    this.userService.updatePassword(passwordData).then(result=>
      {
        console.log(result);
      }).catch(error=>
        {
          console.log(error);
          this.router.navigate(['/login']);
        });
  }


}

//////////////////////////////////////////////////////////////////////////

@Component({
  selector: 'profile',
  templateUrl: './settings.component.html'
})

export class SettingsComponent { }
