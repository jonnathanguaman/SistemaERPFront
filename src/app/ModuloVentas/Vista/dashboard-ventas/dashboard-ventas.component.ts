import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../Compartido/services/auth.service';
import { ClienteService } from '../../Service/cliente.service';
import { CotizacionService } from '../../Service/cotizacion.service';
import { OrdenVentaService } from '../../Service/orden-venta.service';
import { FacturaService } from '../../Service/factura.service';
import { CuentaPorCobrarService } from '../../Service/cuenta-por-cobrar.service';

import { ClienteResponse } from '../../Entidad/cliente.model';
import { CotizacionResponse } from '../../Entidad/cotizacion.model';
import { OrdenVentaResponse } from '../../Entidad/orden-venta.model';
import { FacturaResponse } from '../../Entidad/factura.model';
import { CuentaPorCobrarResponse } from '../../Entidad/cuenta-por-cobrar.model';

@Component({
  selector: 'app-dashboard-ventas',
  standalone: false,
  templateUrl: './dashboard-ventas.component.html',
  styleUrl: './dashboard-ventas.component.css'
})
export class DashboardVentasComponent implements OnInit {

  loading = true;

  clientes: ClienteResponse[] = [];
  cotizaciones: CotizacionResponse[] = [];
  ordenesVenta: OrdenVentaResponse[] = [];
  facturas: FacturaResponse[] = [];
  cuentasPorCobrar: CuentaPorCobrarResponse[] = [];

  // KPIs Clientes
  clientesActivos = 0;
  clientesMorosos = 0;
  clientesBloqueados = 0;

  // KPIs Cotizaciones
  cotBorrador = 0;
  cotEnviada = 0;
  cotAprobada = 0;
  cotConvertida = 0;
  cotCancelada = 0;
  cotVencidas = 0;
  montoCotActivas = 0;

  // KPIs Órdenes de Venta
  ovBorrador = 0;
  ovConfirmada = 0;
  ovEnPreparacion = 0;
  ovDespachada = 0;
  ovEntregada = 0;
  ovFacturada = 0;
  ovCancelada = 0;
  totalOvActivas = 0;
  montoOvActivas = 0;

  // KPIs Facturas
  facturasEmitidas = 0;
  facturasPagadaParcial = 0;
  facturasPagadas = 0;
  facturasVencidas = 0;
  montoFacturadoTotal = 0;
  montoFacturasPendiente = 0;

  // KPIs CxC
  cxcPendientes = 0;
  cxcPagadaParcial = 0;
  cxcVencidas = 0;
  montoCxcPendiente = 0;
  montoCxcVencido = 0;
  cxcVencidasTop: CuentaPorCobrarResponse[] = [];

