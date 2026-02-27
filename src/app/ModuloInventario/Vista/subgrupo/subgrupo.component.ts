import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubgrupoService } from '../../Service/subgrupo.service';
import { GrupoService } from '../../Service/grupo.service';
import { SubgrupoResponse, SubgrupoRequest } from '../../Entidad/subgrupo.model';
import { GrupoResponse } from '../../Entidad/grupo.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-subgrupo',
  standalone: false,
  templateUrl: './subgrupo.component.html',
  styleUrl: './subgrupo.component.css'
})
export class SubgrupoComponent implements OnInit {
  subgrupos: SubgrupoResponse[] = [];
  grupos: GrupoResponse[] = [];
  subgrupoForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingSubgrupoId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly subgrupoService: SubgrupoService,
    private readonly grupoService: GrupoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.subgrupoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      grupoId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarSubgrupos();
    this.cargarGrupos();
  }

  /**
   * Obtiene la lista filtrada de subgrupos según el término de búsqueda
   */
  get subgruposFiltrados(): SubgrupoResponse[] {
    if (!this.searchTerm.trim()) {
      return this.subgrupos;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.subgrupos.filter(subgrupo =>
      subgrupo.nombre.toLowerCase().includes(termino) ||
      subgrupo.codigo.toLowerCase().includes(termino) ||
      subgrupo.grupoNombre.toLowerCase().includes(termino) ||
      subgrupo.id.toString().includes(termino)
    );
  }

  /**
   * Carga todos los subgrupos desde el backend
   */
  cargarSubgrupos(): void {
    this.loading = true;
    this.subgrupoService.findAll().subscribe({
      next: (data) => {
        this.subgrupos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar subgrupos:', error);
        this.notificationService.error(error.message, 'Error al cargar subgrupos');
        this.loading = false;
      }
    });
  }

  /**
   * Carga todos los grupos para el dropdown
   */
  cargarGrupos(): void {
    this.grupoService.findAll().subscribe({
      next: (data) => {
        this.grupos = data.filter(g => g.activo);
      },
      error: (error) => {
        console.error('Error al cargar grupos:', error);
        this.notificationService.error(error.message, 'Error al cargar grupos');
      }
    });
  }

  /**
   * Abre el modal para crear un nuevo subgrupo
   */
  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingSubgrupoId = null;
    this.subgrupoForm.reset();
    this.showModal = true;
  }

  /**
   * Abre el modal para editar un subgrupo existente
   */
  abrirModalEditar(subgrupo: SubgrupoResponse): void {
    this.isEditing = true;
    this.editingSubgrupoId = subgrupo.id;
    this.subgrupoForm.patchValue({
      nombre: subgrupo.nombre,
      codigo: subgrupo.codigo,
      grupoId: subgrupo.grupoId
    });
    this.showModal = true;
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  cerrarModal(): void {
    this.showModal = false;
    this.subgrupoForm.reset();
    this.isEditing = false;
    this.editingSubgrupoId = null;
  }

  /**
   * Guarda un subgrupo (crear o actualizar)
   */
  guardarSubgrupo(): void {
    if (this.subgrupoForm.invalid) {
      this.subgrupoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const subgrupoData: SubgrupoRequest = {
      nombre: this.subgrupoForm.value.nombre,
      codigo: this.subgrupoForm.value.codigo,
      grupoId: Number(this.subgrupoForm.value.grupoId)
    };

    if (this.isEditing && this.editingSubgrupoId !== null) {
      // Actualizar subgrupo existente
      this.subgrupoService.update(this.editingSubgrupoId, subgrupoData).subscribe({
        next: (response) => {
          this.notificationService.success('Subgrupo actualizado exitosamente');
          this.cargarSubgrupos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar subgrupo:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      // Crear nuevo subgrupo
      this.subgrupoService.save(subgrupoData).subscribe({
        next: (response) => {
          this.notificationService.success('Subgrupo creado exitosamente');
          this.cargarSubgrupos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear subgrupo:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  /**
   * Elimina un subgrupo
   */
  async eliminarSubgrupo(subgrupo: SubgrupoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(subgrupo.nombre);
    
    if (!confirmed) {
      return;
    }

    this.subgrupoService.delete(subgrupo.id).subscribe({
      next: () => {
        this.notificationService.toast('Subgrupo eliminado exitosamente', 'success');
        this.cargarSubgrupos();
      },
      error: (error) => {
        console.error('Error al eliminar subgrupo:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  /**
   * Verifica si un campo del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.subgrupoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.subgrupoForm.get(fieldName);
    
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
