import { Component, Inject ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ModelService } from'../../shared/model.service';
import { Observable } from 'rxjs/Rx';

@Component
({
  selector: 'likedmodels',
  templateUrl: './likedmodels.component.html',
  styleUrls: ['./likedmodels.component.css']
})

export class LikedModelsComponent implements OnInit
{
  public items: Observable<any>;

  constructor(private router: Router, private modelService: ModelService)
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
