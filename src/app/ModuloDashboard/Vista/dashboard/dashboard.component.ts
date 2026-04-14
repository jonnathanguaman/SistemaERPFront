import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../Compartido/services/auth.service';
import { ClienteService } from '../../../ModuloVentas/Service/cliente.service';
import { OrdenVentaService } from '../../../ModuloVentas/Service/orden-venta.service';
import { FacturaService } from '../../../ModuloVentas/Service/factura.service';
import { CuentaPorCobrarService } from '../../../ModuloVentas/Service/cuenta-por-cobrar.service';
import { OrdenCompraService } from '../../../ModuloCompras/Service/orden-compra.service';

import { ClienteResponse } from '../../../ModuloVentas/Entidad/cliente.model';
import { OrdenVentaResponse } from '../../../ModuloVentas/Entidad/orden-venta.model';
import { FacturaResponse } from '../../../ModuloVentas/Entidad/factura.model';
import { CuentaPorCobrarResponse } from '../../../ModuloVentas/Entidad/cuenta-por-cobrar.model';
import { OrdenCompraResponse } from '../../../ModuloCompras/Entidades/orden-compra.model';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  loading = true;
  userName = '';

  // ── Datos crudos ──────────────────────────────────────────────────────────
  clientes: ClienteResponse[] = [];
  ordenesVenta: OrdenVentaResponse[] = [];
  facturas: FacturaResponse[] = [];
  cuentasPorCobrar: CuentaPorCobrarResponse[] = [];
  ordenesCompra: OrdenCompraResponse[] = [];

  // ── KPIs Clientes ─────────────────────────────────────────────────────────
  totalClientes = 0;
  clientesActivos = 0;
  clientesMorosos = 0;
  clientesBloqueados = 0;

  // ── KPIs Órdenes de Venta ─────────────────────────────────────────────────
  ovBorrador = 0;
  ovConfirmada = 0;
  ovEnPreparacion = 0;
  ovDespachada = 0;
  ovEntregada = 0;
  ovFacturada = 0;
  ovCancelada = 0;
  totalOvActivas = 0;
  montoOvActivas = 0;

  // ── KPIs Facturas ─────────────────────────────────────────────────────────
  facturasEmitidas = 0;
  facturasPagadaParcial = 0;
  facturasPagadas = 0;
  facturasVencidas = 0;
  montoFacturadoTotal = 0;
  montoFacturasPendiente = 0;

  // ── KPIs Cuentas por Cobrar ───────────────────────────────────────────────
  cxcPendientes = 0;
  cxcPagadaParcial = 0;
  cxcVencidas = 0;
  montoCxcPendiente = 0;
  montoCxcVencido = 0;
  cxcVencidasTop: CuentaPorCobrarResponse[] = [];

  // ── KPIs Órdenes de Compra ────────────────────────────────────────────────
  ocBorrador = 0;
  ocAprobada = 0;
  ocEnviada = 0;
  ocConfirmada = 0;
  ocRecibida = 0;
  ocCancelada = 0;
  totalOcActivas = 0;
  montoOcActivas = 0;

  // ── Actividad reciente ────────────────────────────────────────────────────
  ultimasOV: OrdenVentaResponse[] = [];
  ultimasOC: OrdenCompraResponse[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly clienteService: ClienteService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly facturaService: FacturaService,
    private readonly cuentaPorCobrarService: CuentaPorCobrarService,
    private readonly ordenCompraService: OrdenCompraService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.userName || 'Usuario';
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;

    forkJoin({
      clientes: this.clienteService.findAll(),
      ordenesVenta: this.ordenVentaService.findAll(),
      facturas: this.facturaService.obtenerTodos(),
      cxc: this.cuentaPorCobrarService.findAll(),
      ordenesCompra: this.ordenCompraService.findAll()
    }).subscribe({
      next: ({ clientes, ordenesVenta, facturas, cxc, ordenesCompra }) => {
        this.clientes = clientes;
        this.ordenesVenta = ordenesVenta;
        this.facturas = facturas;
        this.cuentasPorCobrar = cxc;
        this.ordenesCompra = ordenesCompra;
        this.calcularKpis();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private calcularKpis(): void {
    // Clientes
    this.totalClientes = this.clientes.length;
    this.clientesActivos = this.clientes.filter(c => c.estado === 'ACTIVO').length;
    this.clientesMorosos = this.clientes.filter(c => c.estado === 'MOROSO').length;
    this.clientesBloqueados = this.clientes.filter(c => c.estado === 'BLOQUEADO').length;

    // Órdenes de Venta
    this.ovBorrador = this.ordenesVenta.filter(o => o.estado === 'BORRADOR').length;
    this.ovConfirmada = this.ordenesVenta.filter(o => o.estado === 'CONFIRMADA').length;
    this.ovEnPreparacion = this.ordenesVenta.filter(o => o.estado === 'EN_PREPARACION').length;
    this.ovDespachada = this.ordenesVenta.filter(o => o.estado === 'DESPACHADA').length;
    this.ovEntregada = this.ordenesVenta.filter(o => o.estado === 'ENTREGADA').length;
    this.ovFacturada = this.ordenesVenta.filter(o => o.estado === 'FACTURADA').length;
    this.ovCancelada = this.ordenesVenta.filter(o => o.estado === 'CANCELADA').length;

    const estadosOvActivos = ['BORRADOR', 'CONFIRMADA', 'EN_PREPARACION', 'DESPACHADA', 'ENTREGADA'];
    const ovActivas = this.ordenesVenta.filter(o => estadosOvActivos.includes(o.estado));
    this.totalOvActivas = ovActivas.length;
    this.montoOvActivas = ovActivas.reduce((s, o) => s + (o.total || 0), 0);

    // Facturas
    this.facturasEmitidas = this.facturas.filter(f => f.estado === 'EMITIDA').length;
    this.facturasPagadaParcial = this.facturas.filter(f => f.estado === 'PAGADA_PARCIAL').length;
    this.facturasPagadas = this.facturas.filter(f => f.estado === 'PAGADA').length;
    this.facturasVencidas = this.facturas.filter(f => f.estado === 'VENCIDA').length;
    this.montoFacturadoTotal = this.facturas
      .filter(f => f.estado !== 'ANULADA')
      .reduce((s, f) => s + (f.total || 0), 0);
    this.montoFacturasPendiente = this.facturas
      .filter(f => ['EMITIDA', 'PAGADA_PARCIAL', 'VENCIDA'].includes(f.estado))
      .reduce((s, f) => s + (f.saldoPendiente || f.total || 0), 0);

    // Cuentas por Cobrar
    this.cxcPendientes = this.cuentasPorCobrar.filter(c => c.estado === 'PENDIENTE').length;
    this.cxcPagadaParcial = this.cuentasPorCobrar.filter(c => c.estado === 'PAGADA_PARCIAL').length;
    this.cxcVencidas = this.cuentasPorCobrar.filter(c => c.estado === 'VENCIDA').length;
    this.montoCxcPendiente = this.cuentasPorCobrar
      .filter(c => ['PENDIENTE', 'PAGADA_PARCIAL'].includes(c.estado))
      .reduce((s, c) => s + (c.montoPendiente || 0), 0);
    this.montoCxcVencido = this.cuentasPorCobrar
      .filter(c => c.estado === 'VENCIDA')
      .reduce((s, c) => s + (c.montoPendiente || 0), 0);
    this.cxcVencidasTop = this.cuentasPorCobrar
      .filter(c => c.estaVencida)
      .sort((a, b) => (b.diasVencidos ?? 0) - (a.diasVencidos ?? 0))
      .slice(0, 5);

    // Órdenes de Compra
    this.ocBorrador = this.ordenesCompra.filter(o => o.estado === 'BORRADOR').length;
    this.ocAprobada = this.ordenesCompra.filter(o => o.estado === 'APROBADA').length;
    this.ocEnviada = this.ordenesCompra.filter(o => o.estado === 'ENVIADA').length;
    this.ocConfirmada = this.ordenesCompra.filter(o => o.estado === 'CONFIRMADA').length;
    this.ocRecibida = this.ordenesCompra.filter(o => o.estado === 'RECIBIDA').length;
    this.ocCancelada = this.ordenesCompra.filter(o => o.estado === 'CANCELADA').length;

    const estadosOcActivos = ['BORRADOR', 'APROBADA', 'ENVIADA', 'CONFIRMADA'];
    const ocActivas = this.ordenesCompra.filter(o => estadosOcActivos.includes(o.estado));
    this.totalOcActivas = ocActivas.length;
    this.montoOcActivas = ocActivas.reduce((s, o) => s + (o.total || 0), 0);

    // Últimas 5 actividades
    this.ultimasOV = [...this.ordenesVenta]
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5);
    this.ultimasOC = [...this.ordenesCompra]
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5);
  }

  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  formatMoneda(valor: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor || 0);
  }

  get saludo(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
