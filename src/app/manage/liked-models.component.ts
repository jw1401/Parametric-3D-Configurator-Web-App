import { Component, Inject ,OnInit} from '@angular/core';
import {Router} from '@angular/router';
import { CadModel } from '../shared/cad-model';
import {CadModelService} from'../shared/cad-model.service';

@Component
({
  selector: 'app-liked-models',
  templateUrl: './liked-models.component.html',
  styleUrls: ['./liked-models.component.css']
})

export class LikedModelsComponent implements OnInit
{
  public error:any;
  public list: any[]= new Array;

  constructor(private router: Router, private modelService: CadModelService)
  {}

  ngOnInit()
  {
    this.list = this.modelService.getLikedModels();
  }

  openItem(key:string)
  {
    this.router.navigate(['/cadview/' + key])
  }

}
