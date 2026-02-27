import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubcategoriaService } from '../../Service/subcategoria.service';
import { CategoriaService } from '../../Service/categoria.service';
import { SubcategoriaResponse, SubcategoriaRequest } from '../../Entidad/subcategoria.model';
import { CategoriaResponse } from '../../Entidad/categoria.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-subcategoria',
  standalone: false,
  templateUrl: './subcategoria.component.html',
  styleUrl: './subcategoria.component.css'
})
export class SubcategoriaComponent implements OnInit {
  subcategorias: SubcategoriaResponse[] = [];
  categorias: CategoriaResponse[] = [];
  subcategoriaForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingSubcategoriaId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly subcategoriaService: SubcategoriaService,
    private readonly categoriaService: CategoriaService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.subcategoriaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      categoriaId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarSubcategorias();
    this.cargarCategorias();
  }

  /**
   * Obtiene la lista filtrada de subcategorías según el término de búsqueda
   */
  get subcategoriasFiltradas(): SubcategoriaResponse[] {
    if (!this.searchTerm.trim()) {
      return this.subcategorias;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.subcategorias.filter(subcategoria =>
      subcategoria.nombre.toLowerCase().includes(termino) ||
      subcategoria.codigo.toLowerCase().includes(termino) ||
      subcategoria.categoriaNombre.toLowerCase().includes(termino) ||
      subcategoria.id.toString().includes(termino)
    );
  }

  /**
   * Carga todas las subcategorías desde el backend
   */
  cargarSubcategorias(): void {
    this.loading = true;
    this.subcategoriaService.findAll().subscribe({
      next: (data) => {
        this.subcategorias = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar subcategorías:', error);
        this.notificationService.error(error.message, 'Error al cargar subcategorías');
        this.loading = false;
      }
    });
  }

  /**
   * Carga todas las categorías para el dropdown
   */
  cargarCategorias(): void {
    this.categoriaService.findAll().subscribe({
      next: (data) => {
        this.categorias = data.filter(c => c.activo);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.notificationService.error(error.message, 'Error al cargar categorías');
      }
    });
  }

  /**
   * Abre el modal para crear una nueva subcategoría
   */
  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingSubcategoriaId = null;
    this.subcategoriaForm.reset();
    this.showModal = true;
  }

  /**
   * Abre el modal para editar una subcategoría existente
   */
  abrirModalEditar(subcategoria: SubcategoriaResponse): void {
    this.isEditing = true;
    this.editingSubcategoriaId = subcategoria.id;
    this.subcategoriaForm.patchValue({
      nombre: subcategoria.nombre,
      codigo: subcategoria.codigo,
      categoriaId: subcategoria.categoriaId
    });
    this.showModal = true;
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  cerrarModal(): void {
    this.showModal = false;
    this.subcategoriaForm.reset();
    this.isEditing = false;
    this.editingSubcategoriaId = null;
  }

  /**
   * Guarda una subcategoría (crear o actualizar)
   */
  guardarSubcategoria(): void {
    if (this.subcategoriaForm.invalid) {
      this.subcategoriaForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const subcategoriaData: SubcategoriaRequest = {
      nombre: this.subcategoriaForm.value.nombre,
      codigo: this.subcategoriaForm.value.codigo,
      categoriaId: Number(this.subcategoriaForm.value.categoriaId)
    };

    if (this.isEditing && this.editingSubcategoriaId !== null) {
      // Actualizar subcategoría existente
      this.subcategoriaService.update(this.editingSubcategoriaId, subcategoriaData).subscribe({
        next: (response) => {
          this.notificationService.success('Subcategoría actualizada exitosamente');
          this.cargarSubcategorias();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar subcategoría:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      // Crear nueva subcategoría
      this.subcategoriaService.save(subcategoriaData).subscribe({
        next: (response) => {
          this.notificationService.success('Subcategoría creada exitosamente');
          this.cargarSubcategorias();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear subcategoría:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  /**
   * Elimina una subcategoría
   */
  async eliminarSubcategoria(subcategoria: SubcategoriaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(subcategoria.nombre);
    
    if (!confirmed) {
      return;
    }

    this.subcategoriaService.delete(subcategoria.id).subscribe({
      next: () => {
        this.notificationService.toast('Subcategoría eliminada exitosamente', 'success');
        this.cargarSubcategorias();
      },
      error: (error) => {
        console.error('Error al eliminar subcategoría:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  /**
   * Verifica si un campo del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.subcategoriaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.subcategoriaForm.get(fieldName);
    
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
