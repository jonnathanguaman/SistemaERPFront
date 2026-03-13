import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, switchMap, map } from 'rxjs';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { AuthService } from '../../../Compartido/services/auth.service';
import { CotizacionRequest } from '../../Entidad/cotizacion.model';
import { DetalleCotizacionRequest } from '../../Entidad/detalle-cotizacion.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { CondicionPagoResponse } from '../../Entidad/condicion-pago.model';
import { ListaPreciosResponse } from '../../Entidad/lista-precios.model';
import { CotizacionService } from '../../Service/cotizacion.service';
import { DetalleCotizacionService } from '../../Service/detalle-cotizacion.service';
import { ClienteService } from '../../Service/cliente.service';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { ListaPreciosService } from '../../Service/lista-precios.service';
import { PrecioProductoService } from '../../Service/precio-producto.service';
import { PrecioProductoResponse } from '../../Entidad/precio-producto.model';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { ProductoService } from '../../../ModuloInventario/Service/producto.service';
import { ProductoResponse } from '../../../ModuloInventario/Entidad/producto.model';
import { ProductoExistenciasService } from '../../../ModuloInventario/Service/producto-existencias.service';
import { ProductoExistenciasResponse } from '../../../ModuloInventario/Entidad/producto-existencias.model';
import { OrdenVentaService } from '../../Service/orden-venta.service';
import { DetalleOrdenVentaService } from '../../Service/detalle-orden-venta.service';
import { OrdenVentaRequest, OrdenVentaResponse } from '../../Entidad/orden-venta.model';
import { DetalleOrdenVentaRequest } from '../../Entidad/detalle-orden-venta.model';

interface DetalleLinea {
  productoId: number | null;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestoPorcentaje: number;
  observaciones: string;
  stockDisponible?: number;
}

@Component({
  selector: 'app-cotizacion-form',
  standalone: false,
  templateUrl: './cotizacion-form.component.html',
  styleUrl: './cotizacion-form.component.css'
})
export class CotizacionFormComponent implements OnInit {
  cotizacionForm: FormGroup;
  cotizacionId: number | null = null;
  private snapshotInicial = '';
  clientes: ClienteResponse[] = [];
  condicionesPago: CondicionPagoResponse[] = [];
  bodegas: BodegaResponse[] = [];
  listasPrecios: ListaPreciosResponse[] = [];
  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  existencias: ProductoExistenciasResponse[] = [];
  preciosListaActual: PrecioProductoResponse[] = [];
  preciosPorProducto = new Map<number, number>();
  mensajesStockPorLinea: Record<number, string> = {};
  lineasConStockInsuficiente = new Set<number>();

  loading = false;
  guardando = false;
  private catalogosCargados = false;

