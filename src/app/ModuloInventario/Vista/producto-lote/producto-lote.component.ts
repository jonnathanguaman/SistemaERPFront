import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoLoteService } from '../../Service/producto-lote.service';
import { ProductoLoteRequest, ProductoLoteResponse } from '../../Entidad/producto-lote.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-producto-lote',
  standalone: false,
  templateUrl: './producto-lote.component.html',
  styleUrl: './producto-lote.component.css'
})
export class ProductoLoteComponent implements OnInit {
  productoLotes: ProductoLoteResponse[] = [];
  productoLotesFiltrados: ProductoLoteResponse[] = [];
  productoLoteForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedProductoLoteId?: number;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly productoLoteService: ProductoLoteService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.productoLoteForm = this.fb.group({
      numeroLote: ['', [Validators.required, Validators.maxLength(50)]],
      fechaFabricacion: ['', [Validators.required]],
      fechaVencimiento: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarProductoLotes();
  }

  cargarProductoLotes(): void {
    this.loading = true;
    this.productoLoteService.findAll().subscribe({
      next: (data) => {
        this.productoLotes = data;
        this.productoLotesFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar lotes de producto', error.message);
        this.loading = false;
      }
    });
  }

  filtrarProductoLotes(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.productoLotesFiltrados = this.productoLotes.filter(lote =>
      lote.numeroLote.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.productoLoteForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(productoLote: ProductoLoteResponse): void {
    this.isEditMode = true;
    this.selectedProductoLoteId = productoLote.id;
    
    // Convertir fechas al formato YYYY-MM-DD para el input date
    const fechaFabricacion = new Date(productoLote.fechaFabricacion);
    const fechaVencimiento = new Date(productoLote.fechaVencimiento);
    
    this.productoLoteForm.patchValue({
      numeroLote: productoLote.numeroLote,
      fechaFabricacion: this.formatDateForInput(fechaFabricacion),
      fechaVencimiento: this.formatDateForInput(fechaVencimiento)
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.productoLoteForm.reset();
    this.isEditMode = false;
    this.selectedProductoLoteId = undefined;
  }

  async guardarProductoLote(): Promise<void> {
    if (this.productoLoteForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos correctamente');
      return;
    }

    const formValue = this.productoLoteForm.value;
    const productoLoteData: ProductoLoteRequest = {
      numeroLote: formValue.numeroLote,
      fechaFabricacion: new Date(formValue.fechaFabricacion),
      fechaVencimiento: new Date(formValue.fechaVencimiento)
    };

    // Validar que la fecha de vencimiento sea posterior a la fecha de fabricación
    if (productoLoteData.fechaVencimiento <= productoLoteData.fechaFabricacion) {
      this.notificationService.warning('Fechas inválidas', 'La fecha de vencimiento debe ser posterior a la fecha de fabricación');
      return;
    }

    if (this.isEditMode && this.selectedProductoLoteId) {
      this.productoLoteService.update(this.selectedProductoLoteId, productoLoteData).subscribe({
        next: () => {
          this.notificationService.success('Lote actualizado', 'El lote de producto se actualizó correctamente');
          this.cargarProductoLotes();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al actualizar lote', error.message);
        }
      });
    } else {
      this.productoLoteService.save(productoLoteData).subscribe({
        next: () => {
          this.notificationService.success('Lote creado', 'El lote de producto se creó correctamente');
          this.cargarProductoLotes();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al crear lote', error.message);
        }
      });
    }
  }

  async eliminarProductoLote(productoLote: ProductoLoteResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar el lote "${productoLote.numeroLote}"?`
    );

    if (confirmed) {
      this.productoLoteService.delete(productoLote.id).subscribe({
        next: () => {
          this.notificationService.success('Lote eliminado', 'El lote de producto se eliminó correctamente');
          this.cargarProductoLotes();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar lote', error.message);
        }
      });
    }
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productoLoteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productoLoteForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) return 'Texto demasiado largo';
    return '';
  }
}
