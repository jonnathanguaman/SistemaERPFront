import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DespachoService } from '../../Service/despacho.service';
import { DetalleDespachoService } from '../../Service/detalle-despacho.service';
import { OrdenVentaService } from '../../Service/orden-venta.service';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { DespachoResponse, DespachoRequest } from '../../Entidad/despacho.model';
import { DetalleDespachoResponse } from '../../Entidad/detalle-despacho.model';
import { OrdenVentaResponse } from '../../Entidad/orden-venta.model';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-despacho',
  standalone: false,
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.css'
})
export class DespachoComponent implements OnInit {
  despachos: DespachoResponse[] = [];
  despachosFiltrados: DespachoResponse[] = [];
  despachoForm: FormGroup;
  showModal: boolean = false;
  showDetalleModal: boolean = false;
  isEditing: boolean = false;
  editingDespachoId: number | null = null;
  loading: boolean = false;
  busqueda: string = '';
  detallesDespacho: DetalleDespachoResponse[] = [];
  despachoSeleccionado: DespachoResponse | null = null;
  ordenesVenta: OrdenVentaResponse[] = [];
  bodegas: BodegaResponse[] = [];

  // Filtros
  filtroEstado: string = 'TODOS';
  estados = ['TODOS', 'BORRADOR', 'EN_PREPARACION', 'PREPARADO', 'DESPACHADO', 'ENTREGADO', 'CANCELADO'];

  constructor(
    private readonly despachoService: DespachoService,
    private readonly detalleService: DetalleDespachoService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly bodegaService: BodegaService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.despachoForm = this.formBuilder.group({
      numeroDespacho: ['', Validators.required],
      numeroGuiaRemision: [''],
      ordenVentaId: [null, Validators.required],
      bodegaId: [null, Validators.required],
      fechaDespacho: [this.getFechaHoy(), Validators.required],
      fechaEntregaEstimada: [''],
      responsablePreparacionId: [null],
      responsableDespachoId: [null],
      transportista: [''],
      placaVehiculo: [''],
      conductor: [''],
      cedulaConductor: [''],
      direccionEntregaId: [null],
      direccionEntregaTexto: [''],
      observaciones: [''],
      nombreQuienRecibe: [''],
      cedulaQuienRecibe: [''],
      usuarioCreacionId: [1]
    });
  }

  ngOnInit(): void {
    this.cargarDespachos();
    this.cargarOrdenesVenta();
    this.cargarBodegas();
  }

  getFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  cargarDespachos(): void {
    this.loading = true;
    this.despachoService.findAll().subscribe({
      next: (data) => {
        this.despachos = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar despachos:', error);
        this.notificationService.error(error.message, 'Error al cargar despachos');
        this.loading = false;
      }
    });
  }

  cargarOrdenesVenta(): void {
    this.ordenVentaService.findAll().subscribe({
      next: (data) => {
        this.ordenesVenta = data.filter(orden => {
          const estado = (orden.estado || '').toUpperCase();
          return estado === 'PREPARADO' || estado === 'CONFIRMADA';
        });
      },
      error: (error) => {
        console.error('Error al cargar órdenes de venta:', error);
        this.notificationService.error('Error al cargar órdenes de venta');
      }
    });
  }

  cargarBodegas(): void {
    this.bodegaService.findAll().subscribe({
      next: (data) => {
        this.bodegas = data.filter(bodega => bodega.activo);
      },
      error: (error) => {
        console.error('Error al cargar bodegas:', error);
        this.notificationService.error('Error al cargar bodegas');
      }
    });
  }

