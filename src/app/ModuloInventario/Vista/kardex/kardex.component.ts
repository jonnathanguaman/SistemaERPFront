import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductoService } from '../../Service/producto.service';
import { KardexService } from '../../Service/kardex.service';
import { ProductoResponse } from '../../Entidad/producto.model';
import { KardexCapaFifoResponse, KardexFiltro, KardexRegistroResponse } from '../../Entidad/kardex.model';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kardex.component.html',
  styleUrl: './kardex.component.css'
})
export class KardexComponent implements OnInit {
  productos: ProductoResponse[] = [];
  bodegas: BodegaResponse[] = [];
  registros: KardexRegistroResponse[] = [];
  capasFifo: KardexCapaFifoResponse[] = [];
  costoActual: number | null = null;
  loading = false;
  filtro: KardexFiltro = {
    productoId: null,
    bodegaId: null,
    desde: '',
    hasta: ''
  };

  constructor(
    private readonly productoService: ProductoService,
    private readonly bodegaService: BodegaService,
    private readonly kardexService: KardexService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    forkJoin({
      productos: this.productoService.findAll(),
      bodegas: this.bodegaService.findAll()
    }).subscribe({
      next: ({ productos, bodegas }) => {
        this.productos = productos;
        this.bodegas = bodegas;
      },
      error: (error) => {
        console.error('Error al cargar catálogos de Kardex:', error);
        this.notificationService.error(error.message, 'Error al cargar filtros');
      }
    });
  }

  consultar(): void {
    if (!this.filtro.productoId || !this.filtro.bodegaId) {
      this.notificationService.warning('Selecciona un producto y una bodega antes de consultar.');
      return;
    }

    this.loading = true;

    forkJoin({
      registros: this.kardexService.consultarKardex(
        this.filtro.productoId,
        this.filtro.bodegaId,
        this.normalizarFecha(this.filtro.desde),
        this.normalizarFecha(this.filtro.hasta)
      ),
      capasFifo: this.kardexService.obtenerCapasFifo(this.filtro.productoId, this.filtro.bodegaId),
      costoActual: this.kardexService.obtenerCostoActual(this.filtro.productoId, this.filtro.bodegaId)
    }).subscribe({
      next: ({ registros, capasFifo, costoActual }) => {
        this.registros = registros;
        this.capasFifo = capasFifo;
        this.costoActual = costoActual;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al consultar kardex:', error);
        this.registros = [];
        this.capasFifo = [];
        this.costoActual = null;
        this.loading = false;
        this.notificationService.error(error.message, 'Error al consultar kardex');
      }
    });
  }

  limpiarFiltros(): void {
    this.filtro = {
      productoId: null,
      bodegaId: null,
      desde: '',
      hasta: ''
    };
    this.registros = [];
    this.capasFifo = [];
    this.costoActual = null;
  }

  get totalEntradas(): number {
    return this.registros.reduce((total, item) => total + (item.entradaCantidad ?? 0), 0);
  }

  get totalSalidas(): number {
    return this.registros.reduce((total, item) => total + (item.salidaCantidad ?? 0), 0);
  }

  get saldoActual(): number {
    if (this.registros.length === 0) {
      return 0;
    }

    return this.registros.at(-1)?.saldoCantidad ?? 0;
  }

  get valorSaldoActual(): number {
    if (this.registros.length === 0) {
      return 0;
    }

    return this.registros.at(-1)?.saldoValorTotal ?? 0;
  }

  get productoSeleccionado(): ProductoResponse | null {
    return this.productos.find(producto => producto.id === this.filtro.productoId) ?? null;
  }

  get bodegaSeleccionada(): BodegaResponse | null {
    return this.bodegas.find(bodega => bodega.id === this.filtro.bodegaId) ?? null;
  }

  private normalizarFecha(valor: string): string | undefined {
    return valor || undefined;
  }
}