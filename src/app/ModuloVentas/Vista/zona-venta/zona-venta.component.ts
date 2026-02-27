import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ZonaVentaRequest, ZonaVentaResponse } from '../../Entidad/zona-venta.model';
import { ZonaVentaService } from '../../Service/zona-venta.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-zona-venta',
  standalone: false,
  templateUrl: './zona-venta.component.html',
  styleUrl: './zona-venta.component.css'
})
export class ZonaVentaComponent implements OnInit {
  zonasVenta: ZonaVentaResponse[] = [];
  zonasVentaFiltradas: ZonaVentaResponse[] = [];
  zonaVentaForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  zonaVentaIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private readonly zonaVentaService: ZonaVentaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.zonaVentaForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.zonaVentaService.findAll().subscribe({
      next: (data) => {
        this.zonasVenta = data;
        this.zonasVentaFiltradas = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar las zonas de venta');
      }
    });
  }

  filtrarZonasVenta(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.zonasVentaFiltradas = this.zonasVenta.filter(zona =>
      zona.codigo.toLowerCase().includes(busquedaLower) ||
      zona.nombre.toLowerCase().includes(busquedaLower) ||
      zona.descripcion?.toLowerCase().includes(busquedaLower)
    );
  }

  abrirModal(zonaVenta?: ZonaVentaResponse): void {
    if (zonaVenta) {
      this.modoEdicion = true;
      this.zonaVentaIdEditar = zonaVenta.id;
      this.zonaVentaForm.patchValue({
        codigo: zonaVenta.codigo,
        nombre: zonaVenta.nombre,
        descripcion: zonaVenta.descripcion,
        activo: zonaVenta.activo
      });
    } else {
      this.modoEdicion = false;
      this.zonaVentaIdEditar = null;
      this.zonaVentaForm.reset({ activo: true });
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.zonaVentaForm.reset({ activo: true });
    this.modoEdicion = false;
    this.zonaVentaIdEditar = null;
  }

  async guardarZonaVenta(): Promise<void> {
    if (this.zonaVentaForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const zonaVenta: ZonaVentaRequest = this.zonaVentaForm.value;

    try {
      if (this.modoEdicion && this.zonaVentaIdEditar) {
        await lastValueFrom(this.zonaVentaService.update(this.zonaVentaIdEditar, zonaVenta));
        this.notificationService.showSuccess('Zona de venta actualizada correctamente');
      } else {
        await lastValueFrom(this.zonaVentaService.save(zonaVenta));
        this.notificationService.showSuccess('Zona de venta creada correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar la zona de venta:', error);
      this.notificationService.showError('Error al guardar la zona de venta');
    }
  }

  async eliminarZonaVenta(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar esta zona de venta?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await lastValueFrom(this.zonaVentaService.deleteById(id));
        this.notificationService.showSuccess('Zona de venta eliminada correctamente');
        this.cargarDatos();
      } catch (error) {
        console.error('Error al eliminar la zona de venta:', error);
        this.notificationService.showError('Error al eliminar la zona de venta');
      }
    }
  }
}
