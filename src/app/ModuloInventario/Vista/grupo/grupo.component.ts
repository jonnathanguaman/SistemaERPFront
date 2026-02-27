import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GrupoService } from '../../Service/grupo.service';
import { GrupoResponse, GrupoRequest } from '../../Entidad/grupo.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-grupo',
  standalone: false,
  templateUrl: './grupo.component.html',
  styleUrl: './grupo.component.css'
})
export class GrupoComponent implements OnInit {
  grupos: GrupoResponse[] = [];
  grupoForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingGrupoId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly grupoService: GrupoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.grupoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.cargarGrupos();
  }

  /**
   * Obtiene la lista filtrada de grupos según el término de búsqueda
   */
  get gruposFiltrados(): GrupoResponse[] {
    if (!this.searchTerm.trim()) {
      return this.grupos;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.grupos.filter(grupo =>
      grupo.nombre.toLowerCase().includes(termino) ||
      grupo.codigo.toLowerCase().includes(termino) ||
      grupo.id.toString().includes(termino)
    );
  }

  /**
   * Carga todos los grupos desde el backend
   */
  cargarGrupos(): void {
    this.loading = true;
    this.grupoService.findAll().subscribe({
      next: (data) => {
        this.grupos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar grupos:', error);
        this.notificationService.error(error.message, 'Error al cargar grupos');
        this.loading = false;
      }
    });
  }

  /**
   * Abre el modal para crear un nuevo grupo
   */
  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingGrupoId = null;
    this.grupoForm.reset();
    this.showModal = true;
  }

  /**
   * Abre el modal para editar un grupo existente
   */
  abrirModalEditar(grupo: GrupoResponse): void {
    this.isEditing = true;
    this.editingGrupoId = grupo.id;
    this.grupoForm.patchValue({
      nombre: grupo.nombre,
      codigo: grupo.codigo
    });
    this.showModal = true;
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  cerrarModal(): void {
    this.showModal = false;
    this.grupoForm.reset();
    this.isEditing = false;
    this.editingGrupoId = null;
  }

  /**
   * Guarda un grupo (crear o actualizar)
   */
  guardarGrupo(): void {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const grupoData: GrupoRequest = {
      nombre: this.grupoForm.value.nombre,
      codigo: this.grupoForm.value.codigo
    };

    if (this.isEditing && this.editingGrupoId !== null) {
      // Actualizar grupo existente
      this.grupoService.update(this.editingGrupoId, grupoData).subscribe({
        next: (response) => {
          this.notificationService.success('Grupo actualizado exitosamente');
          this.cargarGrupos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar grupo:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      // Crear nuevo grupo
      this.grupoService.save(grupoData).subscribe({
        next: (response) => {
          this.notificationService.success('Grupo creado exitosamente');
          this.cargarGrupos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear grupo:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  /**
   * Elimina un grupo
   */
  async eliminarGrupo(grupo: GrupoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(grupo.nombre);
    
    if (!confirmed) {
      return;
    }

    this.grupoService.delete(grupo.id).subscribe({
      next: () => {
        this.notificationService.toast('Grupo eliminado exitosamente', 'success');
        this.cargarGrupos();
      },
      error: (error) => {
        console.error('Error al eliminar grupo:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  /**
   * Verifica si un campo del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.grupoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.grupoForm.get(fieldName);
    
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
