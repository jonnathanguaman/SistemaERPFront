import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondicionPagoComponent } from './condicion-pago.component';

describe('CondicionPagoComponent', () => {
  let component: CondicionPagoComponent;
  let fixture: ComponentFixture<CondicionPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CondicionPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CondicionPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
