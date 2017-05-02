import { Component, OnInit, Inject } from '@angular/core';
import { AngularFire , FirebaseListObservable} from 'angularfire2';
import {Router} from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit
{
  items: FirebaseListObservable<any>;
  public auth:any;

  constructor(private af: AngularFire, private router: Router)
  {
    this.af.auth.subscribe((auth)=>this.auth=auth)
    this.items =af.database.list('/models')
  }

  ngOnInit()
  {}

  updateLike(key: string, like: number)
  {
    if (this.auth!= null)
    {
      this.items.update(key,{like:like});
    }
  }

  open(key:string)
  {
    this.router.navigate(['/cadview/'+key])
  }
}
