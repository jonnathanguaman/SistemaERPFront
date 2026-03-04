import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetalleDespachoService } from '../../Service/detalle-despacho.service';
import { DetalleDespachoResponse, DetalleDespachoRequest } from '../../Entidad/detalle-despacho.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-detalle-despacho',
  standalone: false,
  templateUrl: './detalle-despacho.component.html',
  styleUrl: './detalle-despacho.component.css'
})
export class DetalleDespachoComponent implements OnInit {
  detalles: DetalleDespachoResponse[] = [];
  detallesFiltrados: DetalleDespachoResponse[] = [];
  detalleForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingDetalleId: number | null = null;
  loading: boolean = false;
  busqueda: string = '';

  constructor(
    private readonly detalleService: DetalleDespachoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.detalleForm = this.formBuilder.group({
      despachoId: [null, Validators.required],
      detalleOrdenVentaId: [null, Validators.required],
      productoId: [null, Validators.required],
      loteId: [null],
      cantidadOrdenada: [0, [Validators.required, Validators.min(0.01)]],
      cantidadDespachada: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    // Este componente se usa principalmente desde el modal de despacho
  }

  cargarDetallesPorDespacho(despachoId: number): void {
    this.loading = true;
    this.detalleService.findByDespacho(despachoId).subscribe({
      next: (data) => {
        this.detalles = data;
        this.detallesFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        this.notificationService.error(error.message, 'Error al cargar detalles');
        this.loading = false;
      }
    });
  }

  filtrarDetalles(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.detallesFiltrados = this.detalles.filter(detalle =>
      detalle.despachoNumero?.toLowerCase().includes(busquedaLower) ||
      detalle.id.toString().includes(busquedaLower) ||
      detalle.productoId.toString().includes(busquedaLower)
    );
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingDetalleId = null;
    this.detalleForm.reset({
      cantidadOrdenada: 0,
      cantidadDespachada: 0
    });
    this.showModal = true;
  }

  abrirModalEditar(detalle: DetalleDespachoResponse): void {
    this.isEditing = true;
    this.editingDetalleId = detalle.id;
    this.detalleForm.patchValue({
      despachoId: detalle.despachoId,
      detalleOrdenVentaId: detalle.detalleOrdenVentaId,
      productoId: detalle.productoId,
      loteId: detalle.loteId,
      cantidadOrdenada: detalle.cantidadOrdenada,
      cantidadDespachada: detalle.cantidadDespachada,
      observaciones: detalle.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.detalleForm.reset();
    this.isEditing = false;
    this.editingDetalleId = null;
  }

  guardarDetalle(): void {
    if (this.detalleForm.invalid) {
      this.detalleForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const detalleData: DetalleDespachoRequest = this.detalleForm.value;

    if (this.isEditing && this.editingDetalleId !== null) {
      this.detalleService.update(this.editingDetalleId, detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle actualizado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar detalle:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.detalleService.save(detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle creado exitosamente');
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear detalle:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarDetalle(detalle: DetalleDespachoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(`Detalle #${detalle.id}`);
    if (!confirmed) return;

    this.detalleService.delete(detalle.id).subscribe({
      next: () => {
        this.notificationService.toast('Detalle eliminado exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error al eliminar detalle:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.detalleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.detalleForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor';
    }
    return '';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('es-EC');
  }
}

