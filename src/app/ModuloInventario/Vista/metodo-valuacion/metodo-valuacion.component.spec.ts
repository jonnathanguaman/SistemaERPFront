import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetodoValuacionComponent } from './metodo-valuacion.component';

describe('MetodoValuacionComponent', () => {
  let component: MetodoValuacionComponent;
  let fixture: ComponentFixture<MetodoValuacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetodoValuacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetodoValuacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
