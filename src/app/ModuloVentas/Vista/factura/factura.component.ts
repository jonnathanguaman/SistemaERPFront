import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FacturaService } from '../../Service/factura.service';
import { DetalleFacturaService } from '../../Service/detalle-factura.service';
import { FacturaRequest, FacturaResponse } from '../../Entidad/factura.model';
import { DetalleFacturaResponse } from '../../Entidad/detalle-factura.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-factura',
  standalone: false,
  templateUrl: './factura.component.html',
  styleUrl: './factura.component.css'
})
export class FacturaComponent implements OnInit {
  facturas: FacturaResponse[] = [];
  facturasFiltradas: FacturaResponse[] = [];
  facturaForm: FormGroup;
  showModal = false;
  showDetalleModal = false;
  showPagoModal = false;
  showAutorizacionModal = false;
  isEditMode = false;
  selectedFacturaId?: number;
  selectedFactura?: FacturaResponse;
  detallesFactura: DetalleFacturaResponse[] = [];
  loading = false;
  searchTerm = '';
  
  // Formulario de pago
  pagoForm: FormGroup;
  
  // Formulario de autorización SRI
  autorizacionForm: FormGroup;

  // Filtros
  filtroEstado: string = 'TODOS';
  estados = ['TODOS', 'PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA'];

