import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DetalleFacturaService } from '../../Service/detalle-factura.service';
import { DetalleFacturaRequest, DetalleFacturaResponse } from '../../Entidad/detalle-factura.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-detalle-factura',
  standalone: false,
  templateUrl: './detalle-factura.component.html',
  styleUrl: './detalle-factura.component.css'
})
export class DetalleFacturaComponent implements OnInit {
  detalles: DetalleFacturaResponse[] = [];
  detallesFiltrados: DetalleFacturaResponse[] = [];
  detalleForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedDetalleId?: number;
  loading = false;
  searchTerm = '';
  
  // Filtro por factura
  filtroFacturaId?: number;

  constructor(
    private readonly detalleFacturaService: DetalleFacturaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.detalleForm = this.fb.group({
      facturaId: ['', [Validators.required]],
      productoId: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descuentoPorcentaje: [0, [Validators.min(0)]],
      descuentoMonto: [0, [Validators.min(0)]],
      impuestoPorcentaje: [0, [Validators.min(0)]],
      impuestoMonto: [0, [Validators.min(0)]],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDetalles();
  }

  cargarDetalles(): void {
    this.loading = true;
    
    if (this.filtroFacturaId) {
      this.detalleFacturaService.obtenerPorFactura(this.filtroFacturaId).subscribe({
        next: (data: DetalleFacturaResponse[]) => {
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
        detalle.facturaNumero?.toLowerCase().includes(term)
      );
    }

    this.detallesFiltrados = filtrados;
  }

  buscarPorFactura(): void {
    if (this.filtroFacturaId) {
      this.cargarDetalles();
    }
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.detalleForm.reset({
      cantidad: 1,
      precioUnitario: 0,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      impuestoPorcentaje: 0,
      impuestoMonto: 0,
      subtotal: 0,
      total: 0
    });
    
    if (this.filtroFacturaId) {
      this.detalleForm.patchValue({ facturaId: this.filtroFacturaId });
    }
    
    this.showModal = true;
  }

  abrirModalEditar(detalle: DetalleFacturaResponse): void {
    this.isEditMode = true;
    this.selectedDetalleId = detalle.id;
    this.detalleForm.patchValue({
      facturaId: detalle.facturaId,
      productoId: detalle.productoId,
      descripcion: detalle.descripcion,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
      descuentoPorcentaje: detalle.descuentoPorcentaje,
      descuentoMonto: detalle.descuentoMonto,
      impuestoPorcentaje: detalle.impuestoPorcentaje,
      impuestoMonto: detalle.impuestoMonto,
      subtotal: detalle.subtotal,
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

    const detalleData: DetalleFacturaRequest = this.detalleForm.value;

    if (this.isEditMode && this.selectedDetalleId) {
      this.detalleFacturaService.actualizar(this.selectedDetalleId, detalleData).subscribe({
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
      this.detalleFacturaService.crear(detalleData).subscribe({
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

  async eliminarDetalle(detalle: DetalleFacturaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar este detalle de la factura?`
    );

    if (confirmed) {
      this.detalleFacturaService.eliminar(detalle.id).subscribe({
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

  calcularSubtotal(): number {
    const cantidad = this.detalleForm.get('cantidad')?.value || 0;
    const precioUnitario = this.detalleForm.get('precioUnitario')?.value || 0;
    const descuentoPorcentaje = this.detalleForm.get('descuentoPorcentaje')?.value || 0;
    const descuentoMonto = this.detalleForm.get('descuentoMonto')?.value || 0;
    
    const subtotalBase = cantidad * precioUnitario;
    const descuentoPorcentajeCalculado = subtotalBase * (descuentoPorcentaje / 100);
    const subtotal = subtotalBase - descuentoPorcentajeCalculado - descuentoMonto;
    
    // Actualizar el formulario
    this.detalleForm.patchValue({ subtotal }, { emitEvent: false });
    return subtotal;
  }

  calcularImpuesto(): number {
    const subtotal = this.calcularSubtotal();
    const impuestoPorcentaje = this.detalleForm.get('impuestoPorcentaje')?.value || 0;
    const impuestoMonto = subtotal * (impuestoPorcentaje / 100);
    
    // Actualizar el formulario
    this.detalleForm.patchValue({ impuestoMonto }, { emitEvent: false });
    return impuestoMonto;
  }

  calcularTotal(): number {
    const subtotal = this.calcularSubtotal();
    const impuesto = this.calcularImpuesto();
    const total = subtotal + impuesto;
    
    // Actualizar el formulario
    this.detalleForm.patchValue({ total }, { emitEvent: false });
    return total;
  }
}
