import { Component, Inject ,OnInit, ViewChild} from '@angular/core';
import { ModelItem } from '../../shared/ModelItem.model';
import { ModelService } from '../../shared/model.service';
import { ModelFormComponent } from '../ModelForm/model-form.component'
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

  public model: ModelItem;
  public valid: boolean = false;
  @ViewChild(ModelFormComponent) private modelFormComponent : ModelFormComponent;

  constructor(private modelService: ModelService)
  {}

  ngOnInit()
  {
    this.newModel();
  }

  // Creates the new model in firebase
  //
  onSubmit()
  {
    // reset error and success messages
    this.error = null;
    this.success = null;

    // checks if form is valid
    if (this.valid)
    {
      // creates a new model with files via modelService
      this.modelService.createModel(this.model)
        .then((success) =>
          {
            this.success = success;
            $(document).ready(function(){$('#success').fadeOut(5000)});
            this.newModel();
          })
        .catch((err) => this.error = err)
    }
    else this.error = "Please check your input!";
  }

  // resets Form via @ViewChild and resets error messages and creates new model instance
  //
  newModel()
  {
    this.modelFormComponent.resetForm();
    this.error = null;
    this.model = new ModelItem();
  }

} // end of class
