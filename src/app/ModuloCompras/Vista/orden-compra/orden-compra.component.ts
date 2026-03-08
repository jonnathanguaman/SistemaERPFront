import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { OrdenCompraService } from '../../Service/orden-compra.service';
import { ProveedorService } from '../../Service/proveedor.service';
import { OrdenCompraRequest, OrdenCompraResponse } from '../../Entidades/orden-compra.model';
import { ProveedorResponse } from '../../Entidades/proveedor.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-orden-compra',
  standalone: false,
  templateUrl: './orden-compra.component.html',
  styleUrl: './orden-compra.component.css'
})
export class OrdenCompraComponent implements OnInit {
  
  ordenes: OrdenCompraResponse[] = [];
  proveedores: ProveedorResponse[] = [];
  ordenSeleccionada: OrdenCompraResponse | null = null;
  ordenForm: FormGroup;
  
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  
  searchTerm: string = '';
  selectedEstado: string = '';
  
  // Estados disponibles
  estados = [
    { value: '', label: 'Todos' },
    { value: 'BORRADOR', label: 'Borrador' },
    { value: 'APROBADA', label: 'Aprobada' },
    { value: 'ENVIADA', label: 'Enviada' },
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'RECIBIDA', label: 'Recibida' },
    { value: 'FACTURADA', label: 'Facturada' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ];
  
