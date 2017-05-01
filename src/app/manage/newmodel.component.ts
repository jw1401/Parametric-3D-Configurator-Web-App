import { Component, Inject ,OnInit} from '@angular/core';
import { AngularFire, FirebaseApp , FirebaseListObservable,FirebaseObjectObservable} from 'angularfire2';
import {Router} from '@angular/router';
import {CadModel} from '../cad-model';

@Component
({
  selector: 'newmodel',
  templateUrl: './newmodel.component.html'
})

export class NewmodelComponent implements OnInit
{
  public error:any;

  public userData: any;

  public powers = ['Printable', 'Hi Tec','Art', 'Engineering','Not special','Customizable'];
  public model = new CadModel("","Name", "Description",this.powers[0],0,"","");
  public imageFile={"name":'', "file":'',"type":''};
  public modelFile={"name":'', "file":'',"type":''};

  public submitted = false;

  public items: FirebaseListObservable<any>;
  public firebase:any;

    constructor(private af: AngularFire, @Inject(FirebaseApp) fb: any)
    {
      this.af.auth.subscribe(auth =>{this.userData = auth;});

      //assigns the model the user_uid --> now you know to which user it belongs
      // it is saved in the firebase db under each model
      this.model.uid = this.userData.uid;

      this.items =af.database.list('/models');
      this.firebase=fb;
    }

    ngOnInit()
    {}

    uploadImage(imageFileName, imagefile, itemKey)
    {
      let items = this.items; //this is a must do

          // gives back Promise with resolution or rejection
          let promise = new Promise((res,rej) =>
          {
              let uploadTask = this.firebase.storage().ref(this.userData.uid+'/'+itemKey+`/images/${imageFileName}`).put(imagefile);

              uploadTask.on('state_changed',
              function(snapshot)
              {
              },
              function(error)
              {
                  rej(error);
              },
              function()
              {
                var downloadURL = uploadTask.snapshot.downloadURL;
                res(downloadURL);
                items.update(itemKey,{imageURL:downloadURL}); //update the database with img url
              });
          });
          return promise;
      }

      uploadModel(modelFileName, modelfile, itemKey)
      {
        let items = this.items;

            let promise = new Promise((res,rej) =>
            {
                let uploadTask = this.firebase.storage().ref(this.userData.uid+'/'+itemKey+`/models/${modelFileName}`).put(modelfile);

                uploadTask.on('state_changed',
                function(snapshot)
                {
                },
                function(error)
                {
                    rej(error);
                },
                function()
                {
                  var downloadURL = uploadTask.snapshot.downloadURL;
                  res(downloadURL);
                  items.update(itemKey,{modelURL:downloadURL});//update the database with model url
                });
            });
            return promise;
        }

       fileImageChangeEvent(fileInput: any)
       {
         //get the file and fileinfo
         this.imageFile.file = fileInput.target.files[0];
         this.imageFile.name = fileInput.target.files[0].name;
         this.imageFile.type = fileInput.target.files[0].type;

         if (this.imageFile.type.match('image/*'))
         {
           this.error = null;
         }
         else this.error="only images...";
       }

       fileModelChangeEvent(fileInput: any)
       {
         let extension:string;

         this.modelFile.file = fileInput.target.files[0];
         this.modelFile.name = fileInput.target.files[0].name;
         this.modelFile.type = fileInput.target.files[0].type;

         //get the file extension
         extension = this.modelFile.name.split('.').pop().toLowerCase()

         //console.log("MIME stl: " + this.modelFile.type +"Extension: " + extension );

         //check the file extension
         if (extension === "stl" || extension ==="jscad")
         {
           this.error=null;
           this.modelFile.type="stl";
         }
         else this.error="only .stl or .jscad files...";
       }

       onSubmit()
       {
         if (this.imageFile.type.match('image/*') && (this.modelFile.type === "stl"|| this.modelFile.type ==="jscad"))
         {
           //push model to database
           this.items.push(this.model).then((item)=>
           {
             this.uploadImage(this.imageFile.name,this.imageFile.file,item.key);
             this.uploadModel(this.modelFile.name,this.modelFile.file,item.key)
             this.submitted = true;

           }).catch((err)=>
           {
             this.error = err;
           });
         }
         else this.error= "No file or wrong format...";
       }

       newCadModel()
       {
         this.model= new CadModel(this.userData.uid ,"Name", "Description",this.powers[0],0,"","");
         this.imageFile.name="";
         this.modelFile.name="";
         this.error=null;
       }

}
