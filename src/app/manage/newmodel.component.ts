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

       fileImageChangeEvent(fileInput: any)
       {
         //get the file and fileinfo
         this.imageFile.file = fileInput.target.files[0];
         this.imageFile.name = fileInput.target.files[0].name;
         this.imageFile.type = fileInput.target.files[0].type;

         if (fileInput.target.files && fileInput.target.files[0])
         {
           var reader = new FileReader();
           reader.onload = (event:any) => {this.imagePreview = event.target.result;}
           reader.readAsDataURL(fileInput.target.files[0]);
         }

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
           this.modelService.addModel(this.model,this.imageFile,this.modelFile);
           this.submitted=true;
         }
         else this.error= "No file or wrong format...";
       }

       newCadModel()
       {
         this.model= new CadModel("" ,"Name", "Description",this.powers[0],0,"","", false, this.licenses[0].license);
         this.imageFile.name="";
         this.modelFile.name="";
         this.imagePreview="../../assets/imgs/no-image-2.png";
         this.error=null;
       }

}
