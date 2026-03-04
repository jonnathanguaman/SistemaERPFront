import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotaCreditoComponent } from './nota-credito.component';

describe('NotaCreditoComponent', () => {
  let component: NotaCreditoComponent;
  let fixture: ComponentFixture<NotaCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotaCreditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotaCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
