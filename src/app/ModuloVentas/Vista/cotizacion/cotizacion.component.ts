import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CotizacionService } from '../../Service/cotizacion.service';
import { ClienteService } from '../../Service/cliente.service';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { ListaPreciosService } from '../../Service/lista-precios.service';
import { CotizacionResponse, CotizacionRequest } from '../../Entidad/cotizacion.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { CondicionPagoResponse } from '../../Entidad/condicion-pago.model';
import { ListaPreciosResponse } from '../../Entidad/lista-precios.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

interface DetalleItem {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestoPorcentaje: number;
  subtotal: number;
  impuestoMonto: number;
  total: number;
}

@Component({
  selector: 'app-cotizacion',
  standalone: false,
  templateUrl: './cotizacion.component.html',
  styleUrl: './cotizacion.component.css'
})
export class CotizacionComponent implements OnInit {
  cotizaciones: CotizacionResponse[] = [];
  cotizacionesFiltradas: CotizacionResponse[] = [];
  clientes: ClienteResponse[] = [];
  condicionesPago: CondicionPagoResponse[] = [];
  listasPrecios: ListaPreciosResponse[] = [];
  cotizacionForm: FormGroup;
  showModal: boolean = false;
  showDetalleModal: boolean = false;
  isEditing: boolean = false;
  editingCotizacionId: number | null = null;
  loading: boolean = false;
  busqueda: string = '';
  detallesCotizacion: DetalleItem[] = [];

