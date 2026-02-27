import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadOrganizacionalComponent } from './unidad-organizacional.component';

describe('UnidadOrganizacionalComponent', () => {
  let component: UnidadOrganizacionalComponent;
  let fixture: ComponentFixture<UnidadOrganizacionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnidadOrganizacionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadOrganizacionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
