import { Component, Inject } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { User } from '../../shared/user.model'

@Component
({
  selector: 'you',
  templateUrl: './you.component.html',
  styleUrls: ['./you.component.css']
})

export class YouComponent
{
    auth: any;
    user : User;
    imagePreview : string = "../../assets/imgs/profilePicture.jpg"

    constructor(private userService: UserService)
    {
    }

    ngOnInit()
    {
      // gets the authState Data
      this.auth = this.userService.currentUser;

      // gets the user data and checks if image already uploaded
      this.userService.currentUserData.subscribe((data)=>
      {
        this.user = data
        if (this.user.photo != undefined)
        {
          this.imagePreview = this.user.photo.url
        }
      })
    }
}
