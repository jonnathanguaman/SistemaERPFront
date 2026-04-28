import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ProductoService } from '../../Service/producto.service';
import { ProductoExistenciasService } from '../../Service/producto-existencias.service';
import { MovimientoInventarioService } from '../../Service/movimiento-inventario.service';
import { SolicitudTransferenciaService } from '../../Service/solicitud-transferencia.service';

import { ProductoResponse } from '../../Entidad/producto.model';
import { ProductoExistenciasResponse } from '../../Entidad/producto-existencias.model';
import { MovimientoInventarioResponse } from '../../Entidad/movimiento-inventario.model';
import { SolicitudTransferenciaResponse } from '../../Entidad/solicitud-transferencia.model';

@Component({
  selector: 'app-dashboard-inventario',
  standalone: false,
  templateUrl: './dashboard-inventario.component.html',
  styleUrl: './dashboard-inventario.component.css'
})
export class DashboardInventarioComponent implements OnInit {

  loading = true;

  productos: ProductoResponse[] = [];
  existencias: ProductoExistenciasResponse[] = [];
  movimientos: MovimientoInventarioResponse[] = [];
  solicitudes: SolicitudTransferenciaResponse[] = [];

  // KPIs Productos
  totalProductos = 0;
  productosActivos = 0;

  // KPIs Existencias
  totalExistencias = 0;
  existenciasSinStock = 0;
  valorTotalInventario = 0;

  // KPIs Movimientos
  movBorrador = 0;
  movConfirmado = 0;
  movContabilizado = 0;
  movAnulado = 0;

  // KPIs Solicitudes Transferencia
  solicBorrador = 0;
  solicEnviada = 0;
  solicAprobada = 0;
  solicCompletada = 0;
  solicRechazada = 0;

  // Recientes
  ultimosMovimientos: MovimientoInventarioResponse[] = [];

  constructor(
    private readonly productoService: ProductoService,
    private readonly existenciasService: ProductoExistenciasService,
    private readonly movimientoService: MovimientoInventarioService,
    private readonly solicitudService: SolicitudTransferenciaService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      productos: this.productoService.findAll(),
      existencias: this.existenciasService.findAll(),
      movimientos: this.movimientoService.findAll(),
      solicitudes: this.solicitudService.findAll()
    }).subscribe({
      next: ({ productos, existencias, movimientos, solicitudes }) => {
        this.productos = productos;
        this.existencias = existencias;
        this.movimientos = movimientos;
        this.solicitudes = solicitudes;
        this.calcularKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private calcularKpis(): void {
    // Productos
    this.totalProductos = this.productos.length;
    this.productosActivos = this.productos.filter(p => p.activo).length;

    // Existencias
    this.totalExistencias = this.existencias.length;
    this.existenciasSinStock = this.existencias.filter(e => e.cantidadDisponible <= 0).length;
    this.valorTotalInventario = this.existencias.reduce((s, e) => s + ((e.cantidadFisica || 0) * (e.costoPromedio || 0)), 0);

    // Movimientos
    this.movBorrador = this.movimientos.filter(m => m.estado === 'BORRADOR').length;
    this.movConfirmado = this.movimientos.filter(m => m.estado === 'CONFIRMADO').length;
    this.movContabilizado = this.movimientos.filter(m => m.estado === 'CONTABILIZADO').length;
    this.movAnulado = this.movimientos.filter(m => m.estado === 'ANULADO').length;

    // Solicitudes de Transferencia
    this.solicBorrador = this.solicitudes.filter(s => s.estado === 'BORRADOR').length;
    this.solicEnviada = this.solicitudes.filter(s => s.estado === 'ENVIADA').length;
    this.solicAprobada = this.solicitudes.filter(s => s.estado === 'APROBADA').length;
    this.solicCompletada = this.solicitudes.filter(s => s.estado === 'COMPLETADA').length;
    this.solicRechazada = this.solicitudes.filter(s => s.estado === 'RECHAZADA').length;

    // Recientes
    this.ultimosMovimientos = [...this.movimientos]
      .sort((a, b) => new Date(b.fechaMovimiento).getTime() - new Date(a.fechaMovimiento).getTime())
      .slice(0, 6);
  }

  irA(ruta: string): void { this.router.navigate([ruta]); }

  formatMoneda(valor: number): string {
    return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(valor || 0);
  }

  get solicitudesPendientes(): number {
    return this.solicBorrador + this.solicEnviada + this.solicAprobada;
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