  estadosDisponibles = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'CONVERTIDA', 'VENCIDA', 'CANCELADA'];

  detallesCotizacion: DetalleLinea[] = [];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly location: Location,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly cotizacionService: CotizacionService,
    private readonly detalleCotizacionService: DetalleCotizacionService,
    private readonly clienteService: ClienteService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly bodegaService: BodegaService,
    private readonly listaPreciosService: ListaPreciosService,
    private readonly productoService: ProductoService,
    private readonly precioProductoService: PrecioProductoService,
    private readonly productoExistenciasService: ProductoExistenciasService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly detalleOrdenVentaService: DetalleOrdenVentaService
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
      subtotal: [{ value: 0, disabled: true }],
      descuentoPorcentaje: [0],
      descuentoMonto: [{ value: 0, disabled: true }],
      impuestoMonto: [{ value: 0, disabled: true }],
      total: [{ value: 0, disabled: true }],
      estado: ['BORRADOR', Validators.required],
      observaciones: [''],
      terminosCondiciones: [''],
      tiempoEntrega: ['']
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.cotizacionId = idParam ? Number(idParam) : null;
    console.log('[COT-DEBUG] ngOnInit', { idParam, cotizacionId: this.cotizacionId });

    if (this.cotizacionId) {
      this.cargarCotizacionExistente(this.cotizacionId);
    } else {
      this.cotizacionForm.patchValue({ numeroCotizacion: `COT-${Date.now()}` });
      this.agregarLinea();
    }

    this.cargarCatalogos();
    this.configurarAutocompletadoCliente();
    this.configurarCambioListaPrecios();
    this.configurarCambioFechaVencimiento();
    this.configurarCambioBodega();
    this.aplicarRestriccionesPorEstado();
    this.actualizarSnapshotInicial();
  }

  cargarCotizacionExistente(id: number): void {
    console.log('[COT-DEBUG] cargarCotizacionExistente:start', { id });
    this.cotizacionService.findById(id).subscribe({
      next: (cotizacion) => {
        console.log('[COT-DEBUG] cargarCotizacionExistente:header', {
          id: cotizacion.id,
          estado: cotizacion.estado,
          bodegaId: cotizacion.bodegaId,
          clienteId: cotizacion.clienteId,
          condicionPagoId: cotizacion.condicionPagoId
        });
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
          descuentoPorcentaje: cotizacion.descuentoPorcentaje || 0,
          descuentoMonto: cotizacion.descuentoMonto || 0,
          impuestoMonto: cotizacion.impuestoMonto,
          total: cotizacion.total,
          estado: cotizacion.estado,
          observaciones: cotizacion.observaciones || '',
          terminosCondiciones: cotizacion.terminosCondiciones || '',
          tiempoEntrega: cotizacion.tiempoEntrega || ''
        }, { emitEvent: false });

        this.aplicarEstadoVencidaPorFecha();
        this.aplicarRestriccionesPorEstado();
      },
      error: (error) => {
        console.error('Error al cargar cotización:', error);
        console.error('[COT-DEBUG] cargarCotizacionExistente:header:error', error);
        this.notificationService.error(error.message || 'No se pudo cargar la cotización');
      }
    });

    this.detalleCotizacionService.findByCotizacion(id).subscribe({
      next: (detalles) => {
        console.log('[COT-DEBUG] cargarCotizacionExistente:detalles', {
          cotizacionId: id,
          totalDetalles: detalles.length,
          detalles: detalles.map((d) => ({ id: d.id, productoId: d.productoId, cantidad: d.cantidad }))
        });
        this.detallesCotizacion = detalles.map((detalle) => ({
          productoId: detalle.productoId,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          descuentoPorcentaje: detalle.descuentoPorcentaje || 0,
          descuentoMonto: detalle.descuentoMonto || 0,
          impuestoPorcentaje: detalle.impuestoPorcentaje || 0,
          observaciones: detalle.observaciones || ''
        }));

        if (this.detallesCotizacion.length === 0) {
          this.detallesCotizacion = [];
          this.agregarLinea();
        }

        this.recalcularTotales();
        this.actualizarSnapshotInicial();
      },
      error: (error) => {
        console.error('[COT-DEBUG] cargarCotizacionExistente:detalles:error', error);
        this.detallesCotizacion = [];
        this.agregarLinea();
        this.actualizarSnapshotInicial();
      }
    });
  }

  configurarCambioFechaVencimiento(): void {
    this.cotizacionForm.get('fechaVencimiento')?.valueChanges.subscribe(() => {
      this.aplicarEstadoVencidaPorFecha();
      this.aplicarRestriccionesPorEstado();
    });
  }

  configurarCambioListaPrecios(): void {
    this.cotizacionForm.get('listaPreciosId')?.valueChanges.subscribe((listaPreciosId: number | null) => {
      this.cargarPreciosPorLista(listaPreciosId);
    });
  }

  configurarAutocompletadoCliente(): void {
    this.cotizacionForm.get('clienteId')?.valueChanges.subscribe((clienteId: number | null) => {
      if (!clienteId) {
        this.cotizacionForm.patchValue(
          {
            listaPreciosId: null,
            condicionPagoId: null
          },
          { emitEvent: false }
        );
        this.cargarPreciosPorLista(null);
        return;
      }

      const clienteSeleccionado = this.clientes.find((cliente) => cliente.id === Number(clienteId));
      const listaPreciosCliente = clienteSeleccionado?.listaPreciosId ?? null;
      const condicionPagoCliente = clienteSeleccionado?.condicionPagoId ?? null;

      this.cotizacionForm.patchValue(
        {
          listaPreciosId: listaPreciosCliente,
          condicionPagoId: condicionPagoCliente
        },
        { emitEvent: false }
      );

      this.cargarPreciosPorLista(listaPreciosCliente);
    });
  }

  cargarCatalogos(): void {
    this.loading = true;
    console.log('[COT-DEBUG] cargarCatalogos:start');
    forkJoin({
      clientes: this.clienteService.findActivos(),
      condiciones: this.condicionPagoService.findActivas(),
      bodegas: this.bodegaService.findAll(),
      listas: this.listaPreciosService.findActivos(),
      productos: this.productoService.findAll(),
      existencias: this.productoExistenciasService.findAll()
    }).subscribe({
      next: ({ clientes, condiciones, bodegas, listas, productos, existencias }) => {
        this.clientes = clientes;
        this.condicionesPago = condiciones;
        this.bodegas = bodegas.filter((bodega) => bodega.activo);
        this.listasPrecios = listas;
        this.productos = productos.filter((producto) => producto.activo && producto.estado);
        this.existencias = existencias.filter((existencia) => existencia.activo);
        this.actualizarProductosPorBodega(Number(this.cotizacionForm.get('bodegaId')?.value || 0));
        this.catalogosCargados = true;
        console.log('[COT-DEBUG] cargarCatalogos:done', {
          clientes: this.clientes.length,
          condiciones: this.condicionesPago.length,
          bodegas: this.bodegas.length,
          listas: this.listasPrecios.length,
          productosActivos: this.productos.length,
          existenciasActivas: this.existencias.length,
          productosFiltrados: this.productosFiltrados.length,
          bodegaActual: this.cotizacionForm.get('bodegaId')?.value
        });

        const listaPreciosActual = this.cotizacionForm.get('listaPreciosId')?.value;
        if (listaPreciosActual) {
          this.cargarPreciosPorLista(Number(listaPreciosActual));
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar catálogos de cotización:', error);
        console.error('[COT-DEBUG] cargarCatalogos:error', error);
        this.catalogosCargados = false;
        this.notificationService.error('Error al cargar información inicial de la cotización');
        this.loading = false;
      }
    });
  }

  configurarCambioBodega(): void {
    this.cotizacionForm.get('bodegaId')?.valueChanges.subscribe((bodegaId: number | null) => {
      const id = Number(bodegaId || 0);
      console.log('[COT-DEBUG] configurarCambioBodega:valueChanges', {
        bodegaId: id,
        detallesAntes: this.detallesCotizacion.map((l) => l.productoId)
      });
      this.actualizarProductosPorBodega(id);
      this.limpiarLineasSinDisponibilidad(id);
      this.detallesCotizacion.forEach((_, index) => this.validarExistenciasLinea(index, false));
      this.recalcularTotales();
      console.log('[COT-DEBUG] configurarCambioBodega:after', {
        bodegaId: id,
        productosFiltrados: this.productosFiltrados.length,
        detallesDespues: this.detallesCotizacion.map((l) => l.productoId)
      });
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
    console.log('[COT-DEBUG] actualizarProductosPorBodega', {
      bodegaId,
      totalProductos: this.productos.length,
      productosConExistencia: productosIds.size,
      filtrados: this.productosFiltrados.length
    });
  }

  private limpiarLineasSinDisponibilidad(bodegaId: number): void {
    if (!bodegaId || !this.catalogosCargados || !this.puedeEditarCampos()) {
      return;
    }

    const permitidos = new Set(this.productosFiltrados.map((producto) => producto.id));
    if (permitidos.size === 0) {
      console.warn('[COT-DEBUG] limpiarLineasSinDisponibilidad:omitido_sin_permitidos', {
        bodegaId,
        catalogosCargados: this.catalogosCargados,
        productos: this.productos.length,
        filtrados: this.productosFiltrados.length
      });
      return;
    }
    let limpiadas = 0;

    this.detallesCotizacion.forEach((linea) => {
      if (linea.productoId && !permitidos.has(Number(linea.productoId))) {
        console.warn('[COT-DEBUG] limpiarLineasSinDisponibilidad:limpiando', {
          bodegaId,
          productoId: linea.productoId
        });
        linea.productoId = null;
        linea.cantidad = 1;
        linea.precioUnitario = 0;
        linea.descuentoPorcentaje = 0;
        linea.descuentoMonto = 0;
        linea.impuestoPorcentaje = 0;
        linea.stockDisponible = 0;
        limpiadas += 1;
      }
    });

    if (limpiadas > 0) {
      console.warn('[COT-DEBUG] limpiarLineasSinDisponibilidad:resumen', {
        bodegaId,
        lineasLimpiadas: limpiadas
      });
    }
  }

  getProductosOpciones(linea: DetalleLinea): ProductoResponse[] {
    const opcionesBase = this.puedeEditarCampos() ? this.productosFiltrados : this.productos;

    if (!linea?.productoId) {
      return opcionesBase;
    }

    const productoId = Number(linea.productoId);
    const yaExiste = opcionesBase.some((producto) => producto.id === productoId);
    if (yaExiste) {
      return opcionesBase;
    }

    const productoSeleccionado = this.productos.find((producto) => producto.id === productoId);
    if (!productoSeleccionado) {
      console.warn('[COT-DEBUG] getProductosOpciones:productoNoEncontrado', {
        productoId,
        totalProductosCatalogo: this.productos.length,
        totalFiltrados: this.productosFiltrados.length,
        editable: this.puedeEditarCampos()
      });
      return opcionesBase;
    }

    return [productoSeleccionado, ...opcionesBase];
  }

  cargarPreciosPorLista(listaPreciosId: number | null): void {
    this.preciosPorProducto.clear();
    this.preciosListaActual = [];

    if (!listaPreciosId) {
      this.detallesCotizacion.forEach((_, index) => this.actualizarLineaPorProducto(index, false));
      return;
    }

    this.precioProductoService.findByListaPrecios(Number(listaPreciosId)).subscribe({
      next: (precios) => {
        const vigentes = precios.filter((precio) => precio.activo && precio.estaVigente);
        const preciosFuente = vigentes.length > 0 ? vigentes : precios.filter((precio) => precio.activo);

        this.preciosListaActual = preciosFuente;
        preciosFuente.forEach((precio) => {
          this.preciosPorProducto.set(precio.productoId, Number(precio.precio));
        });

        this.detallesCotizacion.forEach((_, index) => this.actualizarLineaPorProducto(index, false));
      },
      error: (error) => {
        console.error('Error al cargar precios por lista:', error);
        this.notificationService.warning('No se pudieron cargar los precios de la lista seleccionada');
      }
    });
  }

  getFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  getFechaFutura(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }

  seleccionarEstado(estado: string): void {
    const estadoActual = this.cotizacionForm.get('estado')?.value;

    if (!this.cotizacionId || estadoActual === estado) {
      this.cotizacionForm.patchValue({ estado });
      return;
    }

    if (estadoActual === 'BORRADOR' && estado === 'ENVIADA') {
      this.cotizacionService.enviar(this.cotizacionId).subscribe({
        next: () => {
          this.cotizacionForm.patchValue({ estado: 'ENVIADA' });
          this.aplicarRestriccionesPorEstado();
          this.actualizarSnapshotInicial();
          this.notificationService.success('Cotización enviada exitosamente');
        },
        error: (error) => {
          this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
      return;
    }

    if (estadoActual === 'ENVIADA' && estado === 'APROBADA') {
      const usuarioId = this.authService.userId;
      console.log('[COTIZACION-DEBUG] aprobar desde formulario', {
        cotizacionId: this.cotizacionId,
        estadoActual,
        usuarioId
      });

      if (!usuarioId) {
        this.authService.debugAuthState('cotizacion-form-aprobar-sin-usuarioId');
        this.notificationService.error('No se pudo identificar el usuario autenticado. Cierra sesión e inicia nuevamente.');
        return;
      }

      const cotizacionId = this.cotizacionId;
      if (!cotizacionId) {
        return;
      }

      this.cotizacionService.aprobar(cotizacionId, usuarioId).subscribe({
        next: () => {
          this.cotizacionForm.patchValue({ estado: 'APROBADA' });
          this.aplicarRestriccionesPorEstado();
          this.actualizarSnapshotInicial();
          this.notificationService.success('Cotización aprobada exitosamente');
        },
        error: (error) => {
          this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
      return;
    }

    if (estadoActual === 'ENVIADA' && estado === 'RECHAZADA') {
      this.cotizacionService.rechazar(this.cotizacionId).subscribe({
        next: () => {
          this.cotizacionForm.patchValue({ estado: 'RECHAZADA' });
          this.aplicarRestriccionesPorEstado();
          this.actualizarSnapshotInicial();
          this.notificationService.success('Cotización rechazada exitosamente');
        },
        error: (error) => {
          this.notificationService.error(error.message, 'No se pudo cambiar el estado');
        }
      });
      return;
    }

    this.notificationService.warning('Transición de estado no permitida para esta cotización');
  }

  agregarLinea(): void {
    if (!this.puedeEditarCampos()) {
      return;
    }

    this.detallesCotizacion.push({
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
    if (!this.puedeEditarCampos()) {
      return;
    }

    this.detallesCotizacion.splice(index, 1);
    delete this.mensajesStockPorLinea[index];
    this.lineasConStockInsuficiente.delete(index);
    this.recalcularTotales();
  }

  onProductoSeleccionado(index: number): void {
    if (!this.puedeEditarCampos()) {
      return;
    }
    this.actualizarLineaPorProducto(index, true);
  }

  onCantidadChange(index: number): void {
    if (!this.puedeEditarCampos()) {
      return;
    }
    this.validarExistenciasLinea(index, true);
    this.recalcularTotales();
  }

  onLineaChange(index?: number): void {
    if (!this.puedeEditarCampos()) {
      return;
    }

    if (index !== undefined) {
      this.validarExistenciasLinea(index, false);
    }
    this.recalcularTotales();
  }

  actualizarLineaPorProducto(index: number, mostrarNotificacion: boolean): void {
    const linea = this.detallesCotizacion[index];
    if (!linea) return;

    if (!linea.productoId) {
      linea.precioUnitario = 0;
      linea.descuentoMonto = 0;
      linea.stockDisponible = 0;
      delete this.mensajesStockPorLinea[index];
      this.lineasConStockInsuficiente.delete(index);
      this.recalcularTotales();
      return;
    }

    const esProductoPermitido = this.productosFiltrados.some((producto) => producto.id === Number(linea.productoId));
    if (!esProductoPermitido) {
      linea.productoId = null;
      linea.precioUnitario = 0;
      linea.descuentoMonto = 0;
      linea.stockDisponible = 0;
      if (mostrarNotificacion) {
        this.notificationService.warning('El producto seleccionado no pertenece a la bodega elegida');
      }
      this.recalcularTotales();
      return;
    }

    const listaPreciosId = Number(this.cotizacionForm.get('listaPreciosId')?.value);
    if (!listaPreciosId) {
      if (mostrarNotificacion) {
        this.notificationService.warning('Selecciona primero una lista de precios');
      }
      return;
    }

    const precio = this.preciosPorProducto.get(Number(linea.productoId));
    if (precio === undefined) {
      linea.precioUnitario = 0;
      if (mostrarNotificacion) {
        this.notificationService.warning('El producto no tiene precio configurado en la lista seleccionada');
      }
    } else {
      linea.precioUnitario = Number(precio.toFixed(2));
    }

    this.validarExistenciasLinea(index, mostrarNotificacion);
    this.recalcularTotales();
  }

  validarExistenciasLinea(index: number, mostrarNotificacion: boolean): void {
    const linea = this.detallesCotizacion[index];
    if (!linea?.productoId) {
      delete this.mensajesStockPorLinea[index];
      this.lineasConStockInsuficiente.delete(index);
      return;
    }

    const stockDisponible = this.obtenerStockDisponible(Number(linea.productoId));
    linea.stockDisponible = stockDisponible;

    if ((linea.cantidad || 0) > stockDisponible) {
      const mensaje = `Stock insuficiente. Disponible: ${stockDisponible}`;
      this.mensajesStockPorLinea[index] = mensaje;
      this.lineasConStockInsuficiente.add(index);

      if (mostrarNotificacion) {
        this.notificationService.warning(mensaje);
      }
      return;
    }

    this.mensajesStockPorLinea[index] = `Disponible: ${stockDisponible}`;
    this.lineasConStockInsuficiente.delete(index);
  }

  obtenerStockDisponible(productoId: number): number {
    const bodegaId = Number(this.cotizacionForm.get('bodegaId')?.value);
    return this.existencias
      .filter((existencia) =>
        existencia.productoId === productoId &&
        (!bodegaId || existencia.bodegaId === bodegaId)
      )
      .reduce((acumulado, existencia) => acumulado + Number(existencia.cantidadDisponible || 0), 0);
  }

  recalcularTotales(): void {
    let subtotal = 0;
    let descuentoMonto = 0;
    let impuestoMonto = 0;

    for (const linea of this.detallesCotizacion) {
      const subtotalLinea = (linea.cantidad || 0) * (linea.precioUnitario || 0);
      const descuentoLinea = subtotalLinea * ((linea.descuentoPorcentaje || 0) / 100);
      linea.descuentoMonto = Number(descuentoLinea.toFixed(2));
      const baseImponible = Math.max(subtotalLinea - descuentoLinea, 0);
      const impuestoLinea = baseImponible * ((linea.impuestoPorcentaje || 0) / 100);

      subtotal += subtotalLinea;
      descuentoMonto += descuentoLinea;
      impuestoMonto += impuestoLinea;
    }

    const total = Math.max(subtotal - descuentoMonto + impuestoMonto, 0);

    this.cotizacionForm.patchValue(
      {
        subtotal: Number(subtotal.toFixed(2)),
        descuentoMonto: Number(descuentoMonto.toFixed(2)),
        impuestoMonto: Number(impuestoMonto.toFixed(2)),
        total: Number(total.toFixed(2))
      },
      { emitEvent: false }
    );
  }

  getTotalLinea(linea: DetalleLinea): number {
    const subtotalLinea = (linea.cantidad || 0) * (linea.precioUnitario || 0);
    const descuentoLinea = subtotalLinea * ((linea.descuentoPorcentaje || 0) / 100);
    const baseImponible = Math.max(subtotalLinea - descuentoLinea, 0);
    const impuestoLinea = baseImponible * ((linea.impuestoPorcentaje || 0) / 100);
    return Number(Math.max(baseImponible + impuestoLinea, 0).toFixed(2));
  }

  getPrecioConIva(linea: DetalleLinea): number {
    const subtotalLinea = (linea.cantidad || 0) * (linea.precioUnitario || 0);
    const descuentoLinea = subtotalLinea * ((linea.descuentoPorcentaje || 0) / 100);
    const baseImponible = Math.max(subtotalLinea - descuentoLinea, 0);
    const impuestoLinea = baseImponible * ((linea.impuestoPorcentaje || 0) / 100);
    return Number((baseImponible + impuestoLinea).toFixed(2));
  }

  isEstadoActivo(estado: string): boolean {
    return this.cotizacionForm.get('estado')?.value === estado;
  }

  guardarCotizacion(): void {
    if (!this.mostrarBotonesGuardarDescartar()) {
      this.notificationService.warning('No hay cambios para guardar o no se permite editar en este estado');
      return;
    }

    if (this.cotizacionForm.invalid) {
      this.cotizacionForm.markAllAsTouched();
      this.notificationService.warning('Completa la información requerida de la cotización');
      return;
    }

    const lineasValidas = this.detallesCotizacion.filter((linea) => !!linea.productoId && linea.cantidad > 0);
    if (lineasValidas.length === 0) {
      this.notificationService.warning('Debes registrar al menos una línea de detalle válida');
      return;
    }

    this.detallesCotizacion.forEach((_, index) => this.validarExistenciasLinea(index, false));
    if (this.lineasConStockInsuficiente.size > 0) {
      this.notificationService.warning('Hay líneas con cantidad mayor al stock disponible');
      return;
    }

    this.guardando = true;

    const cotizacionPayload: CotizacionRequest = this.cotizacionForm.getRawValue();
    const detallesPayload: DetalleCotizacionRequest[] = lineasValidas.map((linea) => ({
      cotizacionId: this.cotizacionId || 0,
      productoId: Number(linea.productoId),
      cantidad: Number(linea.cantidad),
      precioUnitario: Number(linea.precioUnitario),
      descuentoPorcentaje: Number(linea.descuentoPorcentaje || 0),
      descuentoMonto: Number(linea.descuentoMonto || 0),
      impuestoPorcentaje: Number(linea.impuestoPorcentaje || 0),
      observaciones: linea.observaciones || ''
    }));

    if (this.cotizacionId) {
      const cotizacionId = this.cotizacionId;

      this.cotizacionService.update(cotizacionId, cotizacionPayload).pipe(
        switchMap(() => this.detalleCotizacionService.findByCotizacion(cotizacionId)),
        switchMap((detallesExistentes) => {
          const eliminaciones = detallesExistentes.map((detalle) => this.detalleCotizacionService.delete(detalle.id));
          return eliminaciones.length > 0 ? forkJoin(eliminaciones) : of([]);
        }),
        switchMap(() => {
          const detallesParaGuardar = detallesPayload.map((detalle) => ({
            ...detalle,
            cotizacionId
          }));

          return detallesParaGuardar.length > 0
            ? forkJoin(detallesParaGuardar.map((detalle) => this.detalleCotizacionService.save(detalle)))
            : of([]);
        })
      ).subscribe({
        next: () => {
          this.notificationService.success('Cotización actualizada exitosamente');
          this.guardando = false;
          this.actualizarSnapshotInicial();
        },
        error: (error) => {
          console.error('Error al actualizar cotización:', error);
          this.notificationService.error(error.message, 'Error al actualizar cotización');
          this.guardando = false;
        }
      });

      return;
    }

    this.cotizacionService.save(cotizacionPayload).pipe(
      switchMap((cotizacionCreada) => {
        this.cotizacionId = cotizacionCreada.id;

        const detallesParaGuardar: DetalleCotizacionRequest[] = detallesPayload.map((linea) => ({
          cotizacionId: cotizacionCreada.id,
          productoId: linea.productoId,
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
          descuentoPorcentaje: linea.descuentoPorcentaje,
          descuentoMonto: linea.descuentoMonto,
          impuestoPorcentaje: linea.impuestoPorcentaje,
          observaciones: linea.observaciones
        }));

        if (detallesParaGuardar.length === 0) {
          return of(cotizacionCreada);
        }

        return forkJoin(detallesParaGuardar.map((detalle) => this.detalleCotizacionService.save(detalle))).pipe(
          switchMap(() => of(cotizacionCreada))
        );
      })
    ).subscribe({
      next: (cotizacionCreada) => {
        this.notificationService.success('Cotización creada exitosamente');
        this.location.replaceState(`/cotizaciones/${cotizacionCreada.id}`);
        this.cargarCotizacionExistente(cotizacionCreada.id);
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al guardar cotización completa:', error);
        this.notificationService.error(error.message, 'Error al guardar cotización');
        this.guardando = false;
      }
    });
  }

  descartar(): void {
    if (this.cotizacionId) {
      this.cargarCotizacionExistente(this.cotizacionId);
      return;
    }

    this.router.navigate(['/cotizaciones']);
  }

  volverListado(): void {
    this.router.navigate(['/cotizaciones']);
  }

  obtenerEstadoActual(): string {
    return this.cotizacionForm.get('estado')?.value || 'BORRADOR';
  }

  puedeEditarCampos(): boolean {
    return this.obtenerEstadoActual() === 'BORRADOR';
  }

  mostrarBotonesGuardarDescartar(): boolean {
    return this.puedeEditarCampos() && this.tieneCambiosPendientes();
  }

  mostrarAccionesEnviada(): boolean {
    return !!this.cotizacionId && this.obtenerEstadoActual() === 'ENVIADA';
  }

  mostrarBotonEnviar(): boolean {
    return !!this.cotizacionId && this.obtenerEstadoActual() === 'BORRADOR' && !this.tieneCambiosPendientes();
  }

  mostrarBotonConvertir(): boolean {
    return !!this.cotizacionId && this.obtenerEstadoActual() === 'APROBADA';
  }

  aprobarDesdeToolbar(): void {
    this.seleccionarEstado('APROBADA');
  }

  enviarDesdeToolbar(): void {
    if (this.tieneCambiosPendientes()) {
      this.notificationService.warning('Guarda los cambios antes de enviar la cotización');
      return;
    }

    this.seleccionarEstado('ENVIADA');
  }

  cancelarDesdeToolbar(): void {
    this.seleccionarEstado('RECHAZADA');
  }

  convertirAOrdenDesdeToolbar(): void {
    if (!this.cotizacionId) {
      return;
    }

    if (this.puedeEditarCampos() && this.tieneCambiosPendientes()) {
      this.notificationService.warning('Guarda los cambios antes de convertir la cotización');
      return;
    }

    const usuarioId = this.authService.userId;
    console.log('[COTIZACION-DEBUG] convertir desde formulario', {
      cotizacionId: this.cotizacionId,
      usuarioId
    });

    if (!usuarioId) {
      this.authService.debugAuthState('cotizacion-form-convertir-sin-usuarioId');
      this.notificationService.error('No se pudo identificar el usuario autenticado. Cierra sesión e inicia nuevamente.');
      return;
    }

    const cotizacionId = this.cotizacionId;
    if (!cotizacionId) {
      return;
    }

    this.guardando = true;

    this.ordenVentaService.findByCotizacion(cotizacionId).pipe(
      switchMap((ordenesExistentes) => {
        if (ordenesExistentes.length > 0) {
          return of(ordenesExistentes[0]);
        }
        return this.crearOrdenVentaDesdeCotizacion(cotizacionId, usuarioId);
      }),
      switchMap((ordenCreada) =>
        this.cotizacionService.convertirAOrdenVenta(cotizacionId, ordenCreada.id).pipe(
          map(() => ordenCreada)
        )
      )
    ).subscribe({
      next: (ordenCreada) => {
        this.cotizacionForm.patchValue({ estado: 'CONVERTIDA' });
        this.aplicarRestriccionesPorEstado();
        this.actualizarSnapshotInicial();
        this.notificationService.success('Cotización convertida a orden de venta exitosamente');
        this.router.navigate(['/ordenes-venta', ordenCreada.id]);
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al convertir cotización:', error);
        this.notificationService.error(error.message, 'No se pudo convertir la cotización');
        this.guardando = false;
      }
    });
  }

  private crearOrdenVentaDesdeCotizacion(cotizacionId: number, usuarioId: number) {
    const datos = this.cotizacionForm.getRawValue();
    const fechaOrden = this.getFechaHoy();

    const payloadOrden: OrdenVentaRequest = {
      numeroOrden: `OV-${Date.now()}`,
      cotizacionId,
      clienteId: Number(datos.clienteId),
      contactoClienteId: datos.contactoClienteId ? Number(datos.contactoClienteId) : undefined,
      fechaOrden,
      fechaEntregaEstimada: datos.fechaVencimiento || undefined,
      vendedorId: Number(datos.vendedorId),
      bodegaId: Number(datos.bodegaId),
      condicionPagoId: Number(datos.condicionPagoId),
      tiempoEntrega: datos.tiempoEntrega || undefined,
      subtotal: Number(datos.subtotal || 0),
      descuentoPorcentaje: Number(datos.descuentoPorcentaje || 0),
      descuentoMonto: Number(datos.descuentoMonto || 0),
      impuestoMonto: Number(datos.impuestoMonto || 0),
      total: Number(datos.total || 0),
      observaciones: datos.observaciones || undefined,
      usuarioCreacionId: usuarioId
    };

    return this.ordenVentaService.save(payloadOrden).pipe(
      switchMap((ordenCreada: OrdenVentaResponse) =>
        this.detalleCotizacionService.findByCotizacion(cotizacionId).pipe(
          switchMap((detallesCotizacion) => {
            if (!detallesCotizacion.length) {
              return of(ordenCreada);
            }

            const detallesOrden: DetalleOrdenVentaRequest[] = detallesCotizacion.map((detalle) => ({
              ordenVentaId: ordenCreada.id,
              productoId: detalle.productoId,
              cantidad: Number(detalle.cantidad),
              precioUnitario: Number(detalle.precioUnitario),
              descuentoPorcentaje: Number(detalle.descuentoPorcentaje || 0),
              descuentoMonto: Number(detalle.descuentoMonto || 0),
              impuestoPorcentaje: Number(detalle.impuestoPorcentaje || 0),
              observaciones: detalle.observaciones || ''
            }));

            return forkJoin(detallesOrden.map((detalle) => this.detalleOrdenVentaService.save(detalle))).pipe(
              map(() => ordenCreada)
            );
          })
        )
      )
    );
  }

  puedeSeleccionarEstado(estado: string): boolean {
    const estadoActual = this.obtenerEstadoActual();

    if (!this.cotizacionId) {
      return false;
    }

    if (estadoActual === 'BORRADOR' && estado === 'ENVIADA') {
      return true;
    }

    if (estadoActual === 'ENVIADA' && (estado === 'APROBADA' || estado === 'RECHAZADA')) {
      return true;
    }

    return false;
  }

  aplicarEstadoVencidaPorFecha(): void {
    const estadoActual = this.obtenerEstadoActual();
    const fechaVencimiento = this.cotizacionForm.get('fechaVencimiento')?.value;

    if (!fechaVencimiento) {
      return;
    }

    const hoy = this.getFechaHoy();
    const estaVencida = fechaVencimiento < hoy;

    if (estaVencida && (estadoActual === 'BORRADOR' || estadoActual === 'ENVIADA')) {
      this.cotizacionForm.patchValue({ estado: 'VENCIDA' }, { emitEvent: false });
    }
  }

  aplicarRestriccionesPorEstado(): void {
    const estadoActual = this.obtenerEstadoActual();

    if (estadoActual === 'BORRADOR') {
      this.cotizacionForm.enable({ emitEvent: false });
    } else {
      this.cotizacionForm.disable({ emitEvent: false });
    }

    this.cotizacionForm.get('subtotal')?.disable({ emitEvent: false });
    this.cotizacionForm.get('descuentoMonto')?.disable({ emitEvent: false });
    this.cotizacionForm.get('impuestoMonto')?.disable({ emitEvent: false });
    this.cotizacionForm.get('total')?.disable({ emitEvent: false });
    this.cotizacionForm.get('estado')?.disable({ emitEvent: false });
  }

  private generarSnapshotActual(): string {
    const datosFormulario = this.cotizacionForm.getRawValue();
    const detallesNormalizados = this.detallesCotizacion.map((linea) => ({
      productoId: linea.productoId,
      cantidad: Number(linea.cantidad || 0),
      precioUnitario: Number(linea.precioUnitario || 0),
      descuentoPorcentaje: Number(linea.descuentoPorcentaje || 0),
      impuestoPorcentaje: Number(linea.impuestoPorcentaje || 0),
      observaciones: linea.observaciones || ''
    }));

    return JSON.stringify({ datosFormulario, detallesNormalizados });
  }

  actualizarSnapshotInicial(): void {
    this.snapshotInicial = this.generarSnapshotActual();
  }

  tieneCambiosPendientes(): boolean {
    return this.generarSnapshotActual() !== this.snapshotInicial;
  }

  formatCurrency(value: number): string {
    return `$${(value || 0).toFixed(2)}`;
  }

  getFieldError(fieldName: string): string {
    const field = this.cotizacionForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cotizacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
