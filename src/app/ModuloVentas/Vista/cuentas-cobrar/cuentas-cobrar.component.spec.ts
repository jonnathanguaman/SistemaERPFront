import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasCobrarComponent } from './cuentas-cobrar.component';

describe('CuentasCobrarComponent', () => {
  let component: CuentasCobrarComponent;
  let fixture: ComponentFixture<CuentasCobrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CuentasCobrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuentasCobrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
