import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionInventarioComponent } from './recepcion-inventario.component';

describe('RecepcionInventarioComponent', () => {
  let component: RecepcionInventarioComponent;
  let fixture: ComponentFixture<RecepcionInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecepcionInventarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
