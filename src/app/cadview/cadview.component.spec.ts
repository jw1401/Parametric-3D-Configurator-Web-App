import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadviewComponent } from './cadview.component';

describe('CadviewComponent', () => {
  let component: CadviewComponent;
  let fixture: ComponentFixture<CadviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
