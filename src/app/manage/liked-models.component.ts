import { Component, Inject ,OnInit} from '@angular/core';
import { AngularFire, FirebaseApp , FirebaseListObservable} from 'angularfire2';
import { CadModel } from '../cad-model';
import { FormsModule } from '@angular/forms';

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
  public firebase:any;

  constructor(private af: AngularFire, @Inject(FirebaseApp) fb: any)
  {

    this.af.auth.subscribe(auth =>
      {
        this.userData = auth;

      });
      //uid = this.userData.uid;

      //query for all models that belongs to user with uid
      this.items =af.database.list('/models',
      {
        query:
        {
          orderByChild: ('uid'),
          equalTo: (this.userData.uid),
          //limitToLast:1
        }
      });

      this.firebase=fb;
  }

  ngOnInit()
  {
  }

}
