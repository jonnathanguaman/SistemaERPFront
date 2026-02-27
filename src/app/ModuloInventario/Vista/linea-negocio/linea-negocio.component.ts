import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LineaNegocioService } from '../../Service/linea-negocio.service';
import { LineaNegocioResponse, LineaNegocioRequest } from '../../Entidad/linea-negocio.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-linea-negocio',
  standalone: false,
  templateUrl: './linea-negocio.component.html',
  styleUrl: './linea-negocio.component.css'
})
export class LineaNegocioComponent implements OnInit {
  lineasNegocio: LineaNegocioResponse[] = [];
  lineaNegocioForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingLineaNegocioId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly lineaNegocioService: LineaNegocioService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.lineaNegocioForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.cargarLineasNegocio();
  }

  get lineasNegocioFiltradas(): LineaNegocioResponse[] {
    if (!this.searchTerm.trim()) {
      return this.lineasNegocio;
    }
    const termino = this.searchTerm.toLowerCase();
    return this.lineasNegocio.filter(linea =>
      linea.nombreLinea.toLowerCase().includes(termino) ||
      linea.codigoLinea.toLowerCase().includes(termino) ||
      linea.id.toString().includes(termino)
    );
  }

  cargarLineasNegocio(): void {
    this.loading = true;
    this.lineaNegocioService.findAll().subscribe({
      next: (data) => {
        this.lineasNegocio = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar líneas de negocio:', error);
        this.notificationService.error(error.message, 'Error al cargar líneas de negocio');
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingLineaNegocioId = null;
    this.lineaNegocioForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(lineaNegocio: LineaNegocioResponse): void {
    this.isEditing = true;
    this.editingLineaNegocioId = lineaNegocio.id;
    this.lineaNegocioForm.patchValue({
      nombre: lineaNegocio.nombreLinea,
      codigo: lineaNegocio.codigoLinea
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.lineaNegocioForm.reset();
    this.isEditing = false;
    this.editingLineaNegocioId = null;
  }

  guardarLineaNegocio(): void {
    if (this.lineaNegocioForm.invalid) {
      this.lineaNegocioForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const lineaNegocioData: LineaNegocioRequest = {
      nombre: this.lineaNegocioForm.value.nombre,
      codigo: this.lineaNegocioForm.value.codigo
    };

    if (this.isEditing && this.editingLineaNegocioId !== null) {
      this.lineaNegocioService.update(this.editingLineaNegocioId, lineaNegocioData).subscribe({
        next: (response) => {
          this.notificationService.success('Línea de negocio actualizada exitosamente');
          this.cargarLineasNegocio();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar línea de negocio:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.lineaNegocioService.save(lineaNegocioData).subscribe({
        next: (response) => {
          this.notificationService.success('Línea de negocio creada exitosamente');
          this.cargarLineasNegocio();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear línea de negocio:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarLineaNegocio(lineaNegocio: LineaNegocioResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(lineaNegocio.nombreLinea);
    if (!confirmed) {
      return;
    }
    this.lineaNegocioService.delete(lineaNegocio.id).subscribe({
      next: () => {
        this.notificationService.toast('Línea de negocio eliminada exitosamente', 'success');
        this.cargarLineasNegocio();
      },
      error: (error) => {
        console.error('Error al eliminar línea de negocio:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.lineaNegocioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.lineaNegocioForm.get(fieldName);
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
