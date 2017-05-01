import { Component, Inject ,OnInit} from '@angular/core';
import { AngularFire, FirebaseApp , FirebaseListObservable} from 'angularfire2';
import { CadModel } from '../cad-model';
import { FormsModule } from '@angular/forms';

@Component
({
  selector: 'editmodel',
  templateUrl: './editmodel.component.html'
})

export class EditmodelComponent implements OnInit
{
  public error:any;
  public userData: any;

  public powers = ['Printable', 'Hi Tec','Art', 'Engineering'];
  public model = new CadModel("uid","Name", "Description",this.powers[0],0,"imageURL","modelURL");

  public items: FirebaseListObservable<any>;
  public firebase:any;

 constructor(private af: AngularFire, @Inject(FirebaseApp) fb: any)
 {
   //let uid : string;

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
  {}

  //make model data available in the modal
  editItem(key: string, name: string, description: string, power: string,like: number, imageURL:string, modelURL:string)
  {
    this.model.uid=key;
    this.model.name= name;
    this.model.description = description;
    this.model.power = power;
    this.model.like = like;
    this.model.imageURL = imageURL;
    this.model.modelURL = modelURL;
  }

  updateItem(key: string, newName: string, newDescription, newPower)
  {
    this.items.update(key,{name: newName, description: newDescription, power: newPower});
  }

  updateLike(key: string, like: number)
  {
    this.items.update(key,{like:like});
  }

  deleteItem(key:string, imageURL:string, modelURL:string)
  {
    let imgDelRef = this.firebase.storage().refFromURL(imageURL);
    let modelDelRef = this.firebase.storage().refFromURL(modelURL);

    //remove database entry then files
    this.items.remove(key).then(_=>
    {
      imgDelRef.delete().then(function()
      {
        console.log("Success deleting image...")
      }).catch(function(error)
      {
        this.error=error;
        console.log(error)
      });

      modelDelRef.delete().then(function()
      {
        console.log("Success deleting model...")
      }).catch(function(error)
      {
        this.error=error;
        console.log(error)
      });
      console.log("removed it...")
    }).catch(err=> console.log(err));
  }
}
