import { Component,OnInit } from '@angular/core';
import {AngularFire, AuthProviders, AuthMethods} from 'angularfire2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '~';
  public isAuth = false;
  userName:string;

  constructor(public af: AngularFire, private router:Router)
  {
    this.af.auth.subscribe(auth=>
      {
        if(auth)
        {
          this.userName =auth.auth.displayName;
        }
        else {}
      })
  }

  ngOnInit()
  {}

  logout()
  {
    this.af.auth.logout();
    this.router.navigate(['/'])
  }

}

@Component({
  templateUrl: './page.not.found.html'
})

export class PageNotFoundComponent {}
