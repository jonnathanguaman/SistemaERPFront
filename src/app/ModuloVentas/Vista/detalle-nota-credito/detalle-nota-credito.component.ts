import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetalleNotaCreditoService } from '../../Service/detalle-nota-credito.service';
import { NotaCreditoService } from '../../Service/nota-credito.service';
import { DetalleNotaCreditoRequest, DetalleNotaCreditoResponse } from '../../Entidad/detalle-nota-credito.model';
import { NotaCreditoResponse } from '../../Entidad/nota-credito.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-detalle-nota-credito',
  standalone: false,
  templateUrl: './detalle-nota-credito.component.html',
  styleUrl: './detalle-nota-credito.component.css'
})
export class DetalleNotaCreditoComponent implements OnInit {
  detalles: DetalleNotaCreditoResponse[] = [];
  detallesFiltrados: DetalleNotaCreditoResponse[] = [];
  notasCredito: NotaCreditoResponse[] = [];
  detalleForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedDetalleId?: number;
  loading = false;
  searchTerm = '';
  
  // Filtro por nota de crédito
  filtroNotaCreditoId?: number;

  constructor(
    private readonly detalleNotaCreditoService: DetalleNotaCreditoService,
    private readonly notaCreditoService: NotaCreditoService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.detalleForm = this.fb.group({
      notaCreditoId: ['', [Validators.required]],
      detalleFacturaId: [null],
      productoId: ['', [Validators.required]],
      productoCodigo: [''],
      productoNombre: [''],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      impuestoPorcentaje: [0, [Validators.min(0)]],
      impuestoMonto: [0, [Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarNotasCredito();
  }

  cargarNotasCredito(): void {
    this.notaCreditoService.obtenerActivos().subscribe({
      next: (data: NotaCreditoResponse[]) => {
        this.notasCredito = data;
      },
      error: (error: any) => {
        this.notificationService.error('Error al cargar notas de crédito', error.message);
      }
    });
  }

  cargarDetalles(): void {
    this.loading = true;
    
    if (this.filtroNotaCreditoId) {
      this.detalleNotaCreditoService.obtenerPorNotaCredito(this.filtroNotaCreditoId).subscribe({
        next: (data: DetalleNotaCreditoResponse[]) => {
          this.detalles = data;
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (error: any) => {
          this.notificationService.error('Error al cargar detalles', error.message);
          this.loading = false;
        }
      });
    } else {
      this.detalles = [];
      this.detallesFiltrados = [];
      this.loading = false;
    }
  }

  aplicarFiltros(): void {
    let filtrados = [...this.detalles];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtrados = filtrados.filter(detalle =>
        detalle.productoNombre?.toLowerCase().includes(term) ||
        detalle.productoCodigo?.toLowerCase().includes(term) ||
        detalle.notaCreditoNumero?.toLowerCase().includes(term)
      );
    }

    this.detallesFiltrados = filtrados;
  }

  buscarPorNotaCredito(): void {
    if (this.filtroNotaCreditoId) {
      this.cargarDetalles();
    }
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.detalleForm.reset({
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0,
      impuestoPorcentaje: 0,
      impuestoMonto: 0,
      total: 0
    });
    
    if (this.filtroNotaCreditoId) {
      this.detalleForm.patchValue({ notaCreditoId: this.filtroNotaCreditoId });
    }
    
    this.showModal = true;
  }

  abrirModalEditar(detalle: DetalleNotaCreditoResponse): void {
    this.isEditMode = true;
    this.selectedDetalleId = detalle.id;
    this.detalleForm.patchValue({
      notaCreditoId: detalle.notaCreditoId,
      detalleFacturaId: detalle.detalleFacturaId,
      productoId: detalle.productoId,
      productoCodigo: detalle.productoCodigo,
      productoNombre: detalle.productoNombre,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
      subtotal: detalle.subtotal,
      impuestoPorcentaje: detalle.impuestoPorcentaje,
      impuestoMonto: detalle.impuestoMonto,
      total: detalle.total,
      observaciones: detalle.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.detalleForm.reset();
    this.isEditMode = false;
    this.selectedDetalleId = undefined;
  }

  async guardarDetalle(): Promise<void> {
    if (this.detalleForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    const detalleData: DetalleNotaCreditoRequest = this.detalleForm.value;

    if (this.isEditMode && this.selectedDetalleId) {
      this.detalleNotaCreditoService.actualizar(this.selectedDetalleId, detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle actualizado', 'El detalle se actualizó correctamente');
          this.cargarDetalles();
          this.cerrarModal();
        },
        error: (error: any) => {
          this.notificationService.error('Error al actualizar detalle', error.message);
        }
      });
    } else {
      this.detalleNotaCreditoService.crear(detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle creado', 'El detalle se creó correctamente');
          this.cargarDetalles();
          this.cerrarModal();
        },
        error: (error: any) => {
          this.notificationService.error('Error al crear detalle', error.message);
        }
      });
    }
  }

  async eliminarDetalle(detalle: DetalleNotaCreditoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar este detalle de la nota de crédito?`
    );

    if (confirmed) {
      this.detalleNotaCreditoService.eliminar(detalle.id).subscribe({
        next: () => {
          this.notificationService.success('Detalle eliminado', 'El detalle se eliminó correctamente');
          this.cargarDetalles();
        },
        error: (error: any) => {
          this.notificationService.error('Error al eliminar detalle', error.message);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.detalleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.detalleForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('min')) return 'El valor debe ser mayor a 0';
    return '';
  }

  calcularSubtotal(): void {
    const cantidad = this.detalleForm.get('cantidad')?.value || 0;
    const precioUnitario = this.detalleForm.get('precioUnitario')?.value || 0;
    const subtotal = cantidad * precioUnitario;
    
    this.detalleForm.patchValue({ subtotal }, { emitEvent: false });
    this.calcularTotal();
  }

  calcularImpuesto(): void {
    const subtotal = this.detalleForm.get('subtotal')?.value || 0;
    const impuestoPorcentaje = this.detalleForm.get('impuestoPorcentaje')?.value || 0;
    const impuestoMonto = subtotal * (impuestoPorcentaje / 100);
    
    this.detalleForm.patchValue({ impuestoMonto }, { emitEvent: false });
    this.calcularTotal();
  }

  calcularTotal(): void {
    const subtotal = this.detalleForm.get('subtotal')?.value || 0;
    const impuestoMonto = this.detalleForm.get('impuestoMonto')?.value || 0;
    const total = subtotal + impuestoMonto;
    
    this.detalleForm.patchValue({ total }, { emitEvent: false });
  }
}
