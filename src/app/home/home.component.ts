import { Component, OnInit, Inject } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2/database';
import { Router } from '@angular/router';
import { CadModelService } from '../shared/cad-model.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit
{
  items: FirebaseListObservable<any>;
  limit : BehaviorSubject<number> = new BehaviorSubject<number>(5);

  constructor(private router: Router, private modelService: CadModelService)
  {
  }

  ngOnInit()
  {
    this.items = this.modelService.getModelsList(
      {
        limitToFirst: this.limit,
        orderByKey : true
      });
  }

  nextPage()
  {
    this.limit.next( this.limit.getValue() + 5);
  }

  updateLike(key: string, like: number)
  {
    this.modelService.updateLike(key,like);
  }

  open(key:string)
  {
    this.router.navigate(['/cadview/' + key])
  }
}
