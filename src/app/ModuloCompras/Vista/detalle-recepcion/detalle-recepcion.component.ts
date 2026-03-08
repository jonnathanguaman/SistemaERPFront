import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetalleRecepcionService } from '../../Service/detalle-recepcion.service';
import { DetalleRecepcionRequest, DetalleRecepcionResponse, EstadoCalidad } from '../../Entidades/recepcion-inventario.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-detalle-recepcion',
  standalone: false,
  templateUrl: './detalle-recepcion.component.html',
  styleUrl: './detalle-recepcion.component.css'
})
export class DetalleRecepcionComponent implements OnInit {
  
  detalles: DetalleRecepcionResponse[] = [];
  detalleSeleccionado: DetalleRecepcionResponse | null = null;
  detalleForm: FormGroup;
  
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  searchTerm: string = '';
  recepcionIdFilter: number | null = null;
  
  // Estados de calidad
  estadosCalidad = Object.values(EstadoCalidad);
  
  constructor(
    private readonly detalleService: DetalleRecepcionService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.detalleForm = this.formBuilder.group({
      recepcionId: ['', [Validators.required, Validators.min(1)]],
      detalleOrdenCompraId: ['', [Validators.required, Validators.min(1)]],
      productoId: ['', [Validators.required, Validators.min(1)]],
      loteId: [''],
      numeroLote: [''],
      fechaFabricacion: [''],
      fechaVencimiento: [''],
      cantidadOrdenada: ['', [Validators.required, Validators.min(0)]],
      cantidadRecibida: ['', [Validators.required, Validators.min(0)]],
      cantidadRechazada: [0, [Validators.min(0)]],
      costoUnitario: ['', [Validators.required, Validators.min(0)]],
      estadoCalidad: [''],
      motivoRechazo: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDetalles();
  }

  cargarDetalles(): void {
    if (this.recepcionIdFilter) {
      this.cargarDetallesPorRecepcion(this.recepcionIdFilter);
    }
  }

  cargarDetallesPorRecepcion(recepcionId: number): void {
    this.isLoading = true;
    
    this.detalleService.findByRecepcion(recepcionId).subscribe({
      next: (data) => {
        console.log('Detalles recibidos del backend:', data);
        this.detalles = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar detalles');
        console.error('Error al cargar detalles:', error);
      }
    });
  }

  get detallesFiltrados(): DetalleRecepcionResponse[] {
    if (!this.searchTerm) {
      return this.detalles;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.detalles.filter(detalle =>
      detalle.productoNombre?.toLowerCase().includes(term) ||
      detalle.productoSku?.toLowerCase().includes(term) ||
      detalle.numeroLote?.toLowerCase().includes(term) ||
      detalle.estadoCalidad?.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    if (!this.recepcionIdFilter) {
      this.notificationService.warning(
        'Debes seleccionar una recepción primero',
        'Operación no permitida'
      );
      return;
    }
    
    this.isEditMode = false;
    this.detalleSeleccionado = null;
    this.detalleForm.reset({
      recepcionId: this.recepcionIdFilter,
      cantidadRechazada: 0
    });
    this.showModal = true;
  }

  abrirModalEditar(detalle: DetalleRecepcionResponse): void {
    this.isEditMode = true;
    this.detalleSeleccionado = detalle;
    
    this.detalleForm.patchValue({
      recepcionId: detalle.recepcionId,
      detalleOrdenCompraId: detalle.detalleOrdenCompraId,
      productoId: detalle.productoId,
      loteId: detalle.loteId,
      numeroLote: detalle.numeroLote,
      fechaFabricacion: detalle.fechaFabricacion,
      fechaVencimiento: detalle.fechaVencimiento,
      cantidadOrdenada: detalle.cantidadOrdenada,
      cantidadRecibida: detalle.cantidadRecibida,
      cantidadRechazada: detalle.cantidadRechazada,
      costoUnitario: detalle.costoUnitario,
      estadoCalidad: detalle.estadoCalidad,
      motivoRechazo: detalle.motivoRechazo,
      observaciones: detalle.observaciones
    });
    
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.detalleForm.reset();
    this.detalleSeleccionado = null;
  }

  guardarDetalle(): void {
    if (this.detalleForm.invalid) {
      this.notificationService.warning(
        'Por favor, completa todos los campos obligatorios',
        'Formulario incompleto'
      );
      this.detalleForm.markAllAsTouched();
      return;
    }

    const detalleRequest: DetalleRecepcionRequest = this.detalleForm.value;

    if (this.isEditMode && this.detalleSeleccionado) {
      this.actualizarDetalle(this.detalleSeleccionado.id, detalleRequest);
    } else {
      this.crearDetalle(detalleRequest);
    }
  }

  private crearDetalle(detalle: DetalleRecepcionRequest): void {
    const recepcionId = detalle.recepcionId || this.recepcionIdFilter;
    if (!recepcionId) {
      this.notificationService.error(
        'No se pudo determinar la recepción',
        'Error'
      );
      return;
    }

    this.detalleService.create(recepcionId, detalle).subscribe({
      next: () => {
        this.notificationService.success(
          'Detalle de recepción creado exitosamente',
          'Operación exitosa'
        );
        this.cerrarModal();
        this.cargarDetalles();
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al crear detalle');
        console.error('Error al crear detalle:', error);
      }
    });
  }

  private actualizarDetalle(id: number, detalle: DetalleRecepcionRequest): void {
    this.detalleService.update(id, detalle).subscribe({
      next: () => {
        this.notificationService.success(
          'Detalle de recepción actualizado exitosamente',
          'Operación exitosa'
        );
        this.cerrarModal();
        this.cargarDetalles();
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al actualizar detalle');
        console.error('Error al actualizar detalle:', error);
      }
    });
  }

  eliminarDetalle(detalle: DetalleRecepcionResponse): void {
    this.notificationService.confirm(
      `¿Estás seguro de eliminar este detalle de recepción?`,
      'Eliminar detalle'
    ).then((confirmed) => {
      if (confirmed) {
        this.detalleService.delete(detalle.id).subscribe({
          next: () => {
            this.notificationService.success(
              'Detalle de recepción eliminado exitosamente',
              'Operación exitosa'
            );
            this.cargarDetalles();
          },
          error: (error) => {
            this.notificationService.error(error.message, 'Error al eliminar detalle');
            console.error('Error al eliminar detalle:', error);
          }
        });
      }
    });
  }

  setRecepcionFilter(recepcionId: number | null): void {
    this.recepcionIdFilter = recepcionId;
    if (recepcionId) {
      this.cargarDetallesPorRecepcion(recepcionId);
    } else {
      this.detalles = [];
    }
  }

  getEstadoCalidadBadgeClass(estado: string | undefined): string {
    switch (estado) {
      case EstadoCalidad.APROBADO:
        return 'badge-success';
      case EstadoCalidad.RECHAZADO:
        return 'badge-error';
      case EstadoCalidad.INSPECCION:
        return 'badge-warning';
      default:
        return 'badge-default';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.detalleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.detalleForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('min')) {
      return `El valor mínimo es ${field.errors?.['min'].min}`;
    }
    return '';
  }

  calcularCostoTotal(): number {
    const cantidadRecibida = this.detalleForm.get('cantidadRecibida')?.value || 0;
    const costoUnitario = this.detalleForm.get('costoUnitario')?.value || 0;
    return cantidadRecibida * costoUnitario;
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