  constructor(
    private readonly facturaService: FacturaService,
    private readonly detalleFacturaService: DetalleFacturaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.facturaForm = this.fb.group({
      numeroFactura: ['', [Validators.required, Validators.maxLength(20)]],
      ordenVentaId: ['', [Validators.required]],
      despachoId: [''],
      clienteId: ['', [Validators.required]],
      direccionFacturacionId: [''],
      fechaEmision: ['', [Validators.required]],
      fechaVencimiento: ['', [Validators.required]],
      formaPagoId: ['', [Validators.required]],
      referenciaPago: ['', [Validators.maxLength(100)]],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      descuentoMonto: [0, [Validators.min(0)]],
      impuestoMonto: [0, [Validators.required, Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      saldoPendiente: [0],
      observaciones: [''],
      autorizadoSri: [false],
      numeroAutorizacion: [''],
      claveAcceso: [''],
      emailDestinatario: ['', [Validators.email, Validators.maxLength(255)]]
    });

    this.pagoForm = this.fb.group({
      monto: [0, [Validators.required, Validators.min(0.01)]]
    });

    this.autorizacionForm = this.fb.group({
      numeroAutorizacion: ['', [Validators.required]],
      claveAcceso: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.loading = true;
    this.facturaService.obtenerTodos().subscribe({
      next: (data: FacturaResponse[]) => {
        this.facturas = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error: Error) => {
        this.notificationService.error('Error al cargar facturas', error.message);
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.facturas];

    // Filtrar por estado
    if (this.filtroEstado !== 'TODOS') {
      filtradas = filtradas.filter(f => f.estado === this.filtroEstado);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtradas = filtradas.filter(factura =>
        factura.numeroFactura.toLowerCase().includes(term) ||
        factura.clienteNombre?.toLowerCase().includes(term) ||
        factura.ordenVentaNumero?.toLowerCase().includes(term)
      );
    }

    this.facturasFiltradas = filtradas;
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.facturaForm.reset({
      subtotal: 0,
      descuentoMonto: 0,
      impuestoMonto: 0,
      total: 0,
      saldoPendiente: 0,
      autorizadoSri: false,
      fechaEmision: new Date().toISOString().split('T')[0]
    });
    this.showModal = true;
  }

  abrirModalEditar(factura: FacturaResponse): void {
    this.isEditMode = true;
    this.selectedFacturaId = factura.id;
    this.facturaForm.patchValue({
      numeroFactura: factura.numeroFactura,
      ordenVentaId: factura.ordenVentaId,
      despachoId: factura.despachoId,
      clienteId: factura.clienteId,
      direccionFacturacionId: factura.direccionFacturacionId,
      fechaEmision: factura.fechaEmision,
      fechaVencimiento: factura.fechaVencimiento,
      formaPagoId: factura.formaPagoId,
      referenciaPago: factura.referenciaPago,
      subtotal: factura.subtotal,
      descuentoMonto: factura.descuentoMonto,
      impuestoMonto: factura.impuestoMonto,
      total: factura.total,
      saldoPendiente: factura.saldoPendiente,
      observaciones: factura.observaciones,
      autorizadoSri: factura.autorizadoSri,
      numeroAutorizacion: factura.numeroAutorizacion,
      claveAcceso: factura.claveAcceso,
      emailDestinatario: factura.emailDestinatario
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.facturaForm.reset();
    this.isEditMode = false;
    this.selectedFacturaId = undefined;
  }

  async guardarFactura(): Promise<void> {
    if (this.facturaForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    const facturaData: FacturaRequest = this.facturaForm.value;

    if (this.isEditMode && this.selectedFacturaId) {
      this.facturaService.actualizar(this.selectedFacturaId, facturaData).subscribe({
        next: () => {
          this.notificationService.success('Factura actualizada', 'La factura se actualizó correctamente');
          this.cargarFacturas();
          this.cerrarModal();
        },
        error: (error: Error) => {
          this.notificationService.error('Error al actualizar factura', error.message);
        }
      });
    } else {
      this.facturaService.crear(facturaData).subscribe({
        next: () => {
          this.notificationService.success('Factura creada', 'La factura se creó correctamente');
          this.cargarFacturas();
          this.cerrarModal();
        },
        error: (error: Error) => {
          this.notificationService.error('Error al crear factura', error.message);
        }
      });
    }
  }

  verDetalles(factura: FacturaResponse): void {
    if (!factura?.id) {
      this.notificationService.error('Error', 'ID de factura no válido');
      return;
    }

    this.selectedFactura = factura;
    this.detalleFacturaService.obtenerPorFactura(factura.id).subscribe({
      next: (detalles: DetalleFacturaResponse[]) => {
        this.detallesFactura = detalles;
        this.showDetalleModal = true;
      },
      error: (error: Error) => {
        console.error('Error al obtener detalles de factura:', error);
        this.notificationService.error('Error al cargar detalles', error.message || 'No se pudieron obtener los detalles de la factura');
      }
    });
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.selectedFactura = undefined;
    this.detallesFactura = [];
  }

  abrirModalPago(factura: FacturaResponse): void {
    this.selectedFactura = factura;
    this.pagoForm.patchValue({ monto: factura.saldoPendiente || 0 });
    this.showPagoModal = true;
  }

  cerrarPagoModal(): void {
    this.showPagoModal = false;
    this.selectedFactura = undefined;
    this.pagoForm.reset();
  }

  async registrarPago(): Promise<void> {
    if (this.pagoForm.invalid || !this.selectedFactura) {
      this.notificationService.warning('Datos inválidos', 'Por favor ingrese un monto válido');
      return;
    }

    const monto = this.pagoForm.value.monto;
    this.facturaService.registrarPago(this.selectedFactura.id, monto).subscribe({
      next: () => {
        this.notificationService.success('Pago registrado', 'El pago se registró correctamente');
        this.cargarFacturas();
        this.cerrarPagoModal();
      },
      error: (error: Error) => {
        this.notificationService.error('Error al registrar pago', error.message);
      }
    });
  }

  abrirModalAutorizacion(factura: FacturaResponse): void {
    this.selectedFactura = factura;
    this.autorizacionForm.reset();
    this.showAutorizacionModal = true;
  }

  cerrarAutorizacionModal(): void {
    this.showAutorizacionModal = false;
    this.selectedFactura = undefined;
    this.autorizacionForm.reset();
  }

  async autorizarSri(): Promise<void> {
    if (this.autorizacionForm.invalid || !this.selectedFactura) {
      this.notificationService.warning('Datos incompletos', 'Complete todos los campos de autorización');
      return;
    }

    const { numeroAutorizacion, claveAcceso } = this.autorizacionForm.value;
    this.facturaService.autorizarSri(this.selectedFactura.id, numeroAutorizacion, claveAcceso).subscribe({
      next: () => {
        this.notificationService.success('Factura autorizada', 'La factura fue autorizada por el SRI');
        this.cargarFacturas();
        this.cerrarAutorizacionModal();
      },
      error: (error: Error) => {
        this.notificationService.error('Error al autorizar', error.message);
      }
    });
  }

  async anularFactura(factura: FacturaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de anular la factura "${factura.numeroFactura}"?`
    );

    if (confirmed) {
      this.facturaService.anular(factura.id).subscribe({
        next: () => {
          this.notificationService.success('Factura anulada', 'La factura se anuló correctamente');
          this.cargarFacturas();
        },
        error: (error) => {
          this.notificationService.error('Error al anular factura', error.message);
        }
      });
    }
  }

  async eliminarFactura(factura: FacturaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar la factura "${factura.numeroFactura}"?`
    );

    if (confirmed) {
      this.facturaService.eliminar(factura.id).subscribe({
        next: () => {
          this.notificationService.success('Factura eliminada', 'La factura se eliminó correctamente');
          this.cargarFacturas();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar factura', error.message);
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'PENDIENTE': 'badge-warning',
      'PAGADA': 'badge-success',
      'VENCIDA': 'badge-danger',
      'ANULADA': 'badge-secondary'
    };
    return classes[estado] || 'badge-secondary';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.facturaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.facturaForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) return 'Texto demasiado largo';
    if (field?.hasError('min')) return 'El valor debe ser mayor o igual a 0';
    if (field?.hasError('email')) return 'Email inválido';
    return '';
  }

  calcularTotal(): void {
    const subtotal = this.facturaForm.get('subtotal')?.value || 0;
    const descuento = this.facturaForm.get('descuentoMonto')?.value || 0;
    const impuesto = this.facturaForm.get('impuestoMonto')?.value || 0;
    
    const total = subtotal - descuento + impuesto;
    this.facturaForm.patchValue({ total, saldoPendiente: total }, { emitEvent: false });
  }
}
