import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoTipoService } from '../../Service/producto-tipo.service';
import { ProductoTipoRequest, ProductoTipoResponse } from '../../Entidad/producto-tipo.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-producto-tipo',
  standalone: false,
  templateUrl: './producto-tipo.component.html',
  styleUrl: './producto-tipo.component.css'
})
export class ProductoTipoComponent implements OnInit {
  productoTipos: ProductoTipoResponse[] = [];
  productoTiposFiltrados: ProductoTipoResponse[] = [];
  productoTipoForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedProductoTipoId?: number;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly productoTipoService: ProductoTipoService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.productoTipoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.cargarProductoTipos();
  }

  cargarProductoTipos(): void {
    this.loading = true;
    this.productoTipoService.findAll().subscribe({
      next: (data) => {
        this.productoTipos = data;
        this.productoTiposFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar tipos de producto', error.message);
        this.loading = false;
      }
    });
  }

  filtrarProductoTipos(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.productoTiposFiltrados = this.productoTipos.filter(tipo =>
      tipo.nombre.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.productoTipoForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(productoTipo: ProductoTipoResponse): void {
    this.isEditMode = true;
    this.selectedProductoTipoId = productoTipo.id;
    this.productoTipoForm.patchValue({
      nombre: productoTipo.nombre
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.productoTipoForm.reset();
    this.isEditMode = false;
    this.selectedProductoTipoId = undefined;
  }

  async guardarProductoTipo(): Promise<void> {
    if (this.productoTipoForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos correctamente');
      return;
    }

    const productoTipoData: ProductoTipoRequest = this.productoTipoForm.value;

    if (this.isEditMode && this.selectedProductoTipoId) {
      this.productoTipoService.update(this.selectedProductoTipoId, productoTipoData).subscribe({
        next: () => {
          this.notificationService.success('Tipo de producto actualizado', 'El tipo de producto se actualizó correctamente');
          this.cargarProductoTipos();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al actualizar tipo de producto', error.message);
        }
      });
    } else {
      this.productoTipoService.save(productoTipoData).subscribe({
        next: () => {
          this.notificationService.success('Tipo de producto creado', 'El tipo de producto se creó correctamente');
          this.cargarProductoTipos();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al crear tipo de producto', error.message);
        }
      });
    }
  }

  async eliminarProductoTipo(productoTipo: ProductoTipoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar el tipo de producto "${productoTipo.nombre}"?`
    );

    if (confirmed) {
      this.productoTipoService.delete(productoTipo.id).subscribe({
        next: () => {
          this.notificationService.success('Tipo de producto eliminado', 'El tipo de producto se eliminó correctamente');
          this.cargarProductoTipos();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar tipo de producto', error.message);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productoTipoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productoTipoForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) return 'Texto demasiado largo';
    return '';
  }
}
