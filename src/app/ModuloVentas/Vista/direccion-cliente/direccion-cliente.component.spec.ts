import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DireccionClienteComponent } from './direccion-cliente.component';

describe('DireccionClienteComponent', () => {
  let component: DireccionClienteComponent;
  let fixture: ComponentFixture<DireccionClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DireccionClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DireccionClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
