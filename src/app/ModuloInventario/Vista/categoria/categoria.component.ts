import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaService } from '../../Service/categoria.service';
import { CategoriaResponse, CategoriaRequest } from '../../Entidad/categoria.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-categoria',
  standalone: false,
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent implements OnInit {
  categorias: CategoriaResponse[] = [];
  categoriaForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingCategoriaId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.categoriaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  /**
   * Obtiene la lista filtrada de categorías según el término de búsqueda
   */
  get categoriasFiltradas(): CategoriaResponse[] {
    if (!this.searchTerm.trim()) {
      return this.categorias;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(termino) ||
      categoria.codigo.toLowerCase().includes(termino) ||
      categoria.id.toString().includes(termino)
    );
  }

  /**
   * Carga todas las categorías desde el backend
   */
  cargarCategorias(): void {
    this.loading = true;
    this.categoriaService.findAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.notificationService.error(error.message, 'Error al cargar categorías');
        this.loading = false;
      }
    });
  }

  /**
   * Abre el modal para crear una nueva categoría
   */
  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingCategoriaId = null;
    this.categoriaForm.reset();
    this.showModal = true;
  }

  /**
   * Abre el modal para editar una categoría existente
   */
  abrirModalEditar(categoria: CategoriaResponse): void {
    this.isEditing = true;
    this.editingCategoriaId = categoria.id;
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      codigo: categoria.codigo
    });
    this.showModal = true;
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  cerrarModal(): void {
    this.showModal = false;
    this.categoriaForm.reset();
    this.isEditing = false;
    this.editingCategoriaId = null;
  }

  /**
   * Guarda una categoría (crear o actualizar)
   */
  guardarCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const categoriaData: CategoriaRequest = {
      nombre: this.categoriaForm.value.nombre,
      codigo: this.categoriaForm.value.codigo
    };

    if (this.isEditing && this.editingCategoriaId !== null) {
      // Actualizar categoría existente
      this.categoriaService.update(this.editingCategoriaId, categoriaData).subscribe({
        next: (response) => {
          this.notificationService.success('Categoría actualizada exitosamente');
          this.cargarCategorias();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      // Crear nueva categoría
      this.categoriaService.save(categoriaData).subscribe({
        next: (response) => {
          this.notificationService.success('Categoría creada exitosamente');
          this.cargarCategorias();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  /**
   * Elimina una categoría
   */
  async eliminarCategoria(categoria: CategoriaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(categoria.nombre);
    
    if (!confirmed) {
      return;
    }

    this.categoriaService.delete(categoria.id).subscribe({
      next: () => {
        this.notificationService.toast('Categoría eliminada exitosamente', 'success');
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  /**
   * Verifica si un campo del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoriaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.categoriaForm.get(fieldName);
    
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
