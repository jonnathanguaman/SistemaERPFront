import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../Compartido/services/auth.service';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { ProductoExistenciasService } from '../../../ModuloInventario/Service/producto-existencias.service';
import { PrecioProductoService } from '../../Service/precio-producto.service';
import { ClienteService } from '../../Service/cliente.service';
import { OrdenVentaService } from '../../Service/orden-venta.service';
import { DetalleOrdenVentaService } from '../../Service/detalle-orden-venta.service';
import { FormaPagoService } from '../../Service/forma-pago.service';
import { FacturaService } from '../../Service/factura.service';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { ListaPreciosService } from '../../Service/lista-precios.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PaisService } from '../../../ModuloEmpresa/Service/pais.service';
import { ProvinciaService } from '../../../ModuloEmpresa/Service/provincia.service';
import { CiudadService } from '../../../ModuloEmpresa/Service/ciudad.service';

import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { ProductoExistenciasResponse } from '../../../ModuloInventario/Entidad/producto-existencias.model';
import { PrecioProductoResponse } from '../../Entidad/precio-producto.model';
import { ClienteRequest, ClienteResponse } from '../../Entidad/cliente.model';
import { FormaPagoResponse } from '../../Entidad/forma-pago.model';
import { CondicionPagoResponse } from '../../Entidad/condicion-pago.model';
import { ListaPreciosResponse } from '../../Entidad/lista-precios.model';
import { OrdenVentaResponse } from '../../Entidad/orden-venta.model';
import { DetalleOrdenVentaRequest } from '../../Entidad/detalle-orden-venta.model';
import { PaisResponse } from '../../../ModuloEmpresa/Entidad/pais.model';
import { ProvinciaResponse } from '../../../ModuloEmpresa/Entidad/provincia.model';
import { CiudadResponse } from '../../../ModuloEmpresa/Entidad/ciudad.model';

export interface LineaFactura {
  productoId: number;
  productoNombre: string;
  sku: string;
  bodegaId: number;
  bodegaNombre: string;
  stockDisponible: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
}

interface NuevoClienteFacturador {
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  condicionPagoId: number | null;
  listaPreciosId: number | null;
  razonSocial: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  paisId: number | null;
  provinciaId: number | null;
  ciudadId: number | null;
}

@Component({
  selector: 'app-facturador',
  standalone: false,
  templateUrl: './facturador.component.html',
  styleUrl: './facturador.component.css'
})
export class FacturadorComponent implements OnInit {

  loading = true;
  guardando = false;
  errorMsg = '';
  successMsg = '';

  // Datos de catálogo
  bodegas: BodegaResponse[] = [];
  existencias: ProductoExistenciasResponse[] = [];
  precios: PrecioProductoResponse[] = [];
  clientes: ClienteResponse[] = [];
  formasPago: FormaPagoResponse[] = [];
  condicionesPago: CondicionPagoResponse[] = [];
  listasPrecios: ListaPreciosResponse[] = [];
  paises: PaisResponse[] = [];
  provinciasRegistroCliente: ProvinciaResponse[] = [];
  ciudadesRegistroCliente: CiudadResponse[] = [];

  // Búsqueda de productos
  busquedaProducto = '';
  busquedaCedula = '';

  showRegistrarClienteModal = false;
  registrandoCliente = false;
  registrarClienteError = '';
  nuevoCliente: NuevoClienteFacturador = {
    tipoIdentificacion: 'DNI',
    numeroIdentificacion: '',
    condicionPagoId: null as number | null,
    listaPreciosId: null as number | null,
    razonSocial: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    pais: '',
    paisId: null,
    provinciaId: null,
    ciudadId: null
  };

  // Cabecera de la factura
  numeroFactura = '';
  clienteId: number | null = null;
  formaPagoId: number | null = null;
  fechaEmision = '';
  fechaVencimiento = '';
  ordenVentaId: number | null = null;
  ordenVentaNumero = '';
  observaciones = '';

  // Carrito
  lineas: LineaFactura[] = [];

  readonly IVA_RATE = 0.15;

