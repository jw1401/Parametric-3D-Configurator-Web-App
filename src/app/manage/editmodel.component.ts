import { Component, Inject ,OnInit} from '@angular/core';
import { FirebaseListObservable} from 'angularfire2';
import { CadModel } from '../shared/cad-model';
import { FormsModule } from '@angular/forms';
import {CadModelService} from '../shared/cad-model.service';
import { Observable, Subject } from 'rxjs/Rx';

@Component
({
  selector: 'editmodel',
  templateUrl: './editmodel.component.html'
})

export class EditmodelComponent implements OnInit
{
  public error:any;

  public model : CadModel;
  public modelKey : string;
  public items: Observable<any>;

  public imagePreview : any;
  public imageFile={"name":'', "file":'',"type":''};
  public modelFile={"name":'', "file":'',"type":''};

 constructor(private modelService: CadModelService)
 {
   this.model=  new CadModel("userId","Name", "Description","",0,"imageURL","modelURL");
 }

  ngOnInit()
  {
    //query for all models that belongs to user with uid
    this.items = this.modelService.getEditModels();
    //this.modelService.getEditModels().subscribe(value => this.items=value)
  }

  //make model data available in the modal
  editItem(key: string, name: string, description: string, power: string,
    like: number, imageURL:string, modelURL:string, customizable:boolean, userId:string)
  {
    this.modelKey = key;

    this.model.userId=userId;
    this.model.name= name;
    this.model.description = description;
    this.model.power = power;
    this.model.like = like;
    this.model.imageURL = imageURL;
    this.model.modelURL = modelURL;
    this.model.isCustomizable = customizable;

    this.imagePreview=this.model.imageURL;
    //this.modelFile.name = modelURL
  }

  updateItem(key: string)
  {
    this.modelService.updateModel(key, this.model);
  }

  updateLike(key: string, like: number)
  {
    this.modelService.updateLike(key, like);
  }

  deleteItem(key:string)
  {
    this.modelService.deleteModel(key, this.model.imageURL, this.model.modelURL);
    this.items = this.modelService.getEditModels();
  }

  deleteItemOnCard(key:string, imageURL, modelURL)
  {
    this.modelService.deleteModel(key, imageURL, modelURL);
    this.items = this.modelService.getEditModels();
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

    //uploads the image imideatly
    if (this.imageFile.type.match('image/*'))
    {
      this.error = null;
      this.modelService.changeModelImage(this.imageFile.name, this.imageFile.file, this.model.imageURL, this.modelKey).then(()=>
      {
        console.log("changing image...");
      });
    }
    else this.error="Only images...";
  }

  fileModelChangeEvent(fileInput: any)
  {
    let extension:string;

    this.modelFile.file = fileInput.target.files[0];
    this.modelFile.name = fileInput.target.files[0].name;
    this.modelFile.type = fileInput.target.files[0].type;

    //get the file extension
    extension = this.modelFile.name.split('.').pop().toLowerCase()

    //check the file extension
    if (extension === "stl" || extension ==="jscad")
    {
      this.error=null;
      this.modelService.changeModelFile(this.modelFile.name, this.modelFile.file, this.model.modelURL, this.modelKey).then(()=>console.log("changing model file"))
    }
    else this.error="only .stl or .jscad files...";
  }
}
