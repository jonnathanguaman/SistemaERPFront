import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetalleNotaCreditoService } from '../../Service/detalle-nota-credito.service';
import { NotaCreditoService } from '../../Service/nota-credito.service';
import { DetalleNotaCreditoRequest, DetalleNotaCreditoResponse } from '../../Entidad/detalle-nota-credito.model';
import { NotaCreditoResponse } from '../../Entidad/nota-credito.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { IvaProductoService } from '../../Service/iva-producto.service';

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
  showForm = false;
  isEditMode = false;
  selectedDetalleId?: number;
  loading = false;
  searchTerm = '';
  private readonly ivaPorProducto = new Map<number, number>();
  
  // Filtro por nota de crédito
  filtroNotaCreditoId?: number;

  constructor(
    private readonly detalleNotaCreditoService: DetalleNotaCreditoService,
    private readonly notaCreditoService: NotaCreditoService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService,
    private readonly ivaProductoService: IvaProductoService
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
    this.detalleForm.get('productoId')?.valueChanges.subscribe((value) => {
      this.aplicarIvaPorProducto(Number(value || 0));
    });

    this.detalleForm.get('cantidad')?.valueChanges.subscribe(() => {
      this.recalcularLinea();
    });

    this.detalleForm.get('precioUnitario')?.valueChanges.subscribe(() => {
      this.recalcularLinea();
    });

    this.detalleForm.get('impuestoPorcentaje')?.valueChanges.subscribe(() => {
      this.recalcularLinea();
    });

    this.cargarNotasCredito();
  }

  private aplicarIvaPorProducto(productoId: number): void {
    if (!productoId) {
      this.detalleForm.patchValue({ impuestoPorcentaje: 0 }, { emitEvent: false });
      this.calcularImpuesto();
      return;
    }

    const ivaCacheado = this.ivaPorProducto.get(productoId);
    if (ivaCacheado !== undefined) {
      this.detalleForm.patchValue({ impuestoPorcentaje: ivaCacheado }, { emitEvent: false });
      this.calcularImpuesto();
      return;
    }

    this.ivaProductoService.findVigenteByProducto(productoId).subscribe({
      next: (iva) => {
        const porcentaje = Number(iva.impuestoPorcentaje || 0);
        this.ivaPorProducto.set(productoId, porcentaje);
        this.detalleForm.patchValue({ impuestoPorcentaje: porcentaje }, { emitEvent: false });
        this.calcularImpuesto();
      },
      error: () => {
        this.ivaPorProducto.set(productoId, 0);
        this.detalleForm.patchValue({ impuestoPorcentaje: 0 }, { emitEvent: false });
        this.calcularImpuesto();
      }
    });
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

  abrirFormCrear(): void {
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
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  abrirFormEditar(detalle: DetalleNotaCreditoResponse): void {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  cerrarForm(): void {
    this.showForm = false;
    this.detalleForm.reset();
    this.isEditMode = false;
    this.selectedDetalleId = undefined;
  }

  async guardarDetalle(): Promise<void> {
    if (this.detalleForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.recalcularLinea();

    const detalleData: DetalleNotaCreditoRequest = this.detalleForm.value;

    if (detalleData.total <= 0) {
      this.notificationService.warning('Total inválido', 'El total del detalle debe ser mayor a 0');
      return;
    }

    if (this.isEditMode && this.selectedDetalleId) {
      this.detalleNotaCreditoService.actualizar(this.selectedDetalleId, detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle actualizado', 'El detalle se actualizó correctamente');
          this.cargarDetalles();
          this.cerrarForm();
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
          this.cerrarForm();
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
    this.recalcularLinea();
  }

  calcularImpuesto(): void {
    this.recalcularLinea();
  }

  calcularTotal(): void {
    this.recalcularLinea();
  }

  private recalcularLinea(): void {
    const cantidad = Number(this.detalleForm.get('cantidad')?.value || 0);
    const precioUnitario = Number(this.detalleForm.get('precioUnitario')?.value || 0);
    const impuestoPorcentaje = Number(this.detalleForm.get('impuestoPorcentaje')?.value || 0);

    const subtotal = this.redondear(cantidad * precioUnitario);
    const impuestoMonto = this.redondear(subtotal * (impuestoPorcentaje / 100));
    const total = this.redondear(subtotal + impuestoMonto);

    this.detalleForm.patchValue(
      { subtotal, impuestoMonto, total },
      { emitEvent: false }
    );
  }

  private redondear(valor: number): number {
    return Number((valor || 0).toFixed(2));
  }
}
