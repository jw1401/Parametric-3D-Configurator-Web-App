import { Component, Inject ,OnInit} from '@angular/core';
import { AngularFire, FirebaseApp , FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2';
import { CadModel } from '../cad-model';
import { FormsModule } from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-liked-models',
  templateUrl: './liked-models.component.html',
  styleUrls: ['./liked-models.component.css']
})
export class LikedModelsComponent implements OnInit
{

  public error:any;
  public userData: any;

  public powers = ['Printable', 'Hi Tec','Art', 'Engineering'];
  public model = new CadModel("uid","Name", "Description",this.powers[0],0,"imageURL","modelURL");

  public items: FirebaseListObservable<any>;
  public likedModels : FirebaseObjectObservable<any>;

  public models:FirebaseObjectObservable<any>;

  public list: any[]= new Array;

  public firebase:any;

  constructor(private af: AngularFire, @Inject(FirebaseApp) fb: any, private router: Router)
  {
    this.af.auth.subscribe(auth =>
      {
        this.userData = auth;
      });

      this.likedModels=af.database.object(`/users/`+this.userData.uid+'/likedModels');
      this.likedModels.take(1).subscribe(data=>
      {
        //console.log(data);
        for (let entry of data)
        {
          this.models=af.database.object(`/models/${entry}`);
          this.models.take(1).subscribe(data=>
          {
            this.list.push(data);
          })
        }
        //console.log(this.list);
      })
      this.firebase=fb;
  }

  ngOnInit()
  {
  }

  openItem(key:string)
  {
    this.router.navigate(['/cadview/'+key])
  }

}
