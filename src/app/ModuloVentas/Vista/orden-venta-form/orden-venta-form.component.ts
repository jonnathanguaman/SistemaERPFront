import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { AuthService } from '../../../Compartido/services/auth.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { CondicionPagoResponse } from '../../Entidad/condicion-pago.model';
import { CotizacionResponse } from '../../Entidad/cotizacion.model';
import { DetalleOrdenVentaRequest } from '../../Entidad/detalle-orden-venta.model';
import { OrdenVentaRequest } from '../../Entidad/orden-venta.model';
import { ClienteService } from '../../Service/cliente.service';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { CotizacionService } from '../../Service/cotizacion.service';
import { DetalleCotizacionService } from '../../Service/detalle-cotizacion.service';
import { DetalleOrdenVentaService } from '../../Service/detalle-orden-venta.service';
import { OrdenVentaService } from '../../Service/orden-venta.service';
import { ProductoExistenciasResponse } from '../../../ModuloInventario/Entidad/producto-existencias.model';
import { ProductoResponse } from '../../../ModuloInventario/Entidad/producto.model';
import { ProductoExistenciasService } from '../../../ModuloInventario/Service/producto-existencias.service';
import { ProductoService } from '../../../ModuloInventario/Service/producto.service';

interface DetalleLineaOrden {
  productoId: number | null;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestoPorcentaje: number;
  observaciones: string;
}

@Component({
  selector: 'app-orden-venta-form',
  standalone: false,
  templateUrl: './orden-venta-form.component.html',
  styleUrl: './orden-venta-form.component.css'
})
export class OrdenVentaFormComponent implements OnInit {
  ordenVentaForm: FormGroup;
  ordenVentaId: number | null = null;
  private snapshotInicial = '';

  clientes: ClienteResponse[] = [];
  condicionesPago: CondicionPagoResponse[] = [];
  bodegas: BodegaResponse[] = [];
  cotizacionesDisponibles: CotizacionResponse[] = [];
  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  existencias: ProductoExistenciasResponse[] = [];
  detallesOrdenVenta: DetalleLineaOrden[] = [];

  loading = false;
  guardando = false;
  modoLectura = false;
  cargandoCotizacion = false;
  private existenciasCargadas = false;

  private bloqueandoCambioCotizacion = false;
  private bloqueandoCambioBodega = false;

  estadosDisponibles = ['BORRADOR', 'CONFIRMADA', 'EN_PREPARACION', 'DESPACHADA', 'ENTREGADA', 'FACTURADA', 'CANCELADA'];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly detalleOrdenVentaService: DetalleOrdenVentaService,
    private readonly cotizacionService: CotizacionService,
    private readonly detalleCotizacionService: DetalleCotizacionService,
    private readonly clienteService: ClienteService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly bodegaService: BodegaService,
    private readonly productoService: ProductoService,
    private readonly productoExistenciasService: ProductoExistenciasService
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
      usuarioCreacionId: [1],
      estado: ['BORRADOR']
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.ordenVentaId = idParam ? Number(idParam) : null;
    this.modoLectura = this.route.snapshot.queryParamMap.get('modo') === 'ver';

    this.configurarCambioBodega();
    this.configurarCambioCotizacion();
    this.configurarCambioCliente();

    if (this.ordenVentaId) {
      this.cargarOrdenExistente(this.ordenVentaId);
    } else {
      this.ordenVentaForm.patchValue({ numeroOrden: `OV-${Date.now()}` });
      this.agregarLinea();
    }

