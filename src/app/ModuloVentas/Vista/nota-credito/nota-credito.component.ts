import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotaCreditoService } from '../../Service/nota-credito.service';
import { DetalleNotaCreditoService } from '../../Service/detalle-nota-credito.service';
import { FacturaService } from '../../Service/factura.service';
import { NotaCreditoRequest, NotaCreditoResponse } from '../../Entidad/nota-credito.model';
import { DetalleNotaCreditoResponse } from '../../Entidad/detalle-nota-credito.model';
import { FacturaResponse } from '../../Entidad/factura.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-nota-credito',
  standalone: false,
  templateUrl: './nota-credito.component.html',
  styleUrl: './nota-credito.component.css'
})
export class NotaCreditoComponent implements OnInit {
  notasCredito: NotaCreditoResponse[] = [];
  notasCreditoFiltradas: NotaCreditoResponse[] = [];
  facturas: FacturaResponse[] = [];
  clienteNombreSeleccionado: string = '';
  notaCreditoForm: FormGroup;
  showModal = false;
  showDetalleModal = false;
  showAutorizacionModal = false;
  isEditMode = false;
  selectedNotaCreditoId?: number;
  selectedNotaCredito?: NotaCreditoResponse;
  detallesNotaCredito: DetalleNotaCreditoResponse[] = [];
  loading = false;
  searchTerm = '';
  
  // Formulario de autorización SRI
  autorizacionForm: FormGroup;

  // Filtros
  filtroEstado: string = 'TODOS';
  estados = ['TODOS', 'EMITIDA', 'APLICADA', 'ANULADA'];

  tiposNota = ['DEVOLUCION', 'DESCUENTO', 'ANULACION'];

