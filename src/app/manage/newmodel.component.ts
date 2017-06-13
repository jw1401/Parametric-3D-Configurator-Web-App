import { Component, Inject ,OnInit} from '@angular/core';
//import { AngularFire, FirebaseApp , FirebaseListObservable,FirebaseObjectObservable} from 'angularfire2';
import {Router} from '@angular/router';
import {CadModel} from '../shared/cad-model';
import {CadModelService} from '../shared/cad-model.service';

import {licenses} from '../shared/license';


@Component
({
  selector: 'newmodel',
  templateUrl: './newmodel.component.html'
})

export class NewmodelComponent implements OnInit
{
  public error:any;
  public powers = [ 'Hi Tec Gadget','Art', 'Engineering','Not special','Universal','Printable'];
  public licenses = licenses;

  public imageFile={"name":'', "file":'',"type":''};
  public modelFile={"name":'', "file":'',"type":''};
  public model: CadModel;
  public imagePreview="../../assets/imgs/no-image-2.png";
  public submitted = false;

    constructor(private modelService: CadModelService)
    {
      this.newCadModel();
    }

    ngOnInit()
    {
    }

    onChange($event)
    {
      console.log(this.model.license);
    }

       fileImageChangeEvent(event: any)
       {
         //get the file and fileinfo

         console.log(event.target.files[0])
         this.model.image.file = event.target.files[0];
         this.model.image.name = event.target.files[0].name;
         this.model.image.type = event.target.files[0].type;

         if (event.target.files && event.target.files[0])
         {
           var reader = new FileReader();
           reader.onload = (event:any) => {this.imagePreview = event.target.result;}
           reader.readAsDataURL(event.target.files[0]);
         }

         if (this.model.image.type.match('image/*'))
         {
           this.error = null;
         }
         else this.error="only images...";
       }

       fileModelChangeEvent(fileInput: any)
       {
         let extension:string;

         this.model.model.file = fileInput.target.files[0];
         this.model.model.name = fileInput.target.files[0].name;
         this.model.model.type = fileInput.target.files[0].type;

         //get the file extension
         extension = this.model.model.name.split('.').pop().toLowerCase()

         //console.log("MIME stl: " + this.modelFile.type +"Extension: " + extension );

         //check the file extension
         if (extension === "stl" || extension ==="jscad")
         {
           this.error=null;
           this.model.model.type="stl";
         }
         else this.error="only .stl or .jscad files...";
       }

       onSubmit()
       {
         console.log(this.model);
         if (this.model.image.type.match('image/*') && (this.model.model.type === "stl"|| this.model.model.type ==="jscad"))
         {
           this.modelService.addModel(this.model,this.model.image,this.model.model);
           this.submitted=true;
         }
         else this.error= "No file or wrong format...";
       }

       newCadModel()
       {
         this.model= new CadModel();
         this.imageFile.name="";
         this.modelFile.name="";
         this.imagePreview="../../assets/imgs/no-image-2.png";
         this.error=null;
       }

}
