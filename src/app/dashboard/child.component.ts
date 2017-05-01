import { Component, Inject } from '@angular/core';
import { AngularFire, FirebaseApp,FirebaseObjectObservable  } from 'angularfire2';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {FormsModule} from'@angular/forms';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';


@Component
({
  selector: 'profile',
  templateUrl: './profile.component.html'
})

export class ProfileComponent
{
    public userData: any;

    constructor(private af: AngularFire)
    {
    }

    ngOnInit()
    {
        this.af.auth.subscribe(auth =>{this.userData = auth;});
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

  public trustedURL: SafeUrl;
  public imageFile={"name":'', "file":'',"type":''};

  constructor(@Inject(UserService) userService:any, private router: Router, private sanitizer: DomSanitizer)
  {
    // injects the userService
    this.userService = userService;
    this.userService.getPhotoURL().then(url => this.photoURL = url);
  }

  fileImageChangeEvent(fileInput: any)
  {
    this.imageFile.file = fileInput.target.files[0];
    this.imageFile.name = fileInput.target.files[0].name;
    this.imageFile.type = fileInput.target.files[0].type;

    //trust the imageUrl
    this.trustedURL =  this.sanitizer.bypassSecurityTrustResourceUrl( URL.createObjectURL(fileInput.target.files[0]));
    this.photoURL = this.trustedURL;

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
