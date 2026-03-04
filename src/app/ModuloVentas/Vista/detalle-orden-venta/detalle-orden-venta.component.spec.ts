import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleOrdenVentaComponent } from './detalle-orden-venta.component';

describe('DetalleOrdenVentaComponent', () => {
  let component: DetalleOrdenVentaComponent;
  let fixture: ComponentFixture<DetalleOrdenVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleOrdenVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleOrdenVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
