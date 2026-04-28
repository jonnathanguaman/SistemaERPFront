import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdenVentaService } from '../../Service/orden-venta.service';
import { ClienteService } from '../../Service/cliente.service';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { OrdenVentaResponse, OrdenVentaRequest } from '../../Entidad/orden-venta.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { CondicionPagoResponse } from '../../Entidad/condicion-pago.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-orden-venta',
  standalone: false,
  templateUrl: './orden-venta.component.html',
  styleUrl: './orden-venta.component.css'
})
export class OrdenVentaComponent implements OnInit {
  ordenesVenta: OrdenVentaResponse[] = [];
  ordenesVentaFiltradas: OrdenVentaResponse[] = [];
  clientes: ClienteResponse[] = [];
  condicionesPago: CondicionPagoResponse[] = [];
  ordenVentaForm: FormGroup;
  showForm: boolean = false;
  showDetallesModal: boolean = false;
  isEditing: boolean = false;
  editingOrdenVentaId: number | null = null;
  ordenSeleccionada: OrdenVentaResponse | null = null;
  loading: boolean = false;
  busqueda: string = '';
  
  // Filtros
  filtroEstado: string = 'TODOS';
  estados = ['TODOS', 'BORRADOR', 'CONFIRMADA', 'EN_PREPARACION', 'DESPACHADA', 'ENTREGADA', 'FACTURADA', 'CANCELADA'];

