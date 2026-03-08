import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleRecepcionComponent } from './detalle-recepcion.component';

describe('DetalleRecepcionComponent', () => {
  let component: DetalleRecepcionComponent;
  let fixture: ComponentFixture<DetalleRecepcionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleRecepcionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
