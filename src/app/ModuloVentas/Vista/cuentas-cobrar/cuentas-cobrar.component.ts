import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CuentaPorCobrarService } from '../../Service/cuenta-por-cobrar.service';
import { ClienteService } from '../../Service/cliente.service';
import { CuentaPorCobrarResponse, CuentaPorCobrarRequest } from '../../Entidad/cuenta-por-cobrar.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-cuentas-cobrar',
  standalone: false,
  templateUrl: './cuentas-cobrar.component.html',
  styleUrl: './cuentas-cobrar.component.css'
})
export class CuentasCobrarComponent implements OnInit {
  cuentas: CuentaPorCobrarResponse[] = [];
  clientes: ClienteResponse[] = [];
  cuentaForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingCuentaId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';
  filterEstado: string = 'TODOS';

  constructor(
    private readonly cuentaPorCobrarService: CuentaPorCobrarService,
    private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.cuentaForm = this.formBuilder.group({
      numeroCuenta: ['', [Validators.required, Validators.maxLength(20)]],
      facturaId: [null, Validators.required],
      clienteId: [null, Validators.required],
      fechaEmision: ['', Validators.required],
      fechaVencimiento: ['', Validators.required],
      diasCredito: [0, [Validators.required, Validators.min(0)]],
      montoOriginal: [0, [Validators.required, Validators.min(0.01)]],
      montoPagado: [0, Validators.min(0)],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCuentas();
    this.cargarClientes();
  }

  get cuentasFiltradas(): CuentaPorCobrarResponse[] {
    let filtered = this.cuentas;

    if (this.filterEstado === 'PENDIENTES') {
      filtered = filtered.filter(c => c.tieneSaldoPendiente);
    } else if (this.filterEstado === 'VENCIDAS') {
      filtered = filtered.filter(c => c.estaVencida);
    } else if (this.filterEstado === 'PAGADAS') {
      filtered = filtered.filter(c => !c.tieneSaldoPendiente);
    }

    if (!this.searchTerm.trim()) {
      return filtered;
    }

    const termino = this.searchTerm.toLowerCase();
    return filtered.filter(cuenta =>
      cuenta.numeroCuenta?.toLowerCase().includes(termino) ||
      cuenta.clienteNombre?.toLowerCase().includes(termino) ||
      cuenta.facturaNumero?.toLowerCase().includes(termino)
    );
  }

  cargarCuentas(): void {
    this.loading = true;
    this.cuentaPorCobrarService.findAll().subscribe({
      next: (data) => {
        this.cuentas = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cuentas por cobrar:', error);
        this.notificationService.error(error.message, 'Error al cargar');
        this.loading = false;
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.findActivos().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingCuentaId = null;
    const today = new Date().toISOString().split('T')[0];
    this.cuentaForm.reset({
      fechaEmision: today,
      fechaVencimiento: today,
      diasCredito: 0,
      montoOriginal: 0,
      montoPagado: 0
    });
    this.showModal = true;
  }

  abrirModalEditar(cuenta: CuentaPorCobrarResponse): void {
    this.isEditing = true;
    this.editingCuentaId = cuenta.id;
    this.cuentaForm.patchValue({
      numeroCuenta: cuenta.numeroCuenta,
      facturaId: cuenta.facturaId,
      clienteId: cuenta.clienteId,
      fechaEmision: cuenta.fechaEmision,
      fechaVencimiento: cuenta.fechaVencimiento,
      diasCredito: cuenta.diasCredito,
      montoOriginal: cuenta.montoOriginal,
      montoPagado: cuenta.montoPagado,
      observaciones: cuenta.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.cuentaForm.reset();
    this.isEditing = false;
    this.editingCuentaId = null;
  }

  guardarCuenta(): void {
    if (this.cuentaForm.invalid) {
      this.cuentaForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const cuentaData: CuentaPorCobrarRequest = this.cuentaForm.value;

    if (this.isEditing && this.editingCuentaId !== null) {
      this.cuentaPorCobrarService.update(this.editingCuentaId, cuentaData).subscribe({
        next: () => {
          this.notificationService.success('Cuenta por cobrar actualizada exitosamente');
          this.cargarCuentas();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar cuenta:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.cuentaPorCobrarService.save(cuentaData).subscribe({
        next: () => {
          this.notificationService.success('Cuenta por cobrar creada exitosamente');
          this.cargarCuentas();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear cuenta:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarCuenta(cuenta: CuentaPorCobrarResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(cuenta.numeroCuenta);

    if (!confirmed) {
      return;
    }

    this.cuentaPorCobrarService.delete(cuenta.id).subscribe({
      next: () => {
        this.notificationService.toast('Cuenta por cobrar eliminada exitosamente', 'success');
        this.cargarCuentas();
      },
      error: (error) => {
        console.error('Error al eliminar cuenta:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  getEstadoBadgeClass(cuenta: CuentaPorCobrarResponse): string {
    if (cuenta.estaVencida) return 'badge-danger';
    if (!cuenta.tieneSaldoPendiente) return 'badge-success';
    if (cuenta.montoPagado > 0) return 'badge-warning';
    return 'badge-info';
  }

  getEstadoTexto(cuenta: CuentaPorCobrarResponse): string {
    if (cuenta.estaVencida) return 'VENCIDA';
    if (!cuenta.tieneSaldoPendiente) return 'PAGADA';
    if (cuenta.montoPagado > 0) return 'PARCIAL';
    return 'PENDIENTE';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cuentaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cuentaForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Debe tener máximo ${maxLength} caracteres`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Debe ser mayor o igual a ${min}`;
    }
    return '';
  }
}
