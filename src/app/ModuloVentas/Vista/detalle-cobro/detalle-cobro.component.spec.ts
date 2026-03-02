import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleCobroComponent } from './detalle-cobro.component';

describe('DetalleCobroComponent', () => {
  let component: DetalleCobroComponent;
  let fixture: ComponentFixture<DetalleCobroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleCobroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleCobroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
