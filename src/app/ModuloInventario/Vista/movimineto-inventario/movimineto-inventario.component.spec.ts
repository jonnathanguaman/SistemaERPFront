import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviminetoInventarioComponent } from './movimineto-inventario.component';

describe('MoviminetoInventarioComponent', () => {
  let component: MoviminetoInventarioComponent;
  let fixture: ComponentFixture<MoviminetoInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoviminetoInventarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoviminetoInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
