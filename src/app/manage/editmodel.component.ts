import { Component, Inject ,OnInit, ViewChild} from '@angular/core';
import { CadModel } from '../shared/cad-model';
import { CadModelService } from '../shared/cad-model.service';
import { Observable } from 'rxjs/Rx';
import { ModelFormComponent } from'./model-form.component'
import * as $ from 'jquery';

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
  public items: Observable <any>;
  public valid: boolean = false;

  private tmpImageName: string;
  private tmpModelName: string;

  @ViewChild(ModelFormComponent) private modelFormComponent : ModelFormComponent;

  constructor (private modelService: CadModelService)
  {}

  ngOnInit()
  {
    // new istance of CadModel
    this.model=  new CadModel();

    // query for all models that belongs to user with uid
    this.items = this.modelService.getEditModels();
  }

  // sets data in the modal Dialog
  // based on selected item
  //
  editItem (item: any)
  {
    // reset everything
    this.modelFormComponent.resetForm();
    this.error = null;
    this.success = null;

    // sets data from selected item
    this.model = item;

    // sets imagePreview in the child view
    this.modelFormComponent.imagePreview = this.model.image.URL;

    // sets tmp variables for check if should save image or model file
    this.tmpImageName = this.model.image.name;
    this.tmpModelName = this.model.model.name;
  }

  // updates item based on modal Dialog
  //
  updateItem ()
  {
    // checks if form model-form is valid
    if (this.valid)
    {
      // updates the database
      this.modelService.updateModel(this.model.$key, this.model).then((success) => this.showSuccess(success));

      // updates the image if needed
      if (this.model.image.name != this.tmpImageName)
      {
        //deletes old image and uploads new image
        this.modelService.deleteImageFile(this.model.$key, this.tmpImageName)
          .then((success) =>
            {
              this.modelService.uploadImage(this.model.$key, this.model).then((success) => this.showSuccess(success))
            }).catch((err) => console.log(err))
      }

      // updates the model if needed
      if(this.model.model.name != this.tmpModelName)
      {
        //deletes old model and uploads new model
        this.modelService.deleteModelFile(this.model.$key, this.tmpModelName)
          .then((success) =>
            {
              this.modelService.uploadModel(this.model.$key, this.model).then((success) => this.showSuccess(success));
            }).catch((err) => console.log(err))
      }

    }
    else this.error = "Please check your input!";

  }

  // shows success messages and fades it onSubmit
  //
  showSuccess (success: string)
  {
    this.success = success;
    $(document).ready(function(){$('#success').fadeOut(4000);});
  }

  // gives like or dislike
  //
  updateItemLike (key: string, like: number)
  {
    this.modelService.updateLike(key, like);
  }

  // delets the whole item and all files related to item
  //
  deleteItem (key: string, imageName: string, modelName: string)
  {
    this.modelService.deleteModel(key, imageName, modelName);
    this.items = this.modelService.getEditModels();
  }

// end of class
}
