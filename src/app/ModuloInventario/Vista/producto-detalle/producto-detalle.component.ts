import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { KardexCapaFifoResponse, KardexRegistroResponse } from '../../Entidad/kardex.model';
import { ProductoConfiguracionContableResponse } from '../../Entidad/producto-configuracion-contable.model';
import { ProductoExistenciasResponse } from '../../Entidad/producto-existencias.model';
import { ProductoResponse } from '../../Entidad/producto.model';
import { KardexService } from '../../Service/kardex.service';
import { ProductoConfiguracionContableService } from '../../Service/producto-configuracion-contable.service';
import { ProductoExistenciasService } from '../../Service/producto-existencias.service';
import { ProductoService } from '../../Service/producto.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent implements OnInit {
  productoId: number | null = null;
  producto: ProductoResponse | null = null;
  bodegas: BodegaResponse[] = [];
  bodegaSeleccionadaId: number | null = null;
  configuracionContable: ProductoConfiguracionContableResponse | null = null;
  existencias: ProductoExistenciasResponse[] = [];

  registrosKardex: KardexRegistroResponse[] = [];
  capasFifo: KardexCapaFifoResponse[] = [];
  costoActual: number | null = null;

  loadingGeneral = false;
  loadingKardex = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productoService: ProductoService,
    private readonly bodegaService: BodegaService,
    private readonly productoExistenciasService: ProductoExistenciasService,
    private readonly productoConfiguracionContableService: ProductoConfiguracionContableService,
    private readonly kardexService: KardexService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(idParam);

    if (!idParam || Number.isNaN(parsedId) || parsedId <= 0) {
      this.notificationService.error('El identificador del producto no es válido', 'Producto inválido');
      this.router.navigate(['/productos']);
      return;
    }

    this.productoId = parsedId;
    this.cargarDetalle();
  }

  cargarDetalle(): void {
    if (!this.productoId) {
      return;
    }

    this.loadingGeneral = true;

    forkJoin({
      producto: this.productoService.findById(this.productoId),
      bodegas: this.bodegaService.findAll(),
      existencias: this.productoExistenciasService.findAll(),
      configuraciones: this.productoConfiguracionContableService.findAll()
    }).subscribe({
      next: ({ producto, bodegas, existencias, configuraciones }) => {
        this.producto = producto;

        const bodegasActivas = bodegas.filter(bodega => bodega.activo);
        this.bodegas = bodegasActivas.length > 0 ? bodegasActivas : bodegas;
        this.bodegaSeleccionadaId = this.bodegas.length > 0 ? this.bodegas[0].id : null;

        this.existencias = existencias.filter(item => item.productoId === this.productoId);

        this.configuracionContable =
          configuraciones.find(item => item.productoId === this.productoId && item.activo) ??
          configuraciones.find(item => item.productoId === this.productoId) ??
          null;

        if (this.bodegaSeleccionadaId) {
          this.cargarKardex();
        }

        this.loadingGeneral = false;
      },
      error: (error) => {
        this.loadingGeneral = false;
        this.notificationService.error(error.message, 'Error al cargar detalle de producto');
        this.router.navigate(['/productos']);
      }
    });
  }

  cargarKardex(): void {
    if (!this.productoId || !this.bodegaSeleccionadaId) {
      this.registrosKardex = [];
      this.capasFifo = [];
      this.costoActual = null;
      return;
    }

    this.loadingKardex = true;

    forkJoin({
      registros: this.kardexService.consultarKardex(this.productoId, this.bodegaSeleccionadaId),
      capasFifo: this.kardexService.obtenerCapasFifo(this.productoId, this.bodegaSeleccionadaId),
      costoActual: this.kardexService.obtenerCostoActual(this.productoId, this.bodegaSeleccionadaId)
    }).subscribe({
      next: ({ registros, capasFifo, costoActual }) => {
        this.registrosKardex = registros;
        this.capasFifo = capasFifo;
        this.costoActual = costoActual;
        this.loadingKardex = false;
      },
      error: (error) => {
        this.loadingKardex = false;
        this.registrosKardex = [];
        this.capasFifo = [];
        this.costoActual = null;
        this.notificationService.error(error.message, 'Error al cargar kardex del producto');
      }
    });
  }

  onBodegaChange(): void {
    this.cargarKardex();
  }

  volver(): void {
    this.router.navigate(['/productos']);
  }

  get bodegaSeleccionada(): BodegaResponse | null {
    return this.bodegas.find(bodega => bodega.id === this.bodegaSeleccionadaId) ?? null;
  }

  get totalEntradas(): number {
    return this.registrosKardex.reduce((total, item) => total + (item.entradaCantidad ?? 0), 0);
  }

  get totalSalidas(): number {
    return this.registrosKardex.reduce((total, item) => total + (item.salidaCantidad ?? 0), 0);
  }

  get saldoActual(): number {
    if (this.registrosKardex.length === 0) {
      return 0;
    }

    return this.registrosKardex.at(-1)?.saldoCantidad ?? 0;
  }

  get valorSaldoActual(): number {
    if (this.registrosKardex.length === 0) {
      return 0;
    }

    return this.registrosKardex.at(-1)?.saldoValorTotal ?? 0;
  }

  getTemperaturaLabel(temp: string): string {
    const labels: { [key: string]: string } = {
      AMBIENTE: 'Ambiente',
      REFRIGERADO: 'Refrigerado',
      CONGELADO: 'Congelado'
    };

    return labels[temp] || temp;
  }
}
