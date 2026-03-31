import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetalleCotizacionService } from '../../Service/detalle-cotizacion.service';
import { DetalleCotizacionResponse, DetalleCotizacionRequest } from '../../Entidad/detalle-cotizacion.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { IvaProductoService } from '../../Service/iva-producto.service';

@Component({
  selector: 'app-detalle-cotizacion',
  standalone: false,
  templateUrl: './detalle-cotizacion.component.html',
  styleUrl: './detalle-cotizacion.component.css'
})
export class DetalleCotizacionComponent implements OnInit {
  detalles: DetalleCotizacionResponse[] = [];
  detallesFiltrados: DetalleCotizacionResponse[] = [];
  detalleForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingDetalleId: number | null = null;
  loading: boolean = false;
  busqueda: string = '';
  private readonly ivaPorProducto = new Map<number, number>();

  constructor(
    private readonly detalleService: DetalleCotizacionService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService,
    private readonly ivaProductoService: IvaProductoService
  ) {
    this.detalleForm = this.formBuilder.group({
      cotizacionId: [null, Validators.required],
      productoId: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descuentoPorcentaje: [0, [Validators.min(0), Validators.max(100)]],
      descuentoMonto: [0, Validators.min(0)],
      impuestoPorcentaje: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.detalleForm.get('productoId')?.valueChanges.subscribe((value) => {
      this.aplicarIvaPorProducto(Number(value || 0));
    });
    this.cargarDetalles();
  }

  private aplicarIvaPorProducto(productoId: number): void {
    if (!productoId) {
      this.detalleForm.patchValue({ impuestoPorcentaje: 0 }, { emitEvent: false });
      return;
    }

    const ivaCacheado = this.ivaPorProducto.get(productoId);
    if (ivaCacheado !== undefined) {
      this.detalleForm.patchValue({ impuestoPorcentaje: ivaCacheado }, { emitEvent: false });
      return;
    }

    this.ivaProductoService.findVigenteByProducto(productoId).subscribe({
      next: (iva) => {
        const porcentaje = Number(iva.impuestoPorcentaje || 0);
        this.ivaPorProducto.set(productoId, porcentaje);
        this.detalleForm.patchValue({ impuestoPorcentaje: porcentaje }, { emitEvent: false });
      },
      error: () => {
        this.ivaPorProducto.set(productoId, 0);
        this.detalleForm.patchValue({ impuestoPorcentaje: 0 }, { emitEvent: false });
      }
    });
  }

  cargarDetalles(): void {
    this.loading = true;
    this.detalleService.findAll().subscribe({
      next: (data) => {
        this.detalles = data;
        this.detallesFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        this.notificationService.error(error.message, 'Error al cargar detalles');
        this.loading = false;
      }
    });
  }

  filtrarDetalles(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.detallesFiltrados = this.detalles.filter(detalle =>
      detalle.cotizacionNumero?.toLowerCase().includes(busquedaLower) ||
      detalle.id.toString().includes(busquedaLower)
    );
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingDetalleId = null;
    this.detalleForm.reset({
      cantidad: 1,
      precioUnitario: 0,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      impuestoPorcentaje: 0
    });
    this.showModal = true;
  }

  abrirModalEditar(detalle: DetalleCotizacionResponse): void {
    this.isEditing = true;
    this.editingDetalleId = detalle.id;
    this.detalleForm.patchValue({
      cotizacionId: detalle.cotizacionId,
      productoId: detalle.productoId,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
      descuentoPorcentaje: detalle.descuentoPorcentaje,
      descuentoMonto: detalle.descuentoMonto,
      impuestoPorcentaje: detalle.impuestoPorcentaje,
      observaciones: detalle.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.detalleForm.reset();
    this.isEditing = false;
    this.editingDetalleId = null;
  }

  guardarDetalle(): void {
    if (this.detalleForm.invalid) {
      this.detalleForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const detalleData: DetalleCotizacionRequest = this.detalleForm.value;

    if (this.isEditing && this.editingDetalleId !== null) {
      this.detalleService.update(this.editingDetalleId, detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle actualizado exitosamente');
          this.cargarDetalles();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar detalle:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.detalleService.save(detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle creado exitosamente');
          this.cargarDetalles();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear detalle:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarDetalle(detalle: DetalleCotizacionResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(`Detalle #${detalle.id}`);
    if (!confirmed) return;

    this.detalleService.delete(detalle.id).subscribe({
      next: () => {
        this.notificationService.toast('Detalle eliminado exitosamente', 'success');
        this.cargarDetalles();
      },
      error: (error) => {
        console.error('Error al eliminar detalle:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.detalleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.detalleForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('min')) {
      return `Valor mínimo: ${field.errors?.['min'].min}`;
    }

    if (field?.hasError('max')) {
      return `Valor máximo: ${field.errors?.['max'].max}`;
    }

    return '';
  }

  formatCurrency(value: number | undefined): string {
    return value ? `$${value.toFixed(2)}` : '$0.00';
  }
}