  constructor(
    private readonly notaCreditoService: NotaCreditoService,
    private readonly detalleNotaCreditoService: DetalleNotaCreditoService,
    private readonly facturaService: FacturaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.notaCreditoForm = this.fb.group({
      numeroNotaCredito: ['', [Validators.required, Validators.maxLength(20)]],
      facturaId: ['', [Validators.required]],
      clienteId: ['', [Validators.required]],
      fechaEmision: ['', [Validators.required]],
      tipoNota: ['DEVOLUCION', [Validators.required]],
      motivo: ['', [Validators.required]],
      subtotal: [0, [Validators.required, Validators.min(0)]],
      descuentoMonto: [0, [Validators.min(0)]],
      impuestoMonto: [0, [Validators.required, Validators.min(0)]],
      total: [0, [Validators.required, Validators.min(0)]],
      afectaInventario: [false],
      movimientoInventarioId: [null],
      observaciones: [''],
      autorizadoSri: [false],
      numeroAutorizacion: [''],
      claveAcceso: ['']
    });

    this.autorizacionForm = this.fb.group({
      numeroAutorizacion: ['', [Validators.required]],
      claveAcceso: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarNotasCredito();
    this.cargarFacturas();
  }

  cargarFacturas(): void {
    this.facturaService.obtenerTodos().subscribe({
      next: (data: FacturaResponse[]) => {
        this.facturas = data.filter(f => f.estado !== 'ANULADA');
      },
      error: (error: any) => {
        this.notificationService.error('Error al cargar facturas', error.message);
      }
    });
  }

  onFacturaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const facturaId = Number(selectElement.value);
    
    if (facturaId) {
      const facturaSeleccionada = this.facturas.find(f => f.id === facturaId);
      if (facturaSeleccionada) {
        this.notaCreditoForm.patchValue({
          clienteId: facturaSeleccionada.clienteId
        });
        this.clienteNombreSeleccionado = facturaSeleccionada.clienteNombre || 'Cliente no disponible';
      }
    } else {
      this.notaCreditoForm.patchValue({ clienteId: '' });
      this.clienteNombreSeleccionado = '';
    }
  }

  cargarNotasCredito(): void {
    this.loading = true;
    this.notaCreditoService.obtenerTodos().subscribe({
      next: (data: NotaCreditoResponse[]) => {
        this.notasCredito = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error: Error) => {
        this.notificationService.error('Error al cargar notas de crédito', error.message);
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtradas = [...this.notasCredito];

    // Filtrar por estado
    if (this.filtroEstado !== 'TODOS') {
      filtradas = filtradas.filter(nc => nc.estado === this.filtroEstado);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtradas = filtradas.filter(notaCredito =>
        notaCredito.numeroNotaCredito.toLowerCase().includes(term) ||
        notaCredito.clienteNombre?.toLowerCase().includes(term) ||
        notaCredito.facturaNumero?.toLowerCase().includes(term)
      );
    }

    this.notasCreditoFiltradas = filtradas;
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.notaCreditoForm.reset({
      tipoNota: 'DEVOLUCION',
      subtotal: 0,
      descuentoMonto: 0,
      impuestoMonto: 0,
      total: 0,
      afectaInventario: false,
      autorizadoSri: false,
      fechaEmision: new Date().toISOString().split('T')[0]
    });
    this.showModal = true;
  }

  abrirModalEditar(notaCredito: NotaCreditoResponse): void {
    this.isEditMode = true;
    this.selectedNotaCreditoId = notaCredito.id;
    this.notaCreditoForm.patchValue({
      numeroNotaCredito: notaCredito.numeroNotaCredito,
      facturaId: notaCredito.facturaId,
      clienteId: notaCredito.clienteId,
      fechaEmision: notaCredito.fechaEmision,
      tipoNota: notaCredito.tipoNota,
      motivo: notaCredito.motivo,
      subtotal: notaCredito.subtotal,
      descuentoMonto: notaCredito.descuentoMonto,
      impuestoMonto: notaCredito.impuestoMonto,
      total: notaCredito.total,
      afectaInventario: notaCredito.afectaInventario,
      movimientoInventarioId: notaCredito.movimientoInventarioId,
      observaciones: notaCredito.observaciones,
      autorizadoSri: !!notaCredito.numeroAutorizacion,
      numeroAutorizacion: notaCredito.numeroAutorizacion,
      claveAcceso: notaCredito.claveAcceso
    });
    
    // Establecer el nombre del cliente desde la factura
    const facturaSeleccionada = this.facturas.find(f => f.id === notaCredito.facturaId);
    if (facturaSeleccionada) {
      this.clienteNombreSeleccionado = facturaSeleccionada.clienteNombre || 'Cliente no disponible';
    } else {
      this.clienteNombreSeleccionado = notaCredito.clienteNombre || '';
    }
    
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.notaCreditoForm.reset();
    this.isEditMode = false;
    this.selectedNotaCreditoId = undefined;
    this.clienteNombreSeleccionado = '';
  }

  async guardarNotaCredito(): Promise<void> {
    if (this.notaCreditoForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    const notaCreditoData: NotaCreditoRequest = this.notaCreditoForm.value;

    if (this.isEditMode && this.selectedNotaCreditoId) {
      this.notaCreditoService.actualizar(this.selectedNotaCreditoId, notaCreditoData).subscribe({
        next: () => {
          this.notificationService.success('Nota de crédito actualizada', 'La nota de crédito se actualizó correctamente');
          this.cargarNotasCredito();
          this.cerrarModal();
        },
        error: (error: Error) => {
          this.notificationService.error('Error al actualizar nota de crédito', error.message);
        }
      });
    } else {
      this.notaCreditoService.crear(notaCreditoData).subscribe({
        next: () => {
          this.notificationService.success('Nota de crédito creada', 'La nota de crédito se creó correctamente');
          this.cargarNotasCredito();
          this.cerrarModal();
        },
        error: (error: Error) => {
          this.notificationService.error('Error al crear nota de crédito', error.message);
        }
      });
    }
  }

  verDetalles(notaCredito: NotaCreditoResponse): void {
    if (!notaCredito?.id) {
      this.notificationService.error('Error', 'ID de nota de crédito no válido');
      return;
    }

    this.selectedNotaCredito = notaCredito;
    this.detalleNotaCreditoService.obtenerPorNotaCredito(notaCredito.id).subscribe({
      next: (detalles: DetalleNotaCreditoResponse[]) => {
        this.detallesNotaCredito = detalles;
        this.showDetalleModal = true;
      },
      error: (error: Error) => {
        console.error('Error al obtener detalles de nota de crédito:', error);
        this.notificationService.error('Error al cargar detalles', error.message || 'No se pudieron obtener los detalles de la nota de crédito');
      }
    });
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.selectedNotaCredito = undefined;
    this.detallesNotaCredito = [];
  }

  abrirModalAutorizacion(notaCredito: NotaCreditoResponse): void {
    this.selectedNotaCredito = notaCredito;
    this.autorizacionForm.reset();
    this.showAutorizacionModal = true;
  }

  cerrarAutorizacionModal(): void {
    this.showAutorizacionModal = false;
    this.selectedNotaCredito = undefined;
    this.autorizacionForm.reset();
  }

  async autorizarSri(): Promise<void> {
    if (this.autorizacionForm.invalid || !this.selectedNotaCredito) {
      this.notificationService.warning('Datos incompletos', 'Complete todos los campos de autorización');
      return;
    }

    const { numeroAutorizacion, claveAcceso } = this.autorizacionForm.value;
    this.notaCreditoService.autorizarSri(this.selectedNotaCredito.id, numeroAutorizacion, claveAcceso).subscribe({
      next: () => {
        this.notificationService.success('Nota de crédito autorizada', 'La nota de crédito fue autorizada por el SRI');
        this.cargarNotasCredito();
        this.cerrarAutorizacionModal();
      },
      error: (error: Error) => {
        this.notificationService.error('Error al autorizar', error.message);
      }
    });
  }

  async aplicarNotaCredito(notaCredito: NotaCreditoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Está seguro de aplicar la nota de crédito "${notaCredito.numeroNotaCredito}"?`,
      'Aplicar Nota de Crédito'
    );

    if (confirmed) {
      this.notaCreditoService.aplicar(notaCredito.id).subscribe({
        next: () => {
          this.notificationService.success('Nota de crédito aplicada', 'La nota de crédito se aplicó correctamente');
          this.cargarNotasCredito();
        },
        error: (error) => {
          this.notificationService.error('Error al aplicar nota de crédito', error.message);
        }
      });
    }
  }

  async anularNotaCredito(notaCredito: NotaCreditoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Está seguro de anular la nota de crédito "${notaCredito.numeroNotaCredito}"?`,
      'Anular Nota de Crédito'
    );

    if (confirmed) {
      this.notaCreditoService.anular(notaCredito.id).subscribe({
        next: () => {
          this.notificationService.success('Nota de crédito anulada', 'La nota de crédito se anuló correctamente');
          this.cargarNotasCredito();
        },
        error: (error) => {
          this.notificationService.error('Error al anular nota de crédito', error.message);
        }
      });
    }
  }

  async eliminarNotaCredito(notaCredito: NotaCreditoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar la nota de crédito "${notaCredito.numeroNotaCredito}"?`
    );

    if (confirmed) {
      this.notaCreditoService.eliminar(notaCredito.id).subscribe({
        next: () => {
          this.notificationService.success('Nota de crédito eliminada', 'La nota de crédito se eliminó correctamente');
          this.cargarNotasCredito();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar nota de crédito', error.message);
        }
      });
    }
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: { [key: string]: string } = {
      'EMITIDA': 'badge-warning',
      'APLICADA': 'badge-success',
      'ANULADA': 'badge-secondary'
    };
    return classes[estado] || 'badge-secondary';
  }

  getTipoNotaBadgeClass(tipo: string): string {
    const classes: { [key: string]: string } = {
      'DEVOLUCION': 'badge-warning',
      'DESCUENTO': 'badge-success',
      'ANULACION': 'badge-danger'
    };
    return classes[tipo] || 'badge-secondary';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.notaCreditoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.notaCreditoForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) return 'Texto demasiado largo';
    if (field?.hasError('min')) return 'El valor debe ser mayor o igual a 0';
    return '';
  }

  calcularTotal(): void {
    const subtotal = this.notaCreditoForm.get('subtotal')?.value || 0;
    const descuento = this.notaCreditoForm.get('descuentoMonto')?.value || 0;
    const impuesto = this.notaCreditoForm.get('impuestoMonto')?.value || 0;
    
    const total = subtotal - descuento + impuesto;
    this.notaCreditoForm.patchValue({ total }, { emitEvent: false });
  }
}