  aplicarFiltros(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    
    this.despachosFiltrados = this.despachos.filter(despacho => {
      const cumpleBusqueda = 
        despacho.numeroDespacho?.toLowerCase().includes(busquedaLower) ||
        despacho.numeroGuiaRemision?.toLowerCase().includes(busquedaLower) ||
        despacho.ordenVentaNumero?.toLowerCase().includes(busquedaLower) ||
        despacho.id.toString().includes(busquedaLower);
      
      const cumpleEstado = this.filtroEstado === 'TODOS' || despacho.estado === this.filtroEstado;
      
      return cumpleBusqueda && cumpleEstado;
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingDespachoId = null;
    this.despachoForm.reset({
      numeroDespacho: `DESP-${Date.now()}`,
      fechaDespacho: this.getFechaHoy(),
      usuarioCreacionId: 1
    });
    this.showModal = true;
  }

  abrirModalEditar(despacho: DespachoResponse): void {
    if (!despacho.puedeEditarse) {
      this.notificationService.warning('Este despacho no puede ser editado');
      return;
    }

    this.isEditing = true;
    this.editingDespachoId = despacho.id;
    this.despachoForm.patchValue({
      numeroDespacho: despacho.numeroDespacho,
      numeroGuiaRemision: despacho.numeroGuiaRemision,
      ordenVentaId: despacho.ordenVentaId,
      bodegaId: despacho.bodegaId,
      fechaDespacho: despacho.fechaDespacho,
      fechaEntregaEstimada: despacho.fechaEntregaEstimada,
      responsablePreparacionId: despacho.responsablePreparacionId,
      responsableDespachoId: despacho.responsableDespachoId,
      transportista: despacho.transportista,
      placaVehiculo: despacho.placaVehiculo,
      conductor: despacho.conductor,
      cedulaConductor: despacho.cedulaConductor,
      direccionEntregaId: despacho.direccionEntregaId,
      direccionEntregaTexto: despacho.direccionEntregaTexto,
      observaciones: despacho.observaciones,
      nombreQuienRecibe: despacho.nombreQuienRecibe,
      cedulaQuienRecibe: despacho.cedulaQuienRecibe
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.despachoForm.reset();
    this.isEditing = false;
    this.editingDespachoId = null;
  }

  guardarDespacho(): void {
    if (this.despachoForm.invalid) {
      this.despachoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const despachoData: DespachoRequest = this.despachoForm.value;

    if (this.isEditing && this.editingDespachoId !== null) {
      this.despachoService.update(this.editingDespachoId, despachoData).subscribe({
        next: () => {
          this.notificationService.success('Despacho actualizado exitosamente');
          this.cargarDespachos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar despacho:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.despachoService.save(despachoData).subscribe({
        next: () => {
          this.notificationService.success('Despacho creado exitosamente');
          this.cargarDespachos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear despacho:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarDespacho(despacho: DespachoResponse): Promise<void> {
    if (!despacho.puedeEditarse) {
      this.notificationService.warning('Este despacho no puede ser eliminado');
      return;
    }

    const confirmed = await this.notificationService.confirmDelete(despacho.numeroDespacho);
    if (!confirmed) return;

    this.despachoService.delete(despacho.id).subscribe({
      next: () => {
        this.notificationService.toast('Despacho eliminado exitosamente', 'success');
        this.cargarDespachos();
      },
      error: (error) => {
        console.error('Error al eliminar despacho:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  verDetalles(despacho: DespachoResponse): void {
    this.despachoSeleccionado = despacho;
    this.loading = true;
    this.detalleService.findByDespacho(despacho.id).subscribe({
      next: (detalles) => {
        this.detallesDespacho = detalles;
        this.showDetalleModal = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        this.notificationService.error(error.message, 'Error al cargar detalles');
        this.loading = false;
      }
    });
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.despachoSeleccionado = null;
    this.detallesDespacho = [];
  }

  iniciarPreparacion(despacho: DespachoResponse): void {
    this.despachoService.iniciarPreparacion(despacho.id).subscribe({
      next: () => {
        this.notificationService.success('Preparación iniciada exitosamente');
        this.cargarDespachos();
      },
      error: (error) => {
        console.error('Error al iniciar preparación:', error);
        this.notificationService.error(error.message, 'Error al iniciar preparación');
      }
    });
  }

  marcarPreparado(despacho: DespachoResponse): void {
    this.despachoService.marcarPreparado(despacho.id, 1).subscribe({
      next: () => {
        this.notificationService.success('Despacho marcado como preparado');
        this.cargarDespachos();
      },
      error: (error) => {
        console.error('Error al marcar como preparado:', error);
        this.notificationService.error(error.message, 'Error al marcar como preparado');
      }
    });
  }

  despachar(despacho: DespachoResponse): void {
    this.despachoService.despachar(despacho.id, 1).subscribe({
      next: () => {
        this.notificationService.success('Despacho realizado exitosamente');
        this.cargarDespachos();
      },
      error: (error) => {
        console.error('Error al despachar:', error);
        this.notificationService.error(error.message, 'Error al despachar');
      }
    });
  }

  confirmarEntrega(despacho: DespachoResponse): void {
    if (!despacho.nombreQuienRecibe || !despacho.cedulaQuienRecibe) {
      this.notificationService.warning('Debe especificar quien recibe el despacho');
      return;
    }

    this.despachoService.confirmarEntrega(
      despacho.id, 
      despacho.nombreQuienRecibe, 
      despacho.cedulaQuienRecibe
    ).subscribe({
      next: () => {
        this.notificationService.success('Entrega confirmada exitosamente');
        this.cargarDespachos();
      },
      error: (error) => {
        console.error('Error al confirmar entrega:', error);
        this.notificationService.error(error.message, 'Error al confirmar entrega');
      }
    });
  }

  cancelar(despacho: DespachoResponse): void {
    this.despachoService.cancelar(despacho.id).subscribe({
      next: () => {
        this.notificationService.success('Despacho cancelado exitosamente');
        this.cargarDespachos();
      },
      error: (error) => {
        console.error('Error al cancelar:', error);
        this.notificationService.error(error.message, 'Error al cancelar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.despachoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.despachoForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    return '';
  }

  getEstadoClass(estado: string): string {
    const estadoClasses: { [key: string]: string } = {
      'BORRADOR': 'badge-secondary',
      'EN_PREPARACION': 'badge-info',
      'PREPARADO': 'badge-primary',
      'DESPACHADO': 'badge-warning',
      'ENTREGADO': 'badge-success',
      'CANCELADO': 'badge-danger'
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
