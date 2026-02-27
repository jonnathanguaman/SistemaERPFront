import { Component, OnInit } from '@angular/core';
import { DetalleMovimientoInventarioService } from '../../Service/detalle-movimiento-inventario.service';
import { DetalleMovimientoInventarioResponse } from '../../Entidad/detalle-movimiento-inventario.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-detalle-movimineto',
  standalone: false,
  templateUrl: './detalle-movimineto.component.html',
  styleUrl: './detalle-movimineto.component.css'
})
export class DetalleMoviminetoComponent implements OnInit {
  detalles: DetalleMovimientoInventarioResponse[] = [];
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly detalleService: DetalleMovimientoInventarioService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Los detalles se visualizan desde el módulo de movimientos de inventario
  }

  get detallesFiltrados(): DetalleMovimientoInventarioResponse[] {
    if (!this.searchTerm.trim()) {
      return this.detalles;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.detalles.filter(detalle =>
      detalle.productoNombre.toLowerCase().includes(termino) ||
      detalle.loteNumero?.toLowerCase().includes(termino) ||
      detalle.id.toString().includes(termino)
    );
  }

  cargarDetalles(): void {
    this.loading = true;
    this.detalleService.findAll().subscribe({
      next: (data) => {
        this.detalles = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        this.notificationService.error(error.message, 'Error al cargar detalles');
        this.loading = false;
      }
    });
  }
}

