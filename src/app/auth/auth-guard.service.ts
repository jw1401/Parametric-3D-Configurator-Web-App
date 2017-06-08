import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
//import { AngularFire } from 'angularfire2';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';

// Do not import from 'firebase' as you'd lose the tree shaking benefits
import * as firebase from 'firebase/app';

@Injectable()
export class AuthGuard implements CanActivate
{
  public allowed: boolean;

  constructor(private afAuth: AngularFireAuth, private router: Router)
  {
    // this.af.auth.subscribe((auth) => console.log(auth));
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>
  {
    return this.afAuth.authState.map((auth) =>  {
      if(auth == null)
      {
        this.router.navigate(['/login']);
        return false;
      }
      else
      {
        return true;
      }
    }).first()
  }
}