  // Actividad reciente
  ultimasCotizaciones: CotizacionResponse[] = [];
  ultimasOV: OrdenVentaResponse[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly clienteService: ClienteService,
    private readonly cotizacionService: CotizacionService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly facturaService: FacturaService,
    private readonly cuentaPorCobrarService: CuentaPorCobrarService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      clientes: this.clienteService.findAll(),
      cotizaciones: this.cotizacionService.findAll(),
      ordenesVenta: this.ordenVentaService.findAll(),
      facturas: this.facturaService.obtenerTodos(),
      cxc: this.cuentaPorCobrarService.findAll()
    }).subscribe({
      next: ({ clientes, cotizaciones, ordenesVenta, facturas, cxc }) => {
        this.clientes = clientes;
        this.cotizaciones = cotizaciones;
        this.ordenesVenta = ordenesVenta;
        this.facturas = facturas;
        this.cuentasPorCobrar = cxc;
        this.calcularKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private calcularKpis(): void {
    // Clientes
    this.clientesActivos = this.clientes.filter(c => c.estado === 'ACTIVO').length;
    this.clientesMorosos = this.clientes.filter(c => c.estado === 'MOROSO').length;
    this.clientesBloqueados = this.clientes.filter(c => c.estado === 'BLOQUEADO').length;

    // Cotizaciones
    this.cotBorrador = this.cotizaciones.filter(c => c.estado === 'BORRADOR').length;
    this.cotEnviada = this.cotizaciones.filter(c => c.estado === 'ENVIADA').length;
    this.cotAprobada = this.cotizaciones.filter(c => c.estado === 'APROBADA').length;
    this.cotConvertida = this.cotizaciones.filter(c => c.estado === 'CONVERTIDA').length;
    this.cotCancelada = this.cotizaciones.filter(c => c.estado === 'CANCELADA').length;
    this.cotVencidas = this.cotizaciones.filter(c => c.estaVencida).length;
    const cotActivas = this.cotizaciones.filter(c => ['BORRADOR', 'ENVIADA', 'APROBADA'].includes(c.estado));
    this.montoCotActivas = cotActivas.reduce((s, c) => s + (c.total || 0), 0);

    // Órdenes de Venta
    this.ovBorrador = this.ordenesVenta.filter(o => o.estado === 'BORRADOR').length;
    this.ovConfirmada = this.ordenesVenta.filter(o => o.estado === 'CONFIRMADA').length;
    this.ovEnPreparacion = this.ordenesVenta.filter(o => o.estado === 'EN_PREPARACION').length;
    this.ovDespachada = this.ordenesVenta.filter(o => o.estado === 'DESPACHADA').length;
    this.ovEntregada = this.ordenesVenta.filter(o => o.estado === 'ENTREGADA').length;
    this.ovFacturada = this.ordenesVenta.filter(o => o.estado === 'FACTURADA').length;
    this.ovCancelada = this.ordenesVenta.filter(o => o.estado === 'CANCELADA').length;
    const ovActivas = this.ordenesVenta.filter(o => ['BORRADOR', 'CONFIRMADA', 'EN_PREPARACION', 'DESPACHADA', 'ENTREGADA'].includes(o.estado));
    this.totalOvActivas = ovActivas.length;
    this.montoOvActivas = ovActivas.reduce((s, o) => s + (o.total || 0), 0);

    // Facturas
    this.facturasEmitidas = this.facturas.filter(f => f.estado === 'EMITIDA').length;
    this.facturasPagadaParcial = this.facturas.filter(f => f.estado === 'PAGADA_PARCIAL').length;
    this.facturasPagadas = this.facturas.filter(f => f.estado === 'PAGADA').length;
    this.facturasVencidas = this.facturas.filter(f => f.estado === 'VENCIDA').length;
    this.montoFacturadoTotal = this.facturas.filter(f => f.estado !== 'ANULADA').reduce((s, f) => s + (f.total || 0), 0);
    this.montoFacturasPendiente = this.facturas.filter(f => ['EMITIDA', 'PAGADA_PARCIAL', 'VENCIDA'].includes(f.estado)).reduce((s, f) => s + (f.saldoPendiente || f.total || 0), 0);

    // CxC
    this.cxcPendientes = this.cuentasPorCobrar.filter(c => c.estado === 'PENDIENTE').length;
    this.cxcPagadaParcial = this.cuentasPorCobrar.filter(c => c.estado === 'PARCIAL').length;
    this.cxcVencidas = this.cuentasPorCobrar.filter(c => c.estado === 'VENCIDA').length;
    this.montoCxcPendiente = this.cuentasPorCobrar.filter(c => ['PENDIENTE', 'PARCIAL'].includes(c.estado)).reduce((s, c) => s + (c.montoPendiente || 0), 0);
    this.montoCxcVencido = this.cuentasPorCobrar.filter(c => c.estado === 'VENCIDA').reduce((s, c) => s + (c.montoPendiente || 0), 0);
    this.cxcVencidasTop = this.cuentasPorCobrar.filter(c => c.estaVencida).sort((a, b) => (b.diasVencidos ?? 0) - (a.diasVencidos ?? 0)).slice(0, 5);

    // Recientes
    this.ultimasCotizaciones = [...this.cotizaciones].sort((a, b) => new Date(b.fechaCreacion ?? 0).getTime() - new Date(a.fechaCreacion ?? 0).getTime()).slice(0, 5);
    this.ultimasOV = [...this.ordenesVenta].sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()).slice(0, 5);
  }

  irA(ruta: string): void { this.router.navigate([ruta]); }

  formatMoneda(valor: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(valor || 0);
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
