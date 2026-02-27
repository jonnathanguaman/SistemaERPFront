import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MetodoValuacionService } from '../../Service/metodo-valuacion.service';
import { MetodoValuacionResponse, MetodoValuacionRequest } from '../../Entidad/metodo-valuacion.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-metodo-valuacion',
  standalone: false,
  templateUrl: './metodo-valuacion.component.html',
  styleUrl: './metodo-valuacion.component.css'
})
export class MetodoValuacionComponent implements OnInit {
  metodosValuacion: MetodoValuacionResponse[] = [];
  metodoValuacionForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingMetodoValuacionId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly metodoValuacionService: MetodoValuacionService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.metodoValuacionForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.cargarMetodosValuacion();
  }

  /**
   * Obtiene la lista filtrada de métodos de valuación según el término de búsqueda
   */
  get metodosValuacionFiltrados(): MetodoValuacionResponse[] {
    if (!this.searchTerm.trim()) {
      return this.metodosValuacion;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.metodosValuacion.filter(metodo =>
      metodo.nombre.toLowerCase().includes(termino) ||
      metodo.descripcion?.toLowerCase().includes(termino) ||
      metodo.id.toString().includes(termino)
    );
  }

  /**
   * Carga todos los métodos de valuación desde el backend
   */
  cargarMetodosValuacion(): void {
    this.loading = true;
    this.metodoValuacionService.findAll().subscribe({
      next: (data) => {
        this.metodosValuacion = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar métodos de valuación:', error);
        this.notificationService.error(error.message, 'Error al cargar métodos de valuación');
        this.loading = false;
      }
    });
  }

  /**
   * Abre el modal para crear un nuevo método de valuación
   */
  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingMetodoValuacionId = null;
    this.metodoValuacionForm.reset();
    this.showModal = true;
  }

  /**
   * Abre el modal para editar un método de valuación existente
   */
  abrirModalEditar(metodoValuacion: MetodoValuacionResponse): void {
    this.isEditing = true;
    this.editingMetodoValuacionId = metodoValuacion.id;
    this.metodoValuacionForm.patchValue({
      nombre: metodoValuacion.nombre,
      descripcion: metodoValuacion.descripcion
    });
    this.showModal = true;
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  cerrarModal(): void {
    this.showModal = false;
    this.metodoValuacionForm.reset();
    this.isEditing = false;
    this.editingMetodoValuacionId = null;
  }

  /**
   * Guarda un método de valuación (crear o actualizar)
   */
  guardarMetodoValuacion(): void {
    if (this.metodoValuacionForm.invalid) {
      this.metodoValuacionForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const metodoValuacionData: MetodoValuacionRequest = {
      nombre: this.metodoValuacionForm.value.nombre,
      descripcion: this.metodoValuacionForm.value.descripcion
    };

    if (this.isEditing && this.editingMetodoValuacionId !== null) {
      // Actualizar método de valuación existente
      this.metodoValuacionService.update(this.editingMetodoValuacionId, metodoValuacionData).subscribe({
        next: (response) => {
          this.notificationService.success('Método de valuación actualizado exitosamente');
          this.cargarMetodosValuacion();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar método de valuación:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      // Crear nuevo método de valuación
      this.metodoValuacionService.save(metodoValuacionData).subscribe({
        next: (response) => {
          this.notificationService.success('Método de valuación creado exitosamente');
          this.cargarMetodosValuacion();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear método de valuación:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  /**
   * Elimina un método de valuación
   */
  async eliminarMetodoValuacion(metodoValuacion: MetodoValuacionResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(metodoValuacion.nombre);
    
    if (!confirmed) {
      return;
    }

    this.metodoValuacionService.delete(metodoValuacion.id).subscribe({
      next: () => {
        this.notificationService.toast('Método de valuación eliminado exitosamente', 'success');
        this.cargarMetodosValuacion();
      },
      error: (error) => {
        console.error('Error al eliminar método de valuación:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  /**
   * Verifica si un campo del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.metodoValuacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.metodoValuacionForm.get(fieldName);
    
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
