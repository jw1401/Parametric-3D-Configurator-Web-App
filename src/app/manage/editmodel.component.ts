import { Component, Inject ,OnInit} from '@angular/core';
import { CadModel } from '../shared/cad-model';
import { CadModelService } from '../shared/cad-model.service';
import { Observable } from 'rxjs/Rx';
import { licenses } from '../shared/license';

@Component
({
  selector: 'editmodel',
  templateUrl: './editmodel.component.html'
})

export class EditmodelComponent implements OnInit
{
  public error: any;
  public success: any;
  public model : CadModel;
  public modelKey : string;
  public items: Observable <any>;
  public licenses: any = licenses;
  public imagePreview : any;

 constructor(private modelService: CadModelService)
 {
   this.model=  new CadModel();
 }

  ngOnInit()
  {
    // query for all models that belongs to user with uid
    this.items = this.modelService.getEditModels();
  }

  // make model data available in the modal Dialog
  editItem (item: any)
  {
    this.error = null;
    this.success = null;
    this.model = item; // gets all the data from the ngModel of EditmodelComponent.html
    this.imagePreview = this.model.image.URL;
  }

  updateItem ()
  {
    this.modelService.updateModel(this.model.$key, this.model).then((success) => this.success=success);
  }

  updateItemLike(key: string, like: number)
  {
    this.modelService.updateLike(key, like);
  }

  deleteItem(key:string, imageName, modelName)
  {
    this.modelService.deleteModel(key, imageName, modelName);
    this.items = this.modelService.getEditModels();
  }

  fileImageChangeEvent(event: any)
  {
    this.error = null;

    // checks if it is an imagefile
    if (event.target.files[0].type.match('image/*'))
    {
      // remember which file to delete
      let tmpName = this.model.image.name;

      // get the file and fileinfo
      this.model.image.file = event.target.files[0];
      this.model.image.name = event.target.files[0].name;
      this.model.image.type = event.target.files[0].type;

      // show the image preview in the EditmodelComponent.html
      var reader = new FileReader();
      reader.onload = (event:any) => {this.imagePreview = event.target.result;}
      reader.readAsDataURL(event.target.files[0]);

      //deletes old image and uploads new image imideatly
      this.modelService.deleteImageFile(this.model.$key, tmpName)
        .then((success) =>
          {
            this.modelService.uploadImage(this.model.$key, this.model).then((success) => this.success=success);
          }).catch(err=>console.log(err))
    }
    else this.error = "Only images..."
  }

  fileModelChangeEvent(event: any)
  {
    this.error = null;
    let extension: string;

    //get the file extension
    extension = event.target.files[0].name.split('.').pop().toLowerCase()

    //check the file extension
    if (extension === "stl" || extension ==="jscad")
    {
      // remember file to delete
      let tmpName = this.model.model.name;

      // get file data
      this.model.model.file = event.target.files[0];
      this.model.model.name = event.target.files[0].name;
      this.model.model.type = extension;

      this.modelService.deleteModelFile(this.model.$key, tmpName)
        .then((success) =>
          {
            this.modelService.uploadModel(this.model.$key, this.model).then((success) => this.success=success);
          })
    }
    else this.error="only .stl or .jscad files..."
  }
}
