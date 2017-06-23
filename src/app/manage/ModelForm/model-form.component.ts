import { Component, Input, Output, ViewChild, EventEmitter,AfterViewChecked } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModelItem } from '../../shared/ModelItem.model';
import { FileItem } from '../../shared/FileItem.model';
import { licenses, powers } from '../../shared/listables';


@Component
({
  selector: 'model-form',
  templateUrl: './model-form.component.html'
})

export class ModelFormComponent implements AfterViewChecked
{
  @Input() model : ModelItem
  @Output() isValid = new EventEmitter<boolean>();
  @ViewChild('ModelForm') currentForm: NgForm;

  ModelForm: NgForm;
  error: string = null;

  imagePreview: string;
  powers: any = powers
  licenses: any = licenses;

  imageFileName: string ="";
  modelFileName: string ="";

  constructor()
  {}

  get diagnostic() { return JSON.stringify(this.model); }

  ngAfterViewChecked()
  {
    this.formChanged()
  }

  formChanged()
  {
    if (this.currentForm === this.ModelForm) { return; }

    this.ModelForm = this.currentForm;

    if (this.ModelForm)
    {
      this.ModelForm.valueChanges
        .subscribe(data =>{this.checkValid();});
    }
  }

  fileImageChangeEvent(event: any)
  {
    try
    {
      this.error = null;
      this.model.image = new FileItem(event.target.files[0]);
      this.imageFileName = this.model.image.name;

      if (this.model.image.type.match('image/*'))
      {
        var reader = new FileReader();
        reader.onload = (event:any) => {this.imagePreview = event.target.result;}
        reader.readAsDataURL(event.target.files[0]);
      }
      else this.error = 'Only IMAGE files'

      this.checkValid();
    }
    catch(e)
    {
      console.log(e)
      this.isValid.emit(false)
    }
  }

  fileModelChangeEvent(event: any)
  {
    try
    {
      this.error = null;
      this.model.model = new FileItem(event.target.files[0])
      this.modelFileName = this.model.model.name;

      if (this.model.model.type.match ("stl") || this.model.model.type.match("jscad")) this.error = null
      else this.error = 'Only JSCAD and STL files'

      this.checkValid();
    }
    catch(e)
    {
      console.log(e)
      this.isValid.emit(false)
    }
  }

  checkValid()
  {
    try
    {
      if (this.ModelForm.valid && this.model.image.type.match('image/*') && (this.model.model.type.match("stl") || this.model.model.type.match("jscad")))
      {
        this.isValid.emit(true)
      }
      else this.isValid.emit(false)
    }
    catch(e)
    {
      console.log(e)
      this.isValid.emit(false)
    }
  }

  resetForm()
  {
    this.error = null;
    this.imagePreview = "../../assets/imgs/no-image-2.png";
  }

//end of class
}
