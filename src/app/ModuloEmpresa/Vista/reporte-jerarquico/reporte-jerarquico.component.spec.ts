import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteJerarquicoComponent } from './reporte-jerarquico.component';

describe('ReporteJerarquicoComponent', () => {
  let component: ReporteJerarquicoComponent;
  let fixture: ComponentFixture<ReporteJerarquicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReporteJerarquicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteJerarquicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