  constructor(
    private readonly ordenVentaService: OrdenVentaService,
    private readonly clienteService: ClienteService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {
    this.ordenVentaForm = this.formBuilder.group({
      numeroOrden: ['', Validators.required],
      cotizacionId: [null],
      clienteId: [null, Validators.required],
      contactoClienteId: [null],
      fechaOrden: [this.getFechaHoy(), Validators.required],
      fechaEntregaEstimada: [''],
      vendedorId: [null],
      bodegaId: [1, Validators.required],
      condicionPagoId: [null, Validators.required],
      diasCredito: [0],
      direccionEntregaId: [null],
      direccionEntregaTexto: [''],
      tiempoEntrega: [''],
      subtotal: [0],
      descuentoPorcentaje: [0],
      descuentoMonto: [0],
      impuestoMonto: [0],
      total: [0],
      requiereFactura: [true],
      requiereGuiaRemision: [true],
      observaciones: [''],
      usuarioCreacionId: [1]
    });
  }

  ngOnInit(): void {
    this.cargarOrdenesVenta();
    this.cargarClientes();
    this.cargarCondicionesPago();
  }

  getFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  cargarOrdenesVenta(): void {
    this.loading = true;
    this.ordenVentaService.findAll().subscribe({
      next: (data) => {
        this.ordenesVenta = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar órdenes de venta:', error);
        this.notificationService.error(error.message, 'Error al cargar órdenes');
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

  aplicarFiltros(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    
    this.ordenesVentaFiltradas = this.ordenesVenta.filter(orden => {
      const cumpleBusqueda = 
        orden.numeroOrden?.toLowerCase().includes(busquedaLower) ||
        orden.clienteNombre?.toLowerCase().includes(busquedaLower) ||
        orden.id.toString().includes(busquedaLower);
      
      const cumpleEstado = this.filtroEstado === 'TODOS' || orden.estado === this.filtroEstado;
      
      return cumpleBusqueda && cumpleEstado;
    });
  }

  abrirFormCrear(): void {
    this.router.navigate(['/ordenes-venta/nueva']);
  }

  abrirFormEditar(orden: OrdenVentaResponse): void {
    if (!orden.puedeEditarse) {
      this.notificationService.warning('Esta orden de venta no puede ser editada');
      return;
    }

    this.router.navigate(['/ordenes-venta', orden.id]);
  }

  cerrarForm(): void {
    this.showForm = false;
    this.ordenVentaForm.reset();
    this.isEditing = false;
    this.editingOrdenVentaId = null;
  }

  guardarOrdenVenta(): void {
    if (this.ordenVentaForm.invalid) {
      this.ordenVentaForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const ordenVentaData: OrdenVentaRequest = this.ordenVentaForm.value;

    if (this.isEditing && this.editingOrdenVentaId !== null) {
      this.ordenVentaService.update(this.editingOrdenVentaId, ordenVentaData).subscribe({
        next: () => {
          this.notificationService.success('Orden de venta actualizada exitosamente');
          this.cargarOrdenesVenta();
          this.cerrarForm();
        },
        error: (error) => {
          console.error('Error al actualizar orden de venta:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.ordenVentaService.save(ordenVentaData).subscribe({
        next: () => {
          this.notificationService.success('Orden de venta creada exitosamente');
          this.cargarOrdenesVenta();
          this.cerrarForm();
        },
        error: (error) => {
          console.error('Error al crear orden de venta:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarOrdenVenta(orden: OrdenVentaResponse): Promise<void> {
    if (!orden.puedeEditarse) {
      this.notificationService.warning('Esta orden de venta no puede ser eliminada');
      return;
    }

    const confirmed = await this.notificationService.confirmDelete(orden.numeroOrden);
    if (!confirmed) return;

    this.ordenVentaService.delete(orden.id).subscribe({
      next: () => {
        this.notificationService.toast('Orden de venta eliminada exitosamente', 'success');
        this.cargarOrdenesVenta();
      },
      error: (error) => {
        console.error('Error al eliminar orden de venta:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  async confirmarOrdenVenta(orden: OrdenVentaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Confirmar orden de venta?',
      `Se confirmará la orden ${orden.numeroOrden}`
    );
    if (!confirmed) return;

    this.ordenVentaService.confirmar(orden.id, 1).subscribe({
      next: () => {
        this.notificationService.success('Orden de venta confirmada exitosamente');
        this.cargarOrdenesVenta();
      },
      error: (error) => {
        console.error('Error al confirmar orden de venta:', error);
        this.notificationService.error(error.message, 'Error al confirmar');
      }
    });
  }

  async cancelarOrdenVenta(orden: OrdenVentaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Cancelar orden de venta?',
      `Se cancelará la orden ${orden.numeroOrden}`
    );
    if (!confirmed) return;

    this.ordenVentaService.cancelar(orden.id).subscribe({
      next: () => {
        this.notificationService.success('Orden de venta cancelada exitosamente');
        this.cargarOrdenesVenta();
      },
      error: (error) => {
        console.error('Error al cancelar orden de venta:', error);
        this.notificationService.error(error.message, 'Error al cancelar');
      }
    });
  }

  async iniciarPreparacion(orden: OrdenVentaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Iniciar preparación?',
      `La orden ${orden.numeroOrden} pasará a estado EN PREPARACIÓN`
    );
    if (!confirmed) return;

    this.ordenVentaService.iniciarPreparacion(orden.id).subscribe({
      next: () => {
        this.notificationService.success('Orden en preparación');
        this.cargarOrdenesVenta();
      },
      error: (error) => {
        console.error('Error al iniciar preparación:', error);
        this.notificationService.error(error.message, 'Error al cambiar estado');
      }
    });
  }

  async marcarComoLista(orden: OrdenVentaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Marcar como lista para despacho?',
      `La orden ${orden.numeroOrden} pasará a estado DESPACHADA`
    );
    if (!confirmed) return;

    this.ordenVentaService.marcarComoLista(orden.id).subscribe({
      next: () => {
        this.notificationService.success('Orden lista para despacho');
        this.cargarOrdenesVenta();
      },
      error: (error) => {
        console.error('Error al marcar como lista:', error);
        this.notificationService.error(error.message, 'Error al cambiar estado');
      }
    });
  }

  async entregarOrden(orden: OrdenVentaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Marcar como entregada?',
      `La orden ${orden.numeroOrden} pasará a estado ENTREGADA`
    );
    if (!confirmed) return;

    this.ordenVentaService.entregar(orden.id).subscribe({
      next: () => {
        this.notificationService.success('Orden entregada exitosamente');
        this.cargarOrdenesVenta();
      },
      error: (error) => {
        console.error('Error al entregar orden:', error);
        this.notificationService.error(error.message, 'Error al cambiar estado');
      }
    });
  }

  verDetalles(orden: OrdenVentaResponse): void {
    this.router.navigate(['/ordenes-venta', orden.id]);
  }

  cerrarFormDetalles(): void {
    this.showDetallesModal = false;
    this.ordenSeleccionada = null;
  }

  getEstadoBadgeClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'BORRADOR': 'badge-secondary',
      'CONFIRMADA': 'badge-primary',
      'EN_PREPARACION': 'badge-info',
      'DESPACHADA': 'badge-warning',
      'ENTREGADA': 'badge-success',
      'FACTURADA': 'badge-success',
      'CANCELADA': 'badge-danger'
    };
    return estadoMap[estado] || 'badge-secondary';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ordenVentaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.ordenVentaForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }
}

