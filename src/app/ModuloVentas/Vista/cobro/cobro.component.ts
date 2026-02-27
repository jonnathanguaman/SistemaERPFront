import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CobroService } from '../../Service/cobro.service';
import { ClienteService } from '../../Service/cliente.service';
import { FormaPagoService } from '../../Service/forma-pago.service';
import { CobroResponse, CobroRequest } from '../../Entidad/cobro.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { FormaPagoResponse } from '../../Entidad/forma-pago.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-cobro',
  standalone: false,
  templateUrl: './cobro.component.html',
  styleUrl: './cobro.component.css'
})
export class CobroComponent implements OnInit {
  cobros: CobroResponse[] = [];
  clientes: ClienteResponse[] = [];
  formasPago: FormaPagoResponse[] = [];
  cobroForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingCobroId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';
  filterEstado: string = 'TODOS';

  constructor(
    private readonly cobroService: CobroService,
    private readonly clienteService: ClienteService,
    private readonly formaPagoService: FormaPagoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.cobroForm = this.formBuilder.group({
      numeroCobro: ['', [Validators.required, Validators.maxLength(20)]],
      clienteId: [null, Validators.required],
      fechaCobro: ['', Validators.required],
      formaPagoId: [null, Validators.required],
      bancoId: [null],
      numeroDocumento: ['', Validators.maxLength(50)],
      fechaDocumento: [''],
      montoTotal: [0, [Validators.required, Validators.min(0.01)]],
      cajaId: [null],
      cajeroId: [null],
      tipoCambio: [1],
      moneda: ['USD'],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCobros();
    this.cargarClientes();
    this.cargarFormasPago();
  }

  get cobrosFiltrados(): CobroResponse[] {
    let filtered = this.cobros;

    if (this.filterEstado !== 'TODOS') {
      filtered = filtered.filter(c => c.estado === this.filterEstado);
    }

    if (!this.searchTerm.trim()) {
      return filtered;
    }

    const termino = this.searchTerm.toLowerCase();
    return filtered.filter(cobro =>
      cobro.numeroCobro?.toLowerCase().includes(termino) ||
      cobro.clienteNombre?.toLowerCase().includes(termino) ||
      cobro.formaPagoNombre?.toLowerCase().includes(termino)
    );
  }

  cargarCobros(): void {
    this.loading = true;
    this.cobroService.findAll().subscribe({
      next: (data) => {
        this.cobros = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cobros:', error);
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

  cargarFormasPago(): void {
    this.formaPagoService.findActivos().subscribe({
      next: (data) => {
        this.formasPago = data;
      },
      error: (error) => {
        console.error('Error al cargar formas de pago:', error);
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingCobroId = null;
    const today = new Date().toISOString().split('T')[0];
    this.cobroForm.reset({
      fechaCobro: today,
      montoTotal: 0,
      tipoCambio: 1,
      moneda: 'USD'
    });
    this.showModal = true;
  }

  abrirModalEditar(cobro: CobroResponse): void {
    if (cobro.estado !== 'PENDIENTE') {
      this.notificationService.warning('Solo se pueden editar cobros pendientes');
      return;
    }

    this.isEditing = true;
    this.editingCobroId = cobro.id;
    this.cobroForm.patchValue({
      numeroCobro: cobro.numeroCobro,
      clienteId: cobro.clienteId,
      fechaCobro: cobro.fechaCobro,
      formaPagoId: cobro.formaPagoId,
      bancoId: cobro.bancoId,
      numeroDocumento: cobro.numeroDocumento,
      fechaDocumento: cobro.fechaDocumento,
      montoTotal: cobro.montoTotal,
      cajaId: cobro.cajaId,
      cajeroId: cobro.cajeroId,
      tipoCambio: cobro.tipoCambio,
      moneda: cobro.moneda,
      observaciones: cobro.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.cobroForm.reset();
    this.isEditing = false;
    this.editingCobroId = null;
  }

  guardarCobro(): void {
    if (this.cobroForm.invalid) {
      this.cobroForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const cobroData: CobroRequest = this.cobroForm.value;

    if (this.isEditing && this.editingCobroId !== null) {
      this.cobroService.update(this.editingCobroId, cobroData).subscribe({
        next: () => {
          this.notificationService.success('Cobro actualizado exitosamente');
          this.cargarCobros();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar cobro:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.cobroService.save(cobroData).subscribe({
        next: () => {
          this.notificationService.success('Cobro creado exitosamente');
          this.cargarCobros();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear cobro:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async confirmarCobro(cobro: CobroResponse): Promise<void> {
    if (cobro.estado !== 'PENDIENTE') {
      this.notificationService.warning('Solo se pueden confirmar cobros pendientes');
      return;
    }

    const confirmed = confirm(`¿Confirmar el cobro ${cobro.numeroCobro}?`);
    if (!confirmed) return;

    this.cobroService.confirmar(cobro.id).subscribe({
      next: () => {
        this.notificationService.toast('Cobro confirmado exitosamente', 'success');
        this.cargarCobros();
      },
      error: (error) => {
        console.error('Error al confirmar cobro:', error);
        this.notificationService.error(error.message, 'Error al confirmar');
      }
    });
  }

  async anularCobro(cobro: CobroResponse): Promise<void> {
    if (cobro.estado === 'ANULADO') {
      this.notificationService.warning('El cobro ya está anulado');
      return;
    }

    const motivo = prompt('Ingrese el motivo de anulación:');
    if (!motivo) return;

    this.cobroService.anular(cobro.id, motivo).subscribe({
      next: () => {
        this.notificationService.toast('Cobro anulado exitosamente', 'success');
        this.cargarCobros();
      },
      error: (error) => {
        console.error('Error al anular cobro:', error);
        this.notificationService.error(error.message, 'Error al anular');
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-warning';
      case 'CONFIRMADO': return 'badge-success';
      case 'ANULADO': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cobroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cobroForm.get(fieldName);
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
