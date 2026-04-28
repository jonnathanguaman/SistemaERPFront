import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ProveedorService } from '../../Service/proveedor.service';
import { OrdenCompraService } from '../../Service/orden-compra.service';
import { RecepcionInventarioService } from '../../Service/recepcion-inventario.service';

import { ProveedorResponse } from '../../Entidades/proveedor.model';
import { OrdenCompraResponse } from '../../Entidades/orden-compra.model';
import { RecepcionInventarioResponse } from '../../Entidades/recepcion-inventario.model';

@Component({
  selector: 'app-dashboard-compras',
  standalone: false,
  templateUrl: './dashboard-compras.component.html',
  styleUrl: './dashboard-compras.component.css'
})
export class DashboardComprasComponent implements OnInit {

  loading = true;

  proveedores: ProveedorResponse[] = [];
  ordenesCompra: OrdenCompraResponse[] = [];
  recepciones: RecepcionInventarioResponse[] = [];

  // KPIs Proveedores
  proveedoresActivos = 0;
  proveedoresInactivos = 0;
  proveedoresBloqueados = 0;

  // KPIs Órdenes de Compra
  ocBorrador = 0;
  ocAprobada = 0;
  ocEnviada = 0;
  ocConfirmada = 0;
  ocRecibida = 0;
  ocCancelada = 0;
  totalOcActivas = 0;
  montoOcActivas = 0;
  montoOcRecibida = 0;

  // KPIs Recepciones
  recepcionesPendiente = 0;
  recepcionesConfirmada = 0;
  recepcionesCancelada = 0;

  // Recientes
  ultimasOC: OrdenCompraResponse[] = [];

  constructor(
    private readonly proveedorService: ProveedorService,
    private readonly ordenCompraService: OrdenCompraService,
    private readonly recepcionService: RecepcionInventarioService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      proveedores: this.proveedorService.findAll(),
      ordenesCompra: this.ordenCompraService.findAll(),
      recepciones: this.recepcionService.findAll()
    }).subscribe({
      next: ({ proveedores, ordenesCompra, recepciones }) => {
        this.proveedores = proveedores;
        this.ordenesCompra = ordenesCompra;
        this.recepciones = recepciones;
        this.calcularKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private calcularKpis(): void {
    // Proveedores
    this.proveedoresActivos = this.proveedores.filter(p => p.estado === 'ACTIVO').length;
    this.proveedoresInactivos = this.proveedores.filter(p => p.estado === 'INACTIVO').length;
    this.proveedoresBloqueados = this.proveedores.filter(p => p.estado === 'BLOQUEADO').length;

    // Órdenes de Compra
    this.ocBorrador = this.ordenesCompra.filter(o => o.estado === 'BORRADOR').length;
    this.ocAprobada = this.ordenesCompra.filter(o => o.estado === 'APROBADA').length;
    this.ocEnviada = this.ordenesCompra.filter(o => o.estado === 'ENVIADA').length;
    this.ocConfirmada = this.ordenesCompra.filter(o => o.estado === 'CONFIRMADA').length;
    this.ocRecibida = this.ordenesCompra.filter(o => o.estado === 'RECIBIDA').length;
    this.ocCancelada = this.ordenesCompra.filter(o => o.estado === 'CANCELADA').length;

    const ocActivas = this.ordenesCompra.filter(o => ['BORRADOR', 'APROBADA', 'ENVIADA', 'CONFIRMADA'].includes(o.estado));
    this.totalOcActivas = ocActivas.length;
    this.montoOcActivas = ocActivas.reduce((s, o) => s + (o.total || 0), 0);
    this.montoOcRecibida = this.ordenesCompra.filter(o => o.estado === 'RECIBIDA').reduce((s, o) => s + (o.total || 0), 0);

    // Recepciones
    this.recepcionesPendiente = this.recepciones.filter(r => r.estado === 'PENDIENTE').length;
    this.recepcionesConfirmada = this.recepciones.filter(r => r.estado === 'CONFIRMADA').length;
    this.recepcionesCancelada = this.recepciones.filter(r => r.estado === 'CANCELADA').length;

    // Recientes
    this.ultimasOC = [...this.ordenesCompra]
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 5);
  }

  irA(ruta: string): void { this.router.navigate([ruta]); }

  formatMoneda(valor: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(valor || 0);
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
