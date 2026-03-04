import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleNotaCreditoComponent } from './detalle-nota-credito.component';

describe('DetalleNotaCreditoComponent', () => {
  let component: DetalleNotaCreditoComponent;
  let fixture: ComponentFixture<DetalleNotaCreditoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleNotaCreditoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleNotaCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