  constructor(
    private readonly ordenCompraService: OrdenCompraService,
    private readonly proveedorService: ProveedorService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.ordenForm = this.formBuilder.group({
      numeroOrden: ['', [Validators.required, Validators.maxLength(20)]],
      proveedorId: ['', [Validators.required]],
      fechaOrden: ['', [Validators.required]],
      fechaEntregaEsperada: [''],
      bodegaId: ['', [Validators.required]],
      direccionEntrega: [''],
      compradorId: [''],
      aprobadorId: [''],
      condicionPagoId: [''],
      diasCredito: [''],
      formaPagoId: [''],
      descuentoPorcentaje: [0],
      descuentoMonto: [0],
      estado: ['BORRADOR'],
      observaciones: [''],
      terminosCondiciones: [''],
      detalles: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.cargarOrdenes();
    this.cargarProveedores();
  }

  get detalles(): FormArray {
    return this.ordenForm.get('detalles') as FormArray;
  }

  cargarOrdenes(): void {
    this.isLoading = true;
    
    this.ordenCompraService.findAll().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar órdenes');
        console.error('Error al cargar órdenes:', error);
      }
    });
  }

  cargarProveedores(): void {
    this.proveedorService.findActive().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar proveedores');
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.isViewMode = false;
    this.ordenSeleccionada = null;
    this.ordenForm.reset({
      estado: 'BORRADOR',
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      fechaOrden: new Date().toISOString().split('T')[0]
    });
    this.detalles.clear();
    this.agregarDetalle();
    this.showModal = true;
  }

  verDetalle(orden: OrdenCompraResponse): void {
    this.isEditMode = false;
    this.isViewMode = true;
    this.ordenSeleccionada = orden;
    
    this.ordenForm.patchValue({
      numeroOrden: orden.numeroOrden,
      proveedorId: orden.proveedorId,
      fechaOrden: orden.fechaOrden,
      fechaEntregaEsperada: orden.fechaEntregaEsperada,
      bodegaId: orden.bodegaId,
      direccionEntrega: orden.direccionEntrega,
      compradorId: orden.compradorId,
      aprobadorId: orden.aprobadorId,
      condicionPagoId: orden.condicionPagoId,
      diasCredito: orden.diasCredito,
      formaPagoId: orden.formaPagoId,
      descuentoPorcentaje: orden.descuentoPorcentaje,
      descuentoMonto: orden.descuentoMonto,
      estado: orden.estado,
      observaciones: orden.observaciones,
      terminosCondiciones: orden.terminosCondiciones
    });

    this.detalles.clear();
    if (orden.detalles && orden.detalles.length > 0) {
      orden.detalles.forEach(detalle => {
        this.detalles.push(this.formBuilder.group({
          productoId: [detalle.productoId],
          cantidadOrdenada: [detalle.cantidadOrdenada],
          precioUnitario: [detalle.precioUnitario],
          descuentoPorcentaje: [detalle.descuentoPorcentaje || 0],
          descuentoMonto: [detalle.descuentoMonto || 0],
          impuestoPorcentaje: [detalle.impuestoPorcentaje],
          observaciones: [detalle.observaciones || '']
        }));
      });
    }

    // Deshabilitar el formulario completo en modo solo lectura
    this.ordenForm.disable();
    
    this.showModal = true;
  }

  abrirModalEditar(orden: OrdenCompraResponse): void {
    this.isEditMode = true;
    this.isViewMode = false;
    this.ordenSeleccionada = orden;
    
    this.ordenForm.patchValue({
      numeroOrden: orden.numeroOrden,
      proveedorId: orden.proveedorId,
      fechaOrden: orden.fechaOrden,
      fechaEntregaEsperada: orden.fechaEntregaEsperada,
      bodegaId: orden.bodegaId,
      direccionEntrega: orden.direccionEntrega,
      compradorId: orden.compradorId,
      aprobadorId: orden.aprobadorId,
      condicionPagoId: orden.condicionPagoId,
      diasCredito: orden.diasCredito,
      formaPagoId: orden.formaPagoId,
      descuentoPorcentaje: orden.descuentoPorcentaje,
      descuentoMonto: orden.descuentoMonto,
      estado: orden.estado,
      observaciones: orden.observaciones,
      terminosCondiciones: orden.terminosCondiciones
    });

    this.detalles.clear();
    if (orden.detalles && orden.detalles.length > 0) {
      orden.detalles.forEach(detalle => {
        this.detalles.push(this.formBuilder.group({
          productoId: [detalle.productoId, [Validators.required]],
          cantidadOrdenada: [detalle.cantidadOrdenada, [Validators.required, Validators.min(0.0001)]],
          precioUnitario: [detalle.precioUnitario, [Validators.required, Validators.min(0)]],
          descuentoPorcentaje: [detalle.descuentoPorcentaje || 0],
          descuentoMonto: [detalle.descuentoMonto || 0],
          impuestoPorcentaje: [detalle.impuestoPorcentaje, [Validators.required, Validators.min(0)]],
          observaciones: [detalle.observaciones || '']
        }));
      });
    } else {
      this.agregarDetalle();
    }
    
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.ordenForm.reset();
    this.ordenForm.enable();
    this.detalles.clear();
    this.ordenSeleccionada = null;
    this.isViewMode = false;
  }

  agregarDetalle(): void {
    const detalleGroup = this.formBuilder.group({
      productoId: ['', [Validators.required]],
      cantidadOrdenada: [1, [Validators.required, Validators.min(0.0001)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      descuentoPorcentaje: [0],
      descuentoMonto: [0],
      impuestoPorcentaje: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });

    this.detalles.push(detalleGroup);
  }

  eliminarDetalle(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    } else {
      this.notificationService.warning('Debe haber al menos un detalle en la orden');
    }
  }

  calcularTotalDetalle(index: number): number {
    const detalle = this.detalles.at(index).value;
    const cantidad = detalle.cantidadOrdenada || 0;
    const precio = detalle.precioUnitario || 0;
    const descuento = detalle.descuentoMonto || 0;
    const impuesto = detalle.impuestoPorcentaje || 0;
    
    const subtotal = (cantidad * precio) - descuento;
    const montoImpuesto = subtotal * (impuesto / 100);
    return subtotal + montoImpuesto;
  }

  calcularTotalOrden(): number {
    let total = 0;
    for (let i = 0; i < this.detalles.length; i++) {
      total += this.calcularTotalDetalle(i);
    }
    return total;
  }

  guardarOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    if (this.detalles.length === 0) {
      this.notificationService.warning('Debe agregar al menos un detalle a la orden.');
      return;
    }

    this.isLoading = true;
    
    const ordenData: OrdenCompraRequest = {
      ...this.ordenForm.value,
      detalles: this.detalles.value
    };

    if (this.isEditMode && this.ordenSeleccionada) {
      this.ordenCompraService.update(this.ordenSeleccionada.id, ordenData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Orden de compra actualizada exitosamente');
          this.cargarOrdenes();
          this.cerrarModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.ordenCompraService.save(ordenData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Orden de compra creada exitosamente');
          this.cargarOrdenes();
          this.cerrarModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarOrden(orden: OrdenCompraResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(orden.numeroOrden);
    
    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.ordenCompraService.delete(orden.id).subscribe({
      next: () => {
        this.notificationService.toast('Orden de compra eliminada exitosamente', 'success');
        this.cargarOrdenes();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  async aprobarOrden(orden: OrdenCompraResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Deseas aprobar esta orden de compra?',
      `Orden: ${orden.numeroOrden}`,
      'question'
    );
    
    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.ordenCompraService.aprobar(orden.id).subscribe({
      next: () => {
        this.notificationService.toast('Orden aprobada exitosamente', 'success');
        this.cargarOrdenes();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al aprobar');
      }
    });
  }

  get ordenesFiltradas(): OrdenCompraResponse[] {
    let filtered = this.ordenes;

    // Filtrar por estado
    if (this.selectedEstado) {
      filtered = filtered.filter(orden => orden.estado === this.selectedEstado);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(orden => 
        orden.numeroOrden.toLowerCase().includes(term) ||
        orden.proveedorRazonSocial?.toLowerCase().includes(term) ||
        orden.bodegaNombre?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'BORRADOR': 'badge-draft',
      'APROBADA': 'badge-success',
      'ENVIADA': 'badge-info',
      'CONFIRMADA': 'badge-primary',
      'RECIBIDA': 'badge-success',
      'FACTURADA': 'badge-success',
      'CANCELADA': 'badge-danger'
    };
    return clases[estado] || 'badge-secondary';
  }

  getNombreProveedor(proveedorId: number): string {
    const proveedor = this.proveedores.find(p => p.id === proveedorId);
    return proveedor ? proveedor.razonSocial : '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ordenForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isDetalleFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.detalles.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.ordenForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    
    return '';
  }
}
