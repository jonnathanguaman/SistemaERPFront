import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormaPagoService } from '../../Service/forma-pago.service';
import { FormaPagoResponse, FormaPagoRequest } from '../../Entidad/forma-pago.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-forma-pago',
  standalone: false,
  templateUrl: './forma-pago.component.html',
  styleUrl: './forma-pago.component.css'
})
export class FormaPagoComponent implements OnInit {
  formasPago: FormaPagoResponse[] = [];
  formaPagoForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingFormaPagoId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly formaPagoService: FormaPagoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.formaPagoForm = this.formBuilder.group({
      codigo: ['', [Validators.required, Validators.maxLength(10)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      requiereReferencia: [false],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarFormasPago();
  }

  get formasPagoFiltradas(): FormaPagoResponse[] {
    if (!this.searchTerm.trim()) {
      return this.formasPago;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.formasPago.filter(forma =>
      forma.codigo?.toLowerCase().includes(termino) ||
      forma.nombre?.toLowerCase().includes(termino) ||
      forma.descripcion?.toLowerCase().includes(termino)
    );
  }

  cargarFormasPago(): void {
    this.loading = true;
    this.formaPagoService.findAll().subscribe({
      next: (data) => {
        this.formasPago = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar formas de pago:', error);
        this.notificationService.error(error.message, 'Error al cargar');
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingFormaPagoId = null;
    this.formaPagoForm.reset({
      requiereReferencia: false,
      activo: true
    });
    this.showModal = true;
  }

  abrirModalEditar(formaPago: FormaPagoResponse): void {
    this.isEditing = true;
    this.editingFormaPagoId = formaPago.id;
    this.formaPagoForm.patchValue({
      codigo: formaPago.codigo,
      nombre: formaPago.nombre,
      descripcion: formaPago.descripcion,
      requiereReferencia: formaPago.requiereReferencia,
      activo: formaPago.activo
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.formaPagoForm.reset();
    this.isEditing = false;
    this.editingFormaPagoId = null;
  }

  guardarFormaPago(): void {
    if (this.formaPagoForm.invalid) {
      this.formaPagoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formaPagoData: FormaPagoRequest = this.formaPagoForm.value;

    if (this.isEditing && this.editingFormaPagoId !== null) {
      this.formaPagoService.update(this.editingFormaPagoId, formaPagoData).subscribe({
        next: () => {
          this.notificationService.success('Forma de pago actualizada exitosamente');
          this.cargarFormasPago();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar forma de pago:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.formaPagoService.save(formaPagoData).subscribe({
        next: () => {
          this.notificationService.success('Forma de pago creada exitosamente');
          this.cargarFormasPago();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear forma de pago:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarFormaPago(formaPago: FormaPagoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(formaPago.nombre);

    if (!confirmed) {
      return;
    }

    this.formaPagoService.delete(formaPago.id).subscribe({
      next: () => {
        this.notificationService.toast('Forma de pago eliminada exitosamente', 'success');
        this.cargarFormasPago();
      },
      error: (error) => {
        console.error('Error al eliminar forma de pago:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formaPagoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.formaPagoForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Debe tener máximo ${maxLength} caracteres`;
    }

    return '';
  }
}
