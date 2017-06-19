import { Component, Inject ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CadModelService } from'../shared/cad-model.service';
import { Observable } from 'rxjs/Rx';

@Component
({
  selector: 'app-liked-models',
  templateUrl: './liked-models.component.html',
  styleUrls: ['./liked-models.component.css']
})

export class LikedModelsComponent implements OnInit
{
  public items: Observable<any>;

  constructor(private router: Router, private modelService: CadModelService)
  {}

  ngOnInit()
  {
    this.items = this.modelService.getLikedModels()
  }

  openItem (key:string)
  {
    this.router.navigate(['/cadview/' + key])
  }

}
