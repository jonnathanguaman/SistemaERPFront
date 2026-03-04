import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetalleOrdenVentaService } from '../../Service/detalle-orden-venta.service';
import { DetalleOrdenVentaResponse } from '../../Entidad/detalle-orden-venta.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-detalle-orden-venta',
  standalone: false,
  templateUrl: './detalle-orden-venta.component.html',
  styleUrl: './detalle-orden-venta.component.css'
})
export class DetalleOrdenVentaComponent implements OnInit {
  detalles: DetalleOrdenVentaResponse[] = [];
  loading: boolean = false;
  ordenVentaId: number | null = null;

  constructor(
    private readonly detalleOrdenVentaService: DetalleOrdenVentaService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.ordenVentaId = +params['id'];
        this.cargarDetalles();
      }
    });
  }

  cargarDetalles(): void {
    if (!this.ordenVentaId) {
      this.detalleOrdenVentaService.findAll().subscribe({
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
      return;
    }

    this.loading = true;
    this.detalleOrdenVentaService.findByOrdenVenta(this.ordenVentaId).subscribe({
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  calcularTotalGeneral(): number {
    return this.detalles.reduce((sum, detalle) => sum + detalle.total, 0);
  }
}
