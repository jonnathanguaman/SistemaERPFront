import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonaVentaComponent } from './zona-venta.component';

describe('ZonaVentaComponent', () => {
  let component: ZonaVentaComponent;
  let fixture: ComponentFixture<ZonaVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ZonaVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonaVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
