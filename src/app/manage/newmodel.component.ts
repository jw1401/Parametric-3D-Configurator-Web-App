import { Component, Inject ,OnInit} from '@angular/core';
import { CadModel } from '../shared/cad-model';
import { CadModelService } from '../shared/cad-model.service';
import { licenses } from '../shared/license';

import * as $ from 'jquery';

@Component
({
  selector: 'newmodel',
  templateUrl: './newmodel.component.html'
})

export class NewmodelComponent implements OnInit
{
  public error: any;
  public success: any;
  public powers = [ 'Hi Tec Gadget','Art', 'Engineering','Not special','Universal','Printable'];
  public licenses = licenses;
  public model: CadModel;
  public imagePreview: any;


  constructor(private modelService: CadModelService)
  {
    this.newCadModel();
  }

  ngOnInit()
  {}

  fileImageChangeEvent(event: any)
  {
    this.error = null;

    // get file and attributes
    this.model.image.file = event.target.files[0];
    this.model.image.name = event.target.files[0].name;
    this.model.image.type = event.target.files[0].type;

    if (event.target.files && event.target.files[0])
    {
      var reader = new FileReader();
      reader.onload = (event:any) => {this.imagePreview = event.target.result;}
      reader.readAsDataURL(event.target.files[0]);
    }

    if (!this.model.image.type.match('image/*')) this.error = "only images...";
  }

  fileModelChangeEvent(event: any)
  {
    let extension: string;

    this.model.model.file = event.target.files[0];
    this.model.model.name = event.target.files[0].name;
    this.model.model.type = event.target.files[0].type;

    //get file extension
    extension = this.model.model.name.split('.').pop().toLowerCase()

   //check the file extension and set model.type
   switch(extension)
    {
      case "stl":
        this.error = null;
        this.model.model.type = "stl";
        break;

      case "jscad":
        this.error = null;
        this.model.model.type = "jscad";
        break;

      default:
        this.error = "only .stl or .jscad files...";
    }
  }

  onSubmit()
  {
    this.error = null;
    this.success = null;

    if (this.model.image.type.match('image/*') && (this.model.model.type === "stl"|| this.model.model.type ==="jscad"))
    {
      this.modelService.createModel(this.model)
        .then((success) =>
          {
            this.success = success;
            $(document).ready(function(){$('#success').fadeOut(4000);});
            this.newCadModel();
          })
        .catch((err) => this.error = err)
    }
    else this.error = "No file or wrong format...";
  }

  newCadModel()
  {
    this.model= new CadModel();
    this.model.image.name="";
    this.model.image.type="";
    this.model.model.name="";
    this.imagePreview="../../assets/imgs/no-image-2.png";
    this.error = null;
  }

//end of class
}
