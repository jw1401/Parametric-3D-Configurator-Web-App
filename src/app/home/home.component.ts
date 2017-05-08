import { Component, OnInit, Inject } from '@angular/core';
import { AngularFire , FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Router} from '@angular/router';
import {UserModel} from '../shared/user-model';
import {CadModelService} from '../shared/cad-model.service';

import 'rxjs/add/operator/take';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit
{
  items: FirebaseListObservable<any>;
  user: FirebaseObjectObservable<any>;

  public page = 1;
  public auth:any;

  public userModel = new UserModel("","","","");

  constructor(private af: AngularFire, private router: Router, private modelService: CadModelService)
  {
    this.af.auth.take(2).subscribe((auth)=>
    {
      this.auth=auth;
      //console.log(this.auth);

      if (auth!=null)
      {
        this.user = af.database.object('users/'+this.auth.uid);
        this.user.take(1).subscribe(data=>{this.userModel=data; /*console.log(this.userModel)*/})
      }
    });
    //af.database.list('/models');
  }

  ngOnInit()
  {
    this.items = this.modelService.getModels();
  }

  nextPage()
  {
    this.modelService.scroll();
  }

  updateLike(key: string, like: number)
  {
    console.log(this.auth);
    if (this.auth!= null)
    {
      if (this.userModel.likedModels==null)
      {
        this.userModel.likedModels = new Array;
      }
      //console.log(this.userModel.likedModels);
      let index = this.userModel.likedModels.indexOf(key);

      if (index == -1)
      {
        this.userModel.likedModels.push(key)
        this.items.update(key,{like:like+1});;
        this.user.$ref.child('likedModels').set(this.userModel.likedModels);
      }
      else
      {
        this.userModel.likedModels.splice(index,1);
        this.user.$ref.child('likedModels').set(this.userModel.likedModels);
        //this.user.$ref.child('likedModels').child(index.toString()).remove();
        this.items.update(key,{like:like-1});;
      }
    }
  }

  open(key:string)
  {
    this.router.navigate(['/cadview/'+key])
  }
}
