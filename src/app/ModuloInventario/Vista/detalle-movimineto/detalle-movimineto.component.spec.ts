import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleMoviminetoComponent } from './detalle-movimineto.component';

describe('DetalleMoviminetoComponent', () => {
  let component: DetalleMoviminetoComponent;
  let fixture: ComponentFixture<DetalleMoviminetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleMoviminetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleMoviminetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