    this.cargarCatalogos();
    this.aplicarRestriccionesPorEstado();
    this.actualizarSnapshotInicial();
  }

  cargarCatalogos(): void {
    this.loading = true;

    this.clienteService.findActivos().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: () => {
        void this.notificationService.error('Error al cargar clientes');
      }
    });

    this.condicionPagoService.findActivas().subscribe({
      next: (condiciones) => {
        this.condicionesPago = condiciones;
      },
      error: () => {
        void this.notificationService.error('Error al cargar condiciones de pago');
      }
    });

    this.bodegaService.findAll().subscribe({
      next: (bodegas) => {
        this.bodegas = bodegas.filter((bodega) => bodega.activo);
      },
      error: () => {
        void this.notificationService.error('Error al cargar bodegas');
      }
    });

    this.cotizacionService.findAprobadas().subscribe({
      next: (cotizaciones) => {
        this.cotizacionesDisponibles = cotizaciones.filter((cotizacion) => cotizacion.activo !== false);
      },
      error: () => {
        this.cotizacionService.findAll().subscribe({
          next: (cotizaciones) => {
            this.cotizacionesDisponibles = cotizaciones.filter((cotizacion) => cotizacion.activo !== false);
          },
          error: () => {
            void this.notificationService.warning('No se pudo cargar la lista de cotizaciones');
          }
        });
      }
    });

    this.productoService.findAll().subscribe({
      next: (productos) => {
        this.productos = productos.filter((producto) => producto.activo && producto.estado);
        this.actualizarProductosPorBodega(Number(this.ordenVentaForm.get('bodegaId')?.value || 0));
      },
      error: () => {
        void this.notificationService.error('Error al cargar productos');
      }
    });

    this.productoExistenciasService.findAll().subscribe({
      next: (existencias) => {
        this.existencias = existencias.filter((existencia) => existencia.activo);
        this.existenciasCargadas = true;
        this.actualizarProductosPorBodega(Number(this.ordenVentaForm.get('bodegaId')?.value || 0));
        this.limpiarLineasSinDisponibilidad(Number(this.ordenVentaForm.get('bodegaId')?.value || 0));
        this.loading = false;
      },
      error: () => {
        this.existenciasCargadas = false;
        this.loading = false;
        void this.notificationService.warning('No se pudieron cargar existencias por bodega');
      }
    });
  }

  private configurarCambioBodega(): void {
    this.ordenVentaForm.get('bodegaId')?.valueChanges.subscribe((bodegaId: number | null) => {
      if (this.bloqueandoCambioBodega) {
        return;
      }

      const id = Number(bodegaId || 0);
      this.actualizarProductosPorBodega(id);
      this.limpiarLineasSinDisponibilidad(id);
      this.recalcularTotales();
    });
  }

  private configurarCambioCotizacion(): void {
    this.ordenVentaForm.get('cotizacionId')?.valueChanges.subscribe((cotizacionId: number | null) => {
      this.aplicarBloqueoPorCotizacion();

      if (this.bloqueandoCambioCotizacion || !cotizacionId || !this.puedeEditarCampos()) {
        return;
      }

      this.cargarDataDesdeCotizacion(Number(cotizacionId));
    });
  }

  private configurarCambioCliente(): void {
    this.ordenVentaForm.get('clienteId')?.valueChanges.subscribe((clienteId: number | null) => {
      if (!clienteId || !this.puedeEditarCampos()) {
        return;
      }

      this.aplicarDireccionClientePorDefecto(Number(clienteId), false);
    });
  }

  private cargarDataDesdeCotizacion(cotizacionId: number): void {
    this.cargandoCotizacion = true;

    forkJoin({
      cotizacion: this.cotizacionService.findById(cotizacionId),
      detalles: this.detalleCotizacionService.findByCotizacion(cotizacionId)
    }).subscribe({
      next: ({ cotizacion, detalles }) => {
        this.bloqueandoCambioBodega = true;
        this.ordenVentaForm.patchValue({
          cotizacionId: cotizacion.id,
          clienteId: cotizacion.clienteId,
          contactoClienteId: cotizacion.contactoClienteId || null,
          bodegaId: cotizacion.bodegaId,
          condicionPagoId: cotizacion.condicionPagoId,
          tiempoEntrega: cotizacion.tiempoEntrega || '',
          observaciones: cotizacion.observaciones || '',
          subtotal: cotizacion.subtotal,
          descuentoPorcentaje: cotizacion.descuentoPorcentaje || 0,
          descuentoMonto: cotizacion.descuentoMonto || 0,
          impuestoMonto: cotizacion.impuestoMonto,
          total: cotizacion.total
        }, { emitEvent: false });
        this.bloqueandoCambioBodega = false;

        this.aplicarDireccionClientePorDefecto(Number(cotizacion.clienteId), true);

        this.actualizarProductosPorBodega(cotizacion.bodegaId);

        this.detallesOrdenVenta = detalles.map((detalle) => ({
          productoId: detalle.productoId,
          cantidad: Number(detalle.cantidad),
          precioUnitario: Number(detalle.precioUnitario),
          descuentoPorcentaje: Number(detalle.descuentoPorcentaje || 0),
          descuentoMonto: Number(detalle.descuentoMonto || 0),
          impuestoPorcentaje: Number(detalle.impuestoPorcentaje || 0),
          observaciones: detalle.observaciones || ''
        }));

        if (this.detallesOrdenVenta.length === 0) {
          this.agregarLinea();
        }

        if (this.existenciasCargadas) {
          this.limpiarLineasSinDisponibilidad(cotizacion.bodegaId, false);
        }
        this.recalcularTotales();
        this.actualizarSnapshotInicial();
        this.cargandoCotizacion = false;
        this.notificationService.success('Datos cargados desde la cotización seleccionada');
      },
      error: (error) => {
        this.cargandoCotizacion = false;
        void this.notificationService.error(error.message || 'No se pudo cargar la información de la cotización');
      }
    });
  }

  private actualizarProductosPorBodega(bodegaId: number): void {
    if (!bodegaId) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    const productosIds = new Set(
      this.existencias
        .filter((existencia) => existencia.bodegaId === bodegaId)
        .map((existencia) => existencia.productoId)
    );

    this.productosFiltrados = this.productos.filter((producto) => productosIds.has(producto.id));
  }

  private limpiarLineasSinDisponibilidad(bodegaId: number, mostrarMensaje = true): void {
    if (!bodegaId || !this.existenciasCargadas) {
      return;
    }

    const permitidos = new Set(this.productosFiltrados.map((producto) => producto.id));
    if (permitidos.size === 0) {
      return;
    }

    let huboCambios = false;

    this.detallesOrdenVenta.forEach((linea) => {
      if (linea.productoId && !permitidos.has(Number(linea.productoId))) {
        linea.productoId = null;
        linea.cantidad = 1;
        linea.precioUnitario = 0;
        linea.descuentoPorcentaje = 0;
        linea.descuentoMonto = 0;
        linea.impuestoPorcentaje = 0;
        huboCambios = true;
      }
    });

    if (huboCambios && mostrarMensaje) {
      void this.notificationService.warning('Se limpiaron líneas con productos que no existen en la bodega seleccionada');
    }
  }

  cargarOrdenExistente(id: number): void {
    this.loading = true;
    this.ordenVentaService.findById(id).subscribe({
      next: (orden) => {
        this.bloqueandoCambioCotizacion = true;
        this.bloqueandoCambioBodega = true;
        this.ordenVentaForm.patchValue({
          numeroOrden: orden.numeroOrden,
          cotizacionId: orden.cotizacionId,
          clienteId: orden.clienteId,
          contactoClienteId: orden.contactoClienteId,
          fechaOrden: orden.fechaOrden,
          fechaEntregaEstimada: orden.fechaEntregaEstimada,
          vendedorId: orden.vendedorId,
          bodegaId: orden.bodegaId,
          condicionPagoId: orden.condicionPagoId,
          diasCredito: orden.diasCredito,
          direccionEntregaId: orden.direccionEntregaId,
          direccionEntregaTexto: orden.direccionEntregaTexto,
          tiempoEntrega: orden.tiempoEntrega,
          subtotal: orden.subtotal,
          descuentoPorcentaje: orden.descuentoPorcentaje,
          descuentoMonto: orden.descuentoMonto,
          impuestoMonto: orden.impuestoMonto,
          total: orden.total,
          requiereFactura: orden.requiereFactura,
          requiereGuiaRemision: orden.requiereGuiaRemision,
          observaciones: orden.observaciones,
          usuarioCreacionId: orden.usuarioCreacionId || 1,
          estado: orden.estado
        }, { emitEvent: false });
        this.bloqueandoCambioCotizacion = false;
        this.bloqueandoCambioBodega = false;

        if (orden.cotizacionId) {
          this.incluirCotizacionActualEnLista(Number(orden.cotizacionId));
        }

        if (!orden.direccionEntregaTexto && orden.clienteId) {
          this.aplicarDireccionClientePorDefecto(Number(orden.clienteId), true);
        }

        this.actualizarProductosPorBodega(Number(orden.bodegaId));

        this.aplicarRestriccionesPorEstado();
        this.cargarDetallesOrden(id);
      },
      error: (error) => {
        void this.notificationService.error(error.message || 'No se pudo cargar la orden de venta');
        this.loading = false;
      }
    });
  }

  cargarDetallesOrden(ordenVentaId: number): void {
    this.detalleOrdenVentaService.findByOrdenVenta(ordenVentaId).subscribe({
      next: (detalles) => {
        this.detallesOrdenVenta = detalles.map((detalle) => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          descuentoPorcentaje: detalle.descuentoPorcentaje || 0,
          descuentoMonto: detalle.descuentoMonto || 0,
          impuestoPorcentaje: detalle.impuestoPorcentaje || 0,
          observaciones: detalle.observaciones || ''
        }));

        if (this.detallesOrdenVenta.length === 0) {
          this.agregarLinea();
        }

        this.recalcularTotales();
        this.aplicarRestriccionesPorEstado();
        this.actualizarSnapshotInicial();
        this.loading = false;
      },
      error: () => {
        this.detallesOrdenVenta = [];
        this.agregarLinea();
        this.recalcularTotales();
        this.actualizarSnapshotInicial();
        this.loading = false;
      }
    });
  }

  getFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTituloPagina(): string {
    if (this.modoLectura) {
      return 'Órdenes de Venta / Ver';
    }
    if (this.ordenVentaId) {
      return 'Órdenes de Venta / Editar';
    }
    return 'Órdenes de Venta / Nuevo';
  }

  volverListado(): void {
    this.router.navigate(['/ordenes-venta']);
  }

  obtenerEstadoActual(): string {
    return this.ordenVentaForm.get('estado')?.value || 'BORRADOR';
  }

  isEstadoActivo(estado: string): boolean {
    return this.obtenerEstadoActual() === estado;
  }

  puedeEditarCampos(): boolean {
    return !this.modoLectura && this.obtenerEstadoActual() === 'BORRADOR';
  }

  puedeEditarContenidoOrden(): boolean {
    return this.puedeEditarCampos() && !this.debeBloquearPorCotizacion();
  }

  mostrarBotonesGuardarDescartar(): boolean {
    return this.puedeEditarCampos() && this.tieneCambiosPendientes();
  }

  agregarLinea(): void {
    if (!this.puedeEditarContenidoOrden()) {
      return;
    }

    this.detallesOrdenVenta.push({
      productoId: null,
      cantidad: 1,
      precioUnitario: 0,
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      impuestoPorcentaje: 0,
      observaciones: ''
    });
    this.recalcularTotales();
  }

  eliminarLinea(index: number): void {
    if (!this.puedeEditarContenidoOrden() || this.detallesOrdenVenta.length === 1) {
      return;
    }

    this.detallesOrdenVenta.splice(index, 1);
    this.recalcularTotales();
  }

  onProductoSeleccionado(index: number): void {
    if (!this.puedeEditarContenidoOrden()) {
      return;
    }

    const linea = this.detallesOrdenVenta[index];
    if (!linea) {
      return;
    }

    const permitido = this.productosFiltrados.some((producto) => producto.id === Number(linea.productoId));
    if (linea.productoId && !permitido) {
      linea.productoId = null;
      linea.cantidad = 1;
      linea.precioUnitario = 0;
      linea.descuentoPorcentaje = 0;
      linea.descuentoMonto = 0;
      linea.impuestoPorcentaje = 0;
      void this.notificationService.warning('El producto seleccionado no pertenece a la bodega actual');
    }

    this.recalcularTotales();
  }

  onLineaChange(index: number): void {
    if (!this.puedeEditarContenidoOrden()) {
      return;
    }

    const linea = this.detallesOrdenVenta[index];
    if (!linea) {
      return;
    }

    const descuentoPorcentaje = Number(linea.descuentoPorcentaje || 0);
    const base = Number(linea.cantidad || 0) * Number(linea.precioUnitario || 0);
    const descuentoCalculado = base * (descuentoPorcentaje / 100);
    linea.descuentoMonto = Number(descuentoCalculado.toFixed(2));

    this.recalcularTotales();
  }

  getTotalLinea(linea: DetalleLineaOrden): number {
    const cantidad = Number(linea.cantidad || 0);
    const precio = Number(linea.precioUnitario || 0);
    const base = cantidad * precio;
    const descuento = Number(linea.descuentoMonto || 0);
    const imponible = Math.max(base - descuento, 0);
    const impuesto = imponible * (Number(linea.impuestoPorcentaje || 0) / 100);
    return imponible + impuesto;
  }

  getPrecioConIva(linea: DetalleLineaOrden): number {
    const precio = Number(linea.precioUnitario || 0);
    const iva = Number(linea.impuestoPorcentaje || 0) / 100;
    return precio + (precio * iva);
  }

  getStockDisponible(linea: DetalleLineaOrden): number {
    if (!linea.productoId) {
      return 0;
    }

    const bodegaId = Number(this.ordenVentaForm.get('bodegaId')?.value || 0);
    if (!bodegaId) {
      return 0;
    }

    const stock = this.existencias
      .filter((existencia) => existencia.productoId === Number(linea.productoId) && existencia.bodegaId === bodegaId)
      .reduce((acumulado, existencia) => acumulado + Number(existencia.cantidadDisponible || 0), 0);

    return Number(stock.toFixed(2));
  }

  private recalcularTotales(): void {
    const subtotal = this.detallesOrdenVenta.reduce((acc, linea) => {
      const cantidad = Number(linea.cantidad || 0);
      const precio = Number(linea.precioUnitario || 0);
      return acc + (cantidad * precio);
    }, 0);

    const descuentoMonto = this.detallesOrdenVenta.reduce((acc, linea) => {
      const base = Number(linea.cantidad || 0) * Number(linea.precioUnitario || 0);
      const descuentoCalculado = base * (Number(linea.descuentoPorcentaje || 0) / 100);
      linea.descuentoMonto = Number(descuentoCalculado.toFixed(2));
      return acc + descuentoCalculado;
    }, 0);

    const impuestoMonto = this.detallesOrdenVenta.reduce((acc, linea) => {
      const base = Number(linea.cantidad || 0) * Number(linea.precioUnitario || 0);
      const imponible = Math.max(base - Number(linea.descuentoMonto || 0), 0);
      return acc + (imponible * (Number(linea.impuestoPorcentaje || 0) / 100));
    }, 0);

    const total = Math.max(subtotal - descuentoMonto, 0) + impuestoMonto;

    this.ordenVentaForm.patchValue({
      subtotal: Number(subtotal.toFixed(2)),
      descuentoMonto: Number(descuentoMonto.toFixed(2)),
      impuestoMonto: Number(impuestoMonto.toFixed(2)),
      total: Number(total.toFixed(2))
    }, { emitEvent: false });
  }

  puedeSeleccionarEstado(estado: string): boolean {
    if (this.modoLectura) {
      return false;
    }

    const estadoActual = this.obtenerEstadoActual();

    if (!this.ordenVentaId) {
      return false;
    }

    if (estadoActual === 'BORRADOR' && estado === 'CONFIRMADA') return true;
    if (estadoActual === 'CONFIRMADA' && estado === 'EN_PREPARACION') return true;
    if (estadoActual === 'EN_PREPARACION' && estado === 'DESPACHADA') return true;
    if (estadoActual === 'DESPACHADA' && estado === 'ENTREGADA') return true;
    if (estadoActual === 'ENTREGADA' && estado === 'FACTURADA') return true;

    return false;
  }

  seleccionarEstado(estado: string): void {
    if (!this.ordenVentaId || this.modoLectura) {
      return;
    }

    const estadoActual = this.obtenerEstadoActual();
    const id = this.ordenVentaId;

    if (estadoActual === 'BORRADOR' && estado === 'CONFIRMADA') {
      const usuarioId = this.authService.userId;
      if (!usuarioId) {
        void this.notificationService.error('No se pudo identificar el usuario autenticado. Cierra sesión e inicia nuevamente.');
        return;
      }

      this.ordenVentaService.confirmar(id, usuarioId).subscribe({
        next: (orden) => this.actualizarEstadoDesdeResponse(orden.estado, 'Orden confirmada exitosamente'),
        error: (error) => {
          void this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
      return;
    }

    if (estadoActual === 'CONFIRMADA' && estado === 'EN_PREPARACION') {
      this.ordenVentaService.iniciarPreparacion(id).subscribe({
        next: (orden) => this.actualizarEstadoDesdeResponse(orden.estado, 'Orden en preparación'),
        error: (error) => {
          void this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
      return;
    }

    if (estadoActual === 'EN_PREPARACION' && estado === 'DESPACHADA') {
      this.ordenVentaService.marcarComoLista(id).subscribe({
        next: (orden) => this.actualizarEstadoDesdeResponse(orden.estado, 'Orden marcada como lista para despacho'),
        error: (error) => {
          void this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
      return;
    }

    if (estadoActual === 'DESPACHADA' && estado === 'ENTREGADA') {
      this.ordenVentaService.entregar(id).subscribe({
        next: (orden) => this.actualizarEstadoDesdeResponse(orden.estado, 'Orden entregada exitosamente'),
        error: (error) => {
          void this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
      return;
    }

    if (estadoActual === 'ENTREGADA' && estado === 'FACTURADA') {
      this.ordenVentaService.facturar(id).subscribe({
        next: (orden) => this.actualizarEstadoDesdeResponse(orden.estado, 'Orden facturada exitosamente'),
        error: (error) => {
          void this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
    }
  }

  cancelarOrdenDesdeToolbar(): void {
    if (!this.ordenVentaId || this.modoLectura) {
      return;
    }

    const estadoActual = this.obtenerEstadoActual();
    if (estadoActual === 'FACTURADA' || estadoActual === 'CANCELADA') {
      return;
    }

    this.ordenVentaService.cancelar(this.ordenVentaId).subscribe({
      next: (orden) => this.actualizarEstadoDesdeResponse(orden.estado, 'Orden cancelada exitosamente'),
      error: (error) => {
        void this.notificationService.error(error.message, 'No se pudo cancelar la orden');
      }
    });
  }

  restablecerABorradorDesdeToolbar(): void {
    if (!this.ordenVentaId || this.modoLectura) {
      return;
    }

    if (this.obtenerEstadoActual() !== 'CANCELADA') {
      return;
    }

    this.ordenVentaService.restablecerABorrador(this.ordenVentaId).subscribe({
      next: (orden) => this.actualizarEstadoDesdeResponse(orden.estado, 'Orden restablecida a borrador'),
      error: (error) => {
        void this.notificationService.error(error.message, 'No se pudo restablecer la orden');
      }
    });
  }

  mostrarBotonCancelar(): boolean {
    return !!this.ordenVentaId && !this.modoLectura && this.obtenerEstadoActual() !== 'FACTURADA';
  }

  mostrarBotonRestablecerBorrador(): boolean {
    return !!this.ordenVentaId && !this.modoLectura && this.obtenerEstadoActual() === 'CANCELADA';
  }

  mostrarBotonConfirmar(): boolean {
    return !!this.ordenVentaId && !this.modoLectura && this.obtenerEstadoActual() === 'BORRADOR';
  }

  mostrarBotonPreparacion(): boolean {
    return !!this.ordenVentaId && !this.modoLectura && this.obtenerEstadoActual() === 'CONFIRMADA';
  }

  mostrarBotonDespachada(): boolean {
    return !!this.ordenVentaId && !this.modoLectura && this.obtenerEstadoActual() === 'EN_PREPARACION';
  }

  mostrarBotonEntregada(): boolean {
    return !!this.ordenVentaId && !this.modoLectura && this.obtenerEstadoActual() === 'DESPACHADA';
  }

  mostrarBotonFacturada(): boolean {
    return !!this.ordenVentaId && !this.modoLectura && this.obtenerEstadoActual() === 'ENTREGADA';
  }

  private actualizarEstadoDesdeResponse(estado: string, mensaje: string): void {
    this.ordenVentaForm.patchValue({ estado });
    this.aplicarRestriccionesPorEstado();
    this.actualizarSnapshotInicial();
    this.notificationService.success(mensaje);
  }

  guardarOrdenVenta(): void {
    if (!this.mostrarBotonesGuardarDescartar()) {
      void this.notificationService.warning('No hay cambios para guardar o no se permite editar en este estado');
      return;
    }

    if (this.ordenVentaForm.invalid) {
      this.ordenVentaForm.markAllAsTouched();
      void this.notificationService.warning('Completa la información requerida de la orden de venta');
      return;
    }

    const detallesValidos = this.obtenerDetallesValidos();
    if (detallesValidos.length === 0) {
      void this.notificationService.warning('Agrega al menos un producto válido en el detalle de la orden');
      return;
    }

    this.guardando = true;
    this.recalcularTotales();

    const payload: OrdenVentaRequest = this.ordenVentaForm.getRawValue();

    if (this.ordenVentaId) {
      this.ordenVentaService.update(this.ordenVentaId, payload).subscribe({
        next: (ordenActualizada) => {
          this.reemplazarDetallesOrden(ordenActualizada.id).subscribe({
            next: () => {
              this.notificationService.success('Orden de venta actualizada exitosamente');
              this.guardando = false;
              this.actualizarSnapshotInicial();
            },
            error: (error) => {
              void this.notificationService.error(error.message || 'No se pudieron guardar los detalles');
              this.guardando = false;
            }
          });
        },
        error: (error) => {
          void this.notificationService.error(error.message, 'Error al actualizar orden de venta');
          this.guardando = false;
        }
      });
      return;
    }

    this.ordenVentaService.save(payload).subscribe({
      next: (ordenCreada) => {
        this.crearDetallesOrden(ordenCreada.id).subscribe({
          next: () => {
            this.notificationService.success('Orden de venta creada exitosamente');
            this.guardando = false;
            this.ordenVentaId = ordenCreada.id;
            this.router.navigate(['/ordenes-venta', ordenCreada.id]);
          },
          error: (error) => {
            void this.notificationService.error(error.message || 'No se pudieron guardar los detalles');
            this.guardando = false;
          }
        });
      },
      error: (error) => {
        void this.notificationService.error(error.message, 'Error al crear orden de venta');
        this.guardando = false;
      }
    });
  }

  descartar(): void {
    if (this.ordenVentaId) {
      this.cargarOrdenExistente(this.ordenVentaId);
      return;
    }

    this.router.navigate(['/ordenes-venta']);
  }

  aplicarRestriccionesPorEstado(): void {
    if (this.puedeEditarCampos()) {
      this.ordenVentaForm.enable({ emitEvent: false });
    } else {
      this.ordenVentaForm.disable({ emitEvent: false });
    }

    this.ordenVentaForm.get('estado')?.disable({ emitEvent: false });
    this.aplicarBloqueoPorCotizacion();
  }

  private aplicarBloqueoPorCotizacion(): void {
    const bloquear = this.debeBloquearPorCotizacion();
    const campos = [
      'numeroOrden',
      'clienteId',
      'bodegaId'
    ];

    campos.forEach((campo) => {
      const control = this.ordenVentaForm.get(campo);
      if (!control) {
        return;
      }

      if (bloquear) {
        control.disable({ emitEvent: false });
      } else if (this.puedeEditarCampos()) {
        control.enable({ emitEvent: false });
      }
    });

    this.aplicarEstadoTogglesPrincipales();
  }

  private aplicarEstadoTogglesPrincipales(): void {
    const toggles = ['requiereFactura', 'requiereGuiaRemision'];

    toggles.forEach((campo) => {
      const control = this.ordenVentaForm.get(campo);
      if (!control) {
        return;
      }

      if (this.puedeEditarCampos()) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    });
  }

  tieneCotizacionSeleccionada(): boolean {
    return !!this.ordenVentaForm.get('cotizacionId')?.value;
  }

  private debeBloquearPorCotizacion(): boolean {
    return this.tieneCotizacionSeleccionada() && this.puedeEditarCampos();
  }

  private aplicarDireccionClientePorDefecto(clienteId: number, sobrescribir: boolean): void {
    const direccionActual = (this.ordenVentaForm.get('direccionEntregaTexto')?.value || '').toString().trim();
    if (!sobrescribir && direccionActual) {
      return;
    }

    const clienteLocal = this.clientes.find((cliente) => cliente.id === clienteId);
    if (clienteLocal?.direccion) {
      this.ordenVentaForm.patchValue({ direccionEntregaTexto: clienteLocal.direccion }, { emitEvent: false });
      return;
    }

    this.clienteService.findById(clienteId).subscribe({
      next: (cliente) => {
        const direccion = (cliente.direccion || '').trim();
        if (!direccion) {
          return;
        }

        const direccionVigente = (this.ordenVentaForm.get('direccionEntregaTexto')?.value || '').toString().trim();
        if (sobrescribir || !direccionVigente) {
          this.ordenVentaForm.patchValue({ direccionEntregaTexto: direccion }, { emitEvent: false });
        }
      },
      error: () => {
      }
    });
  }

  private incluirCotizacionActualEnLista(cotizacionId: number): void {
    const yaExiste = this.cotizacionesDisponibles.some((cotizacion) => cotizacion.id === cotizacionId);
    if (yaExiste) {
      return;
    }

    this.cotizacionService.findById(cotizacionId).subscribe({
      next: (cotizacion) => {
        this.cotizacionesDisponibles = [cotizacion, ...this.cotizacionesDisponibles];
      },
      error: () => {
      }
    });
  }

  private generarSnapshotActual(): string {
    const data = this.ordenVentaForm.getRawValue();
    const detalles = this.detallesOrdenVenta.map((linea) => ({
      productoId: linea.productoId,
      cantidad: Number(linea.cantidad || 0),
      precioUnitario: Number(linea.precioUnitario || 0),
      descuentoPorcentaje: Number(linea.descuentoPorcentaje || 0),
      descuentoMonto: Number(linea.descuentoMonto || 0),
      impuestoPorcentaje: Number(linea.impuestoPorcentaje || 0),
      observaciones: linea.observaciones || ''
    }));
    return JSON.stringify({ data, detalles });
  }

  private obtenerDetallesValidos(): DetalleLineaOrden[] {
    return this.detallesOrdenVenta
      .filter((linea) => !!linea.productoId && Number(linea.cantidad) > 0)
      .map((linea) => ({
        ...linea,
        productoId: Number(linea.productoId),
        cantidad: Number(linea.cantidad || 0),
        precioUnitario: Number(linea.precioUnitario || 0),
        descuentoPorcentaje: Number(linea.descuentoPorcentaje || 0),
        descuentoMonto: Number(linea.descuentoMonto || 0),
        impuestoPorcentaje: Number(linea.impuestoPorcentaje || 0)
      }));
  }

  private crearDetallesOrden(ordenVentaId: number): Observable<unknown> {
    const detallesValidos = this.obtenerDetallesValidos();

    if (detallesValidos.length === 0) {
      return of([]);
    }

    const requests: Observable<unknown>[] = detallesValidos.map((linea) => {
      const payload: DetalleOrdenVentaRequest = {
        ordenVentaId,
        productoId: Number(linea.productoId),
        cantidad: Number(linea.cantidad),
        precioUnitario: Number(linea.precioUnitario),
        descuentoPorcentaje: Number(linea.descuentoPorcentaje || 0),
        descuentoMonto: Number(linea.descuentoMonto || 0),
        impuestoPorcentaje: Number(linea.impuestoPorcentaje || 0),
        observaciones: linea.observaciones || ''
      };
      return this.detalleOrdenVentaService.save(payload);
    });

    return forkJoin(requests);
  }

  private reemplazarDetallesOrden(ordenVentaId: number): Observable<unknown> {
    return this.detalleOrdenVentaService.findByOrdenVenta(ordenVentaId).pipe(
      switchMap((detallesActuales) => {
        if (detallesActuales.length === 0) {
          return this.crearDetallesOrden(ordenVentaId);
        }

        const eliminaciones = detallesActuales.map((detalle) => this.detalleOrdenVentaService.delete(detalle.id));
        return forkJoin(eliminaciones).pipe(
          switchMap(() => this.crearDetallesOrden(ordenVentaId))
        );
      })
    );
  }

  actualizarSnapshotInicial(): void {
    this.snapshotInicial = this.generarSnapshotActual();
  }

  tieneCambiosPendientes(): boolean {
    return this.generarSnapshotActual() !== this.snapshotInicial;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ordenVentaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.ordenVentaForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    return '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  }
}
