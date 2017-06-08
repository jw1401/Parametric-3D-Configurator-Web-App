import { Component,OnInit } from '@angular/core';
//import {AngularFire, AuthProviders, AuthMethods} from 'angularfire2';
import { Router } from '@angular/router';

import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '~';
  public isAuth = false;
  userName:string;

  constructor(public afAuth: AngularFireAuth, private router:Router)
  {
    this.afAuth.authState.subscribe(auth=>
      {
        if(auth)
        {
          this.userName = auth.displayName;
        }
        else {}
      })
  }

  ngOnInit()
  {}

  logout()
  {
    this.afAuth.auth.signOut();
    this.router.navigate(['/'])
  }

}

@Component({
  templateUrl: './page.not.found.html'
})

export class PageNotFoundComponent {}