  // Filtros
  filtroEstado: string = 'TODOS';
  estados = ['TODOS', 'BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'CONVERTIDA', 'VENCIDA', 'CANCELADA'];

  constructor(
    private readonly cotizacionService: CotizacionService,
    private readonly clienteService: ClienteService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly listaPreciosService: ListaPreciosService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.cotizacionForm = this.formBuilder.group({
      numeroCotizacion: ['', Validators.required],
      clienteId: [null, Validators.required],
      contactoClienteId: [null],
      fechaCotizacion: [this.getFechaHoy(), Validators.required],
      fechaVencimiento: [this.getFechaFutura(30), Validators.required],
      vendedorId: [1, Validators.required],
      bodegaId: [1, Validators.required],
      listaPreciosId: [null, Validators.required],
      condicionPagoId: [null, Validators.required],
      subtotal: [0],
      descuentoPorcentaje: [0],
      descuentoMonto: [0],
      impuestoMonto: [0],
      total: [0],
      observaciones: [''],
      terminosCondiciones: [''],
      tiempoEntrega: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCotizaciones();
    this.cargarClientes();
    this.cargarCondicionesPago();
    this.cargarListasPrecios();
  }

  getFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  getFechaFutura(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }

  cargarCotizaciones(): void {
    this.loading = true;
    this.cotizacionService.findAll().subscribe({
      next: (data) => {
        this.cotizaciones = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cotizaciones:', error);
        this.notificationService.error(error.message, 'Error al cargar cotizaciones');
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
        this.notificationService.error('Error al cargar clientes');
      }
    });
  }

  cargarCondicionesPago(): void {
    this.condicionPagoService.findActivas().subscribe({
      next: (data) => {
        this.condicionesPago = data;
      },
      error: (error) => {
        console.error('Error al cargar condiciones de pago:', error);
        this.notificationService.error('Error al cargar condiciones de pago');
      }
    });
  }

  cargarListasPrecios(): void {
    this.listaPreciosService.findActivos().subscribe({
      next: (data) => {
        this.listasPrecios = data;
      },
      error: (error) => {
        console.error('Error al cargar listas de precios:', error);
        this.notificationService.error('Error al cargar listas de precios');
      }
    });
  }

  aplicarFiltros(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    
    this.cotizacionesFiltradas = this.cotizaciones.filter(cotizacion => {
      const cumpleBusqueda = 
        cotizacion.numeroCotizacion?.toLowerCase().includes(busquedaLower) ||
        cotizacion.clienteNombre?.toLowerCase().includes(busquedaLower) ||
        cotizacion.id.toString().includes(busquedaLower);
      
      const cumpleEstado = this.filtroEstado === 'TODOS' || cotizacion.estado === this.filtroEstado;
      
      return cumpleBusqueda && cumpleEstado;
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingCotizacionId = null;
    this.detallesCotizacion = [];
    this.cotizacionForm.reset({
      numeroCotizacion: `COT-${Date.now()}`,
      fechaCotizacion: this.getFechaHoy(),
      fechaVencimiento: this.getFechaFutura(30),
      vendedorId: 1,
      bodegaId: 1,
      subtotal: 0,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      impuestoMonto: 0,
      total: 0
    });
    this.showModal = true;
  }

  abrirModalEditar(cotizacion: CotizacionResponse): void {
    if (cotizacion.estado !== 'BORRADOR') {
      this.notificationService.warning('Solo se pueden editar cotizaciones en estado BORRADOR');
      return;
    }

    this.isEditing = true;
    this.editingCotizacionId = cotizacion.id;
    this.cotizacionForm.patchValue({
      numeroCotizacion: cotizacion.numeroCotizacion,
      clienteId: cotizacion.clienteId,
      contactoClienteId: cotizacion.contactoClienteId,
      fechaCotizacion: cotizacion.fechaCotizacion,
      fechaVencimiento: cotizacion.fechaVencimiento,
      vendedorId: cotizacion.vendedorId,
      bodegaId: cotizacion.bodegaId,
      listaPreciosId: cotizacion.listaPreciosId,
      condicionPagoId: cotizacion.condicionPagoId,
      subtotal: cotizacion.subtotal,
      descuentoPorcentaje: cotizacion.descuentoPorcentaje,
      descuentoMonto: cotizacion.descuentoMonto,
      impuestoMonto: cotizacion.impuestoMonto,
      total: cotizacion.total,
      observaciones: cotizacion.observaciones,
      terminosCondiciones: cotizacion.terminosCondiciones,
      tiempoEntrega: cotizacion.tiempoEntrega
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.cotizacionForm.reset();
    this.isEditing = false;
    this.editingCotizacionId = null;
    this.detallesCotizacion = [];
  }

  guardarCotizacion(): void {
    if (this.cotizacionForm.invalid) {
      this.cotizacionForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const cotizacionData: CotizacionRequest = this.cotizacionForm.value;

    if (this.isEditing && this.editingCotizacionId !== null) {
      this.cotizacionService.update(this.editingCotizacionId, cotizacionData).subscribe({
        next: () => {
          this.notificationService.success('Cotización actualizada exitosamente');
          this.cargarCotizaciones();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar cotización:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.cotizacionService.save(cotizacionData).subscribe({
        next: () => {
          this.notificationService.success('Cotización creada exitosamente');
          this.cargarCotizaciones();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear cotización:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarCotizacion(cotizacion: CotizacionResponse): Promise<void> {
    if (cotizacion.estado !== 'BORRADOR') {
      this.notificationService.warning('Solo se pueden eliminar cotizaciones en estado BORRADOR');
      return;
    }

    const confirmed = await this.notificationService.confirmDelete(cotizacion.numeroCotizacion);
    if (!confirmed) return;

    this.cotizacionService.delete(cotizacion.id).subscribe({
      next: () => {
        this.notificationService.toast('Cotización eliminada exitosamente', 'success');
        this.cargarCotizaciones();
      },
      error: (error) => {
        console.error('Error al eliminar cotización:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  enviarCotizacion(cotizacion: CotizacionResponse): void {
    if (cotizacion.estado !== 'BORRADOR') {
      this.notificationService.warning('Solo se pueden enviar cotizaciones en estado BORRADOR');
      return;
    }

    this.cotizacionService.enviar(cotizacion.id).subscribe({
      next: () => {
        this.notificationService.success('Cotización enviada exitosamente');
        this.cargarCotizaciones();
      },
      error: (error) => {
        console.error('Error al enviar cotización:', error);
        this.notificationService.error(error.message, 'Error al enviar');
      }
    });
  }

  aprobarCotizacion(cotizacion: CotizacionResponse): void {
    if (cotizacion.estado !== 'ENVIADA') {
      this.notificationService.warning('Solo se pueden aprobar cotizaciones enviadas');
      return;
    }

    this.cotizacionService.aprobar(cotizacion.id).subscribe({
      next: () => {
        this.notificationService.success('Cotización aprobada exitosamente');
        this.cargarCotizaciones();
      },
      error: (error) => {
        console.error('Error al aprobar cotización:', error);
        this.notificationService.error(error.message, 'Error al aprobar');
      }
    });
  }

  verDetalles(cotizacion: CotizacionResponse): void {
    this.editingCotizacionId = cotizacion.id;
    this.showDetalleModal = true;
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.editingCotizacionId = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cotizacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cotizacionForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    return '';
  }

  getEstadoClass(estado: string): string {
    const estadoClasses: { [key: string]: string } = {
      'BORRADOR': 'badge-secondary',
      'ENVIADA': 'badge-info',
      'APROBADA': 'badge-success',
      'RECHAZADA': 'badge-danger',
      'CONVERTIDA': 'badge-primary',
      'VENCIDA': 'badge-warning',
      'CANCELADA': 'badge-danger'
    };
    return estadoClasses[estado] || 'badge-secondary';
  }

  formatCurrency(value: number | undefined): string {
    return value ? `$${value.toFixed(2)}` : '$0.00';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-EC');
  }
}

