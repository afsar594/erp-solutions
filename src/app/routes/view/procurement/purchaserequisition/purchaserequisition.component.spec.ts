import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaserequisitionComponent } from './purchaserequisition.component';

describe('PurchaserequisitionComponent', () => {
  let component: PurchaserequisitionComponent;
  let fixture: ComponentFixture<PurchaserequisitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaserequisitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaserequisitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
