import { Component, OnInit, Inject } from '@angular/core';
import { AngularFire , FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import {Router} from '@angular/router';
//import {UserModel} from '../shared/user-model';
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
  //user: FirebaseObjectObservable<any>;

  //public page = 1;
  //public auth : any;

  //public userModel = new UserModel("","","","");

  constructor(private af: AngularFire, private router: Router, private modelService: CadModelService)
  {
    /*
    this.af.auth.take(2).subscribe((auth)=>
    {
      this.auth=auth;

      if (auth!=null)
      {
        this.user = af.database.object('users/'+this.auth.uid);
        this.user.take(1).subscribe(data=>{this.userModel=data; })
      }
    });
    */
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
    this.modelService.updateLike(key,like);
  }

  open(key:string)
  {
    this.router.navigate(['/cadview/'+key])
  }
}
