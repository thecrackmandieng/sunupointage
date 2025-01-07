import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardManagementComponent } from './card-management.component';

describe('CardManagementComponent', () => {
  let component: CardManagementComponent;
  let fixture: ComponentFixture<CardManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
