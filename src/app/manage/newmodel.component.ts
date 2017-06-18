import { Component, Inject ,OnInit, ViewChild} from '@angular/core';
import { CadModel } from '../shared/cad-model';
import { CadModelService } from '../shared/cad-model.service';
import { ModelDetailComponent } from'./model-detail.component'
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
  public model: CadModel;
  public valid: boolean = false;
  @ViewChild(ModelDetailComponent) private detailComponent : ModelDetailComponent;

  constructor(private modelService: CadModelService)
  {}

  ngOnInit()
  {
    this.newModel();
  }

  onSubmit()
  {
    this.error = null;
    this.success = null;

    if (this.valid)
    {
      this.modelService.createModel(this.model)
        .then((success) =>
          {
            this.success = success;
            $(document).ready(function(){$('#success').fadeOut(4000);});
            this.newModel();
          })
        .catch((err) => this.error = err)
    }
    else this.error = "Please check your input!";
  }

  newModel()
  {
    this.detailComponent.resetForm();
    this.error = null;
    this.model = new CadModel();
  }

//end of class
}
