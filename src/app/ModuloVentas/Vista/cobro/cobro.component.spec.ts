import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CobroComponent } from './cobro.component';
import { CobroResponse } from '../../Entidad/cobro.model';
import { CobroService } from '../../Service/cobro.service';
import { ClienteService } from '../../Service/cliente.service';
import { FormaPagoService } from '../../Service/forma-pago.service';
import { DetalleCobroService } from '../../Service/detalle-cobro.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { AuthService } from '../../../Compartido/services/auth.service';

describe('CobroComponent', () => {
  let component: CobroComponent;
  let fixture: ComponentFixture<CobroComponent>;
  let cobroServiceSpy: jasmine.SpyObj<CobroService>;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let formaPagoServiceSpy: jasmine.SpyObj<FormaPagoService>;
  let detalleCobroServiceSpy: jasmine.SpyObj<DetalleCobroService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let authServiceMock: { userId: number | null };

  beforeEach(async () => {
    cobroServiceSpy = jasmine.createSpyObj('CobroService', ['findAll', 'save', 'update', 'confirmar', 'anular']);
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['findActivos']);
    formaPagoServiceSpy = jasmine.createSpyObj('FormaPagoService', ['findActivos']);
    detalleCobroServiceSpy = jasmine.createSpyObj('DetalleCobroService', ['obtenerPorCobro']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['warning', 'toast', 'error', 'success', 'inputText']);
    authServiceMock = { userId: 42 };

    cobroServiceSpy.findAll.and.returnValue(of([]));
    cobroServiceSpy.save.and.returnValue(of({} as never));
    cobroServiceSpy.update.and.returnValue(of({} as never));
    cobroServiceSpy.confirmar.and.returnValue(of({} as never));
    cobroServiceSpy.anular.and.returnValue(of({} as never));
    clienteServiceSpy.findActivos.and.returnValue(of([]));
    formaPagoServiceSpy.findActivos.and.returnValue(of([]));
    detalleCobroServiceSpy.obtenerPorCobro.and.returnValue(of([]));
    notificationServiceSpy.inputText.and.returnValue(Promise.resolve('Motivo de prueba'));

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [CobroComponent],
      providers: [
        { provide: CobroService, useValue: cobroServiceSpy },
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: FormaPagoService, useValue: formaPagoServiceSpy },
        { provide: DetalleCobroService, useValue: detalleCobroServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: AuthService, useValue: authServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CobroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should auto-fill cajeroId when opening the create modal', () => {
    component.abrirModalCrear();

    expect(component.showModal).toBeTrue();
    expect(component.cobroForm.get('cajeroId')?.value).toBe(42);
    expect(component.cobroForm.get('fechaCobro')?.value).toBeTruthy();
    expect(notificationServiceSpy.warning).not.toHaveBeenCalled();
  });

  it('should use authenticated user id when confirming a cobro', () => {
    const cobro = { id: 7, estado: 'PENDIENTE', numeroCobro: 'COB-001' } as CobroResponse;

    component.confirmarCobro(cobro);

    expect(cobroServiceSpy.confirmar).toHaveBeenCalledWith(7, 42);
  });

  it('should stop when there is no authenticated user', async () => {
    authServiceMock.userId = null;

    component.abrirModalCrear();
    expect(notificationServiceSpy.warning).toHaveBeenCalled();
    notificationServiceSpy.warning.calls.reset();

    const cobro = { id: 9, estado: 'PENDIENTE', numeroCobro: 'COB-002' } as CobroResponse;
    await component.confirmarCobro(cobro);

    expect(notificationServiceSpy.warning).toHaveBeenCalled();
    expect(cobroServiceSpy.confirmar).not.toHaveBeenCalled();
  });
});