  constructor(
    private readonly authService: AuthService,
    private readonly bodegaService: BodegaService,
    private readonly existenciasService: ProductoExistenciasService,
    private readonly precioService: PrecioProductoService,
    private readonly clienteService: ClienteService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly detalleOrdenVentaService: DetalleOrdenVentaService,
    private readonly formaPagoService: FormaPagoService,
    private readonly facturaService: FacturaService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly listaPreciosService: ListaPreciosService,
    private readonly paisService: PaisService,
    private readonly provinciaService: ProvinciaService,
    private readonly ciudadService: CiudadService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaEmision = this.formatDate(hoy);
    const venc = new Date(hoy);
    venc.setDate(venc.getDate() + 30);
    this.fechaVencimiento = this.formatDate(venc);
    this.numeroFactura = 'AUTOGENERADO';
    this.ordenVentaNumero = '';
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      bodegas: this.bodegaService.findAll(),
      existencias: this.existenciasService.findAll(),
      precios: this.precioService.findAll(),
      clientes: this.clienteService.findActivos(),
      formasPago: this.formaPagoService.findActivos(),
      condicionesPago: this.condicionPagoService.findActivas(),
      listasPrecios: this.listaPreciosService.findActivos(),
      paises: this.paisService.findActivos()
    }).subscribe({
      next: ({ bodegas, existencias, precios, clientes, formasPago, condicionesPago, listasPrecios, paises }) => {
        const empresaId = this.authService.empresaId;
        this.bodegas = bodegas.filter(b => b.empresaId === empresaId && b.activo);
        const bodegaIds = new Set(this.bodegas.map(b => b.id));
        // Agrupar existencias por producto: sumar stock de todas las bodegas de la empresa
        const mapa = new Map<number, ProductoExistenciasResponse>();
        existencias
          .filter(e => bodegaIds.has(e.bodegaId) && e.activo && e.cantidadDisponible > 0)
          .forEach(e => {
            if (mapa.has(e.productoId)) {
              const actual = mapa.get(e.productoId);
              if (actual) {
                actual.cantidadDisponible += e.cantidadDisponible;
              }
            } else {
              mapa.set(e.productoId, { ...e });
            }
          });
        this.existencias = Array.from(mapa.values());
        this.precios = precios.filter(p => p.activo && p.estaVigente);
        this.clientes = clientes;
        this.formasPago = formasPago;
        this.condicionesPago = condicionesPago;
        this.listasPrecios = listasPrecios;
        this.paises = paises;
        this.setDefaultsRegistroCliente();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get productosFiltrados(): ProductoExistenciasResponse[] {
    const q = this.busquedaProducto.toLowerCase().trim();
    if (!q) return this.existencias;
    return this.existencias.filter(e =>
      e.productoNombre.toLowerCase().includes(q)
    );
  }

  precioDeProducto(productoId: number): number {
    const p = this.precios.find(pr => pr.productoId === productoId);
    return p ? p.precio : 0;
  }

  buscarClientePorCedula(): void {
    const cedula = this.normalizarIdentificacion(this.busquedaCedula);
    this.busquedaCedula = cedula;

    if (!cedula) {
      this.errorMsg = 'Ingrese el número de cédula o RUC para buscar el cliente.';
      return;
    }

    if (!this.identificacionValida(cedula)) {
      this.errorMsg = 'La cédula debe tener 10 dígitos o el RUC 13 dígitos.';
      return;
    }

    this.errorMsg = '';
    this.successMsg = '';

    this.clienteService.findByIdentificacion(cedula).subscribe({
      next: (cliente) => {
        this.clientes = [cliente, ...this.clientes.filter(c => c.id !== cliente.id)];
        this.clienteId = cliente.id;
        this.cerrarModalRegistrarCliente();
        this.successMsg = `Cliente ${cliente.nombreCompleto || cliente.razonSocial || cliente.numeroIdentificacion} encontrado.`;
      },
      error: (err) => {
        this.clienteId = null;
        const mensaje = err?.message || 'No se encontró un cliente con esa identificación.';
        const mensajeLower = mensaje.toLowerCase();
        const yaExisteEnLista = this.clientes.some(c => c.numeroIdentificacion === cedula);
        const pareceNoEncontrado =
          mensajeLower.includes('no encontrado') ||
          mensajeLower.includes('no se encontró') ||
          mensajeLower.includes('not found') ||
          mensajeLower.includes('404');

        if (pareceNoEncontrado || !yaExisteEnLista) {
          this.abrirModalRegistrarCliente(cedula);
          return;
        }

        this.errorMsg = mensaje;
      }
    });
  }

  onBusquedaCedulaChange(value: string): void {
    this.busquedaCedula = this.normalizarIdentificacion(value);
  }

  onNuevoClienteNumeroChange(value: string): void {
    this.nuevoCliente.numeroIdentificacion = this.normalizarIdentificacion(value);
  }

  onNuevoClientePaisChange(): void {
    this.nuevoCliente.provinciaId = null;
    this.nuevoCliente.ciudadId = null;
    this.nuevoCliente.provincia = '';
    this.nuevoCliente.ciudad = '';
    this.provinciasRegistroCliente = [];
    this.ciudadesRegistroCliente = [];

    if (!this.nuevoCliente.paisId) {
      this.nuevoCliente.pais = '';
      return;
    }

    const paisSeleccionado = this.paises.find(p => p.id === this.nuevoCliente.paisId);
    this.nuevoCliente.pais = paisSeleccionado?.nombre || '';

    this.provinciaService.findByPais(this.nuevoCliente.paisId).subscribe({
      next: (data) => {
        this.provinciasRegistroCliente = data;
      },
      error: () => {
        this.registrarClienteError = 'No se pudieron cargar las provincias del país seleccionado.';
      }
    });
  }

  onNuevoClienteProvinciaChange(): void {
    this.nuevoCliente.ciudadId = null;
    this.nuevoCliente.ciudad = '';
    this.ciudadesRegistroCliente = [];

    if (!this.nuevoCliente.provinciaId) {
      this.nuevoCliente.provincia = '';
      return;
    }

    const provinciaSeleccionada = this.provinciasRegistroCliente.find(p => p.id === this.nuevoCliente.provinciaId);
    this.nuevoCliente.provincia = provinciaSeleccionada?.nombre || '';

    this.ciudadService.findByProvincia(this.nuevoCliente.provinciaId).subscribe({
      next: (data) => {
        this.ciudadesRegistroCliente = data;
      },
      error: () => {
        this.registrarClienteError = 'No se pudieron cargar las ciudades de la provincia seleccionada.';
      }
    });
  }

  onNuevoClienteCiudadChange(): void {
    if (!this.nuevoCliente.ciudadId) {
      this.nuevoCliente.ciudad = '';
      return;
    }

    const ciudadSeleccionada = this.ciudadesRegistroCliente.find(c => c.id === this.nuevoCliente.ciudadId);
    this.nuevoCliente.ciudad = ciudadSeleccionada?.nombre || '';
  }

  get puedeBuscarCliente(): boolean {
    return this.identificacionValida(this.busquedaCedula);
  }

  abrirModalRegistrarCliente(identificacion: string): void {
    const numeroIdentificacion = this.normalizarIdentificacion(identificacion);
    this.showRegistrarClienteModal = true;
    this.registrarClienteError = '';
    this.nuevoCliente = {
      tipoIdentificacion: this.tipoIdentificacionPorNumero(numeroIdentificacion),
      numeroIdentificacion,
      condicionPagoId: this.defaultCondicionPagoId(),
      listaPreciosId: this.defaultListaPreciosId(),
      razonSocial: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
      pais: '',
      paisId: null,
      provinciaId: null,
      ciudadId: null
    };
    this.provinciasRegistroCliente = [];
    this.ciudadesRegistroCliente = [];
  }

  cerrarModalRegistrarCliente(): void {
    this.showRegistrarClienteModal = false;
    this.registrandoCliente = false;
    this.registrarClienteError = '';
  }

  onModalOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarModalRegistrarCliente();
    }
  }

  onModalOverlayKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === 'Escape') {
      this.cerrarModalRegistrarCliente();
    }
  }

  guardarClienteDesdeModal(): void {
    const numeroIdentificacion = this.normalizarIdentificacion(this.nuevoCliente.numeroIdentificacion);
    this.nuevoCliente.numeroIdentificacion = numeroIdentificacion;
    this.nuevoCliente.listaPreciosId = this.defaultListaPreciosId();

    if (!this.identificacionValida(numeroIdentificacion)) {
      this.registrarClienteError = 'La cédula debe tener 10 dígitos o el RUC 13 dígitos.';
      return;
    }

    const razonSocial = this.nuevoCliente.razonSocial.trim();
    const nombres = this.nuevoCliente.nombres.trim();
    const apellidos = this.nuevoCliente.apellidos.trim();

    if (!razonSocial && !(nombres && apellidos)) {
      this.registrarClienteError = 'Ingrese razón social o nombres y apellidos.';
      return;
    }

    if (!this.nuevoCliente.condicionPagoId) {
      this.registrarClienteError = 'Seleccione una condición de pago.';
      return;
    }

    if (!this.nuevoCliente.listaPreciosId) {
      this.registrarClienteError = 'No existe una lista de precios Minorista activa. Configure una para poder registrar el cliente.';
      return;
    }

    if (!this.nuevoCliente.paisId || !this.nuevoCliente.provinciaId || !this.nuevoCliente.ciudadId) {
      this.registrarClienteError = 'Seleccione país, provincia y ciudad para registrar el cliente.';
      return;
    }

    const payload: ClienteRequest = {
      tipoIdentificacion: this.nuevoCliente.tipoIdentificacion,
      numeroIdentificacion,
      condicionPagoId: this.nuevoCliente.condicionPagoId,
      listaPreciosId: this.nuevoCliente.listaPreciosId,
      razonSocial: razonSocial || undefined,
      nombres: nombres || undefined,
      apellidos: apellidos || undefined,
      email: this.nuevoCliente.email.trim() || undefined,
      telefono: this.nuevoCliente.telefono.trim() || undefined,
      direccion: this.nuevoCliente.direccion.trim() || undefined,
      ciudad: this.nuevoCliente.ciudad.trim() || undefined,
      provincia: this.nuevoCliente.provincia.trim() || undefined,
      codigoPostal: this.nuevoCliente.codigoPostal.trim() || undefined,
      pais: this.nuevoCliente.pais.trim() || undefined,
      paisId: this.nuevoCliente.paisId,
      provinciaId: this.nuevoCliente.provinciaId,
      ciudadId: this.nuevoCliente.ciudadId
    };

    this.registrandoCliente = true;
    this.registrarClienteError = '';

    this.clienteService.save(payload).subscribe({
      next: (cliente) => {
        this.clientes = [cliente, ...this.clientes.filter(c => c.id !== cliente.id)];
        this.clienteId = cliente.id;
        this.busquedaCedula = cliente.numeroIdentificacion;
        this.successMsg = '';
        this.notificationService.toast(
          `Cliente ${cliente.nombreCompleto || cliente.razonSocial || cliente.numeroIdentificacion} registrado correctamente.`,
          'success'
        );
        this.errorMsg = '';
        this.cerrarModalRegistrarCliente();
      },
      error: (err) => {
        this.registrandoCliente = false;
        this.registrarClienteError = err?.message || 'No se pudo registrar el cliente.';
      }
    });
  }

  agregarProducto(ex: ProductoExistenciasResponse): void {
    const existente = this.lineas.find(l => l.productoId === ex.productoId);
    if (existente) {
      if (existente.cantidad < ex.cantidadDisponible) {
        existente.cantidad++;
      }
      return;
    }
    this.lineas.push({
      productoId: ex.productoId,
      productoNombre: ex.productoNombre,
      sku: '',
      bodegaId: ex.bodegaId,
      bodegaNombre: ex.bodegaNombre,
      stockDisponible: ex.cantidadDisponible,
      cantidad: 1,
      precioUnitario: this.precioDeProducto(ex.productoId),
      descuentoPct: 0
    });
  }

  eliminarLinea(idx: number): void {
    this.lineas.splice(idx, 1);
  }

  subtotalLinea(l: LineaFactura): number {
    const bruto = l.cantidad * l.precioUnitario;
    return bruto * (1 - l.descuentoPct / 100);
  }

  get subtotal(): number {
    return this.lineas.reduce((s, l) => s + this.subtotalLinea(l), 0);
  }

  get descuentoTotal(): number {
    return this.lineas.reduce((s, l) => s + (l.cantidad * l.precioUnitario * l.descuentoPct / 100), 0);
  }

  get iva(): number {
    return this.subtotal * this.IVA_RATE;
  }

  get total(): number {
    return this.subtotal + this.iva;
  }

  get clienteSeleccionado(): ClienteResponse | null {
    return this.clientes.find(c => c.id === this.clienteId) ?? null;
  }

  get formularioValido(): boolean {
    return !!this.clienteId && !!this.formaPagoId && !!this.numeroFactura
      && !!this.fechaEmision && !!this.fechaVencimiento && this.lineas.length > 0;
  }

  emitirFactura(): void {
    if (!this.formularioValido) {
      this.errorMsg = 'Complete todos los campos obligatorios y agregue al menos un producto.';
      return;
    }

    const cliente = this.clienteSeleccionado;
    const bodegaId = this.lineas[0]?.bodegaId ?? this.bodegas[0]?.id ?? null;
    const condicionPagoId = cliente?.condicionPagoId ?? null;

    if (!cliente) {
      this.errorMsg = 'Seleccione un cliente válido antes de emitir la factura.';
      return;
    }

    if (!bodegaId) {
      this.errorMsg = 'No hay una bodega disponible para generar la orden de venta.';
      return;
    }

    if (!condicionPagoId) {
      this.errorMsg = 'El cliente no tiene una condición de pago configurada.';
      return;
    }

    this.guardando = true;
    this.errorMsg = '';
    this.successMsg = '';

    const ordenPayload = {
      numeroOrden: 'AUTOGENERADO',
      clienteId: cliente.id,
      fechaOrden: this.fechaEmision,
      bodegaId,
      condicionPagoId,
      subtotal: +this.subtotal.toFixed(2),
      descuentoPorcentaje: 0,
      descuentoMonto: +this.descuentoTotal.toFixed(2),
      impuestoMonto: +this.iva.toFixed(2),
      total: +this.total.toFixed(2),
      requiereFactura: true,
      requiereGuiaRemision: false,
      desdeFacturador: true,
      observaciones: this.observaciones || undefined
    };

    this.ordenVentaService.save(ordenPayload).subscribe({
      next: (orden: OrdenVentaResponse) => {
        this.ordenVentaId = orden.id;
        this.ordenVentaNumero = orden.numeroOrden;

        const detallesOrden: DetalleOrdenVentaRequest[] = this.lineas.map(linea => ({
          ordenVentaId: orden.id,
          productoId: linea.productoId,
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
          descuentoPorcentaje: linea.descuentoPct,
          descuentoMonto: +(linea.cantidad * linea.precioUnitario * linea.descuentoPct / 100).toFixed(2),
          impuestoPorcentaje: 15,
          observaciones: linea.productoNombre
        }));

        if (detallesOrden.length === 0) {
          this.errorMsg = 'Agregue al menos un producto antes de emitir la factura.';
          this.guardando = false;
          return;
        }

        forkJoin(detallesOrden.map(detalle => this.detalleOrdenVentaService.save(detalle))).subscribe({
          next: () => this.crearFacturaConOrden(orden.id),
          error: (err) => {
            this.errorMsg = err.message || 'No se pudieron guardar los detalles de la orden de venta.';
            this.guardando = false;
          }
        });
      },
      error: (err) => {
        this.errorMsg = err.message || 'No se pudo generar la orden de venta.';
        this.guardando = false;
      }
    });
  }

  private crearFacturaConOrden(ordenVentaId: number): void {
    const payload: any = {
      numeroFactura: this.numeroFactura,
      clienteId: this.clienteId,
      formaPagoId: this.formaPagoId,
      fechaEmision: this.fechaEmision,
      fechaVencimiento: this.fechaVencimiento,
      subtotal: +this.subtotal.toFixed(2),
      descuentoMonto: +this.descuentoTotal.toFixed(2),
      impuestoMonto: +this.iva.toFixed(2),
      total: +this.total.toFixed(2),
      saldoPendiente: +this.total.toFixed(2),
      autorizadoSri: false,
      observaciones: this.observaciones || undefined,
      ordenVentaId
    };

    this.facturaService.crear(payload).subscribe({
      next: (factura) => {
        const mensajeExito = `Factura ${factura.numeroFactura} creada exitosamente. Orden ${this.ordenVentaNumero || ordenVentaId} generada.`;
        this.successMsg = mensajeExito;
        this.notificationService.showSuccess(mensajeExito, 'Factura creada');
        this.limpiarFormulario();
        this.guardando = false;
      },
      error: (err) => {
        this.errorMsg = err.message || 'Error al crear la factura.';
        this.guardando = false;
      }
    });
  }

  limpiarFormulario(): void {
    this.lineas = [];
    this.clienteId = null;
    this.formaPagoId = null;
    this.ordenVentaId = null;
    this.ordenVentaNumero = '';
    this.observaciones = '';
    this.numeroFactura = 'AUTOGENERADO';
    const hoy = new Date();
    this.fechaEmision = this.formatDate(hoy);
    const venc = new Date(hoy);
    venc.setDate(venc.getDate() + 30);
    this.fechaVencimiento = this.formatDate(venc);
    this.busquedaProducto = '';
    this.busquedaCedula = '';
  }

  validarCantidad(linea: LineaFactura): void {
    if (linea.cantidad < 1) linea.cantidad = 1;
    if (linea.cantidad > linea.stockDisponible) linea.cantidad = linea.stockDisponible;
  }

  validarDescuento(linea: LineaFactura): void {
    if (linea.descuentoPct < 0) linea.descuentoPct = 0;
    if (linea.descuentoPct > 100) linea.descuentoPct = 100;
  }

  private normalizarIdentificacion(value: string): string {
    return (value ?? '').replaceAll(/\D/g, '').slice(0, 13);
  }

  private identificacionValida(value: string): boolean {
    return /^\d{10}(\d{3})?$/.test((value ?? '').trim());
  }

  private tipoIdentificacionPorNumero(identificacion: string): string {
    return identificacion.length === 13 ? 'RUC' : 'DNI';
  }

  private setDefaultsRegistroCliente(): void {
    if (!this.nuevoCliente.condicionPagoId) {
      this.nuevoCliente.condicionPagoId = this.defaultCondicionPagoId();
    }
    if (!this.nuevoCliente.listaPreciosId) {
      this.nuevoCliente.listaPreciosId = this.defaultListaPreciosId();
    }
    if (!this.nuevoCliente.paisId && this.paises.length > 0) {
      const ecuador = this.paises.find(p => this.normalizarTexto(p.nombre) === 'ecuador');
      this.nuevoCliente.paisId = ecuador?.id ?? this.paises[0].id;
      this.onNuevoClientePaisChange();
    }
  }

  private defaultCondicionPagoId(): number | null {
    const efectivo = this.condicionesPago.find(c => this.normalizarTexto(c.nombre).includes('efectivo'));
    const contado = this.condicionesPago.find(c => c.esContado || c.esPredeterminado);
    return efectivo?.id ?? contado?.id ?? this.condicionesPago[0]?.id ?? null;
  }

  private defaultListaPreciosId(): number | null {
    const minoristaPorTipo = this.listasPrecios.find(l => this.normalizarTexto(l.tipoLista) === 'minorista');
    const minoristaPorNombre = this.listasPrecios.find(l => this.normalizarTexto(l.nombre).includes('minorista'));
    const minoristaPorCodigo = this.listasPrecios.find(l => this.normalizarTexto(l.codigo).includes('minorista'));
    return minoristaPorTipo?.id ?? minoristaPorNombre?.id ?? minoristaPorCodigo?.id ?? null;
  }

  private normalizarTexto(value: string): string {
    return (value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  formatMoneda(v: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);
  }
}
