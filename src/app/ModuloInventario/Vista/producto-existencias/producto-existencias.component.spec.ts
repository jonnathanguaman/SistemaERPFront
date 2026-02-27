import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoExistenciasComponent } from './producto-existencias.component';

describe('ProductoExistenciasComponent', () => {
  let component: ProductoExistenciasComponent;
  let fixture: ComponentFixture<ProductoExistenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductoExistenciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoExistenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
