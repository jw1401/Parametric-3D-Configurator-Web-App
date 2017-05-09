import { Component, OnInit, Inject } from '@angular/core';
import { AngularFire, FirebaseApp , FirebaseListObservable,FirebaseObjectObservable} from 'angularfire2';
import {Router} from '@angular/router';
import {CadModel} from '../shared/cad-model';


@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit
{
 items: FirebaseListObservable<any>;
 firebase:any;

 constructor(private af: AngularFire, @Inject(FirebaseApp) fb: any, private router: Router)
  {
    this.items =af.database.list('/models')
    //this.firebase=fb;
  }

  ngOnInit()
  {

  }

  updateLike(key: string, like: number)
  {
    this.items.update(key,{like:like});
  }

  open(key:string)
  {
    this.router.navigate(['/cadview/'+key])
  }
}
