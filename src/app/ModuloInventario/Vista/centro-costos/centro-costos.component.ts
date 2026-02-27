import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentroCostosService } from '../../Service/centro-costos.service';
import { CentroCostosResponse, CentroCostosRequest } from '../../Entidad/centro-costos.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-centro-costos',
  standalone: false,
  templateUrl: './centro-costos.component.html',
  styleUrl: './centro-costos.component.css'
})
export class CentroCostosComponent implements OnInit {
  centrosCostos: CentroCostosResponse[] = [];
  centroCostosForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingCentroCostosId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly centroCostosService: CentroCostosService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.centroCostosForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.cargarCentrosCostos();
  }

  get centrosCostosFiltrados(): CentroCostosResponse[] {
    if (!this.searchTerm.trim()) {
      return this.centrosCostos;
    }
    const termino = this.searchTerm.toLowerCase();
    return this.centrosCostos.filter(centro =>
      centro.nombre.toLowerCase().includes(termino) ||
      centro.descripcion.toLowerCase().includes(termino) ||
      centro.id.toString().includes(termino)
    );
  }

  cargarCentrosCostos(): void {
    this.loading = true;
    this.centroCostosService.findAll().subscribe({
      next: (data) => {
        this.centrosCostos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar centros de costos:', error);
        this.notificationService.error(error.message, 'Error al cargar centros de costos');
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingCentroCostosId = null;
    this.centroCostosForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(centroCostos: CentroCostosResponse): void {
    this.isEditing = true;
    this.editingCentroCostosId = centroCostos.id;
    this.centroCostosForm.patchValue({
      nombre: centroCostos.nombre,
      descripcion: centroCostos.descripcion
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.centroCostosForm.reset();
    this.isEditing = false;
    this.editingCentroCostosId = null;
  }

  guardarCentroCostos(): void {
    if (this.centroCostosForm.invalid) {
      this.centroCostosForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const centroCostosData: CentroCostosRequest = {
      nombre: this.centroCostosForm.value.nombre,
      descripcion: this.centroCostosForm.value.descripcion
    };

    if (this.isEditing && this.editingCentroCostosId !== null) {
      this.centroCostosService.update(this.editingCentroCostosId, centroCostosData).subscribe({
        next: (response) => {
          this.notificationService.success('Centro de costos actualizado exitosamente');
          this.cargarCentrosCostos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar centro de costos:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.centroCostosService.save(centroCostosData).subscribe({
        next: (response) => {
          this.notificationService.success('Centro de costos creado exitosamente');
          this.cargarCentrosCostos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear centro de costos:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarCentroCostos(centroCostos: CentroCostosResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(centroCostos.nombre);
    if (!confirmed) {
      return;
    }
    this.centroCostosService.delete(centroCostos.id).subscribe({
      next: () => {
        this.notificationService.toast('Centro de costos eliminado exitosamente', 'success');
        this.cargarCentrosCostos();
      },
      error: (error) => {
        console.error('Error al eliminar centro de costos:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.centroCostosForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.centroCostosForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    return '';
  }
}
