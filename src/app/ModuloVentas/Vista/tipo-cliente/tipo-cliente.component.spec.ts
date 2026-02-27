import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoClienteComponent } from './tipo-cliente.component';

describe('TipoClienteComponent', () => {
  let component: TipoClienteComponent;
  let fixture: ComponentFixture<TipoClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TipoClienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
