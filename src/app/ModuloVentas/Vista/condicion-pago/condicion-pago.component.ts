import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { CondicionPagoResponse, CondicionPagoRequest } from '../../Entidad/condicion-pago.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-condicion-pago',
  standalone: false,
  templateUrl: './condicion-pago.component.html',
  styleUrl: './condicion-pago.component.css'
})
export class CondicionPagoComponent implements OnInit {
  condicionesPago: CondicionPagoResponse[] = [];
  condicionPagoForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingCondicionId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly condicionPagoService: CondicionPagoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.condicionPagoForm = this.formBuilder.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      diasCredito: [0, [Validators.required, Validators.min(0)]],
      requiereGarantia: [false],
      requiereAprobacionCredito: [false],
      permiteCuotas: [false],
      numeroCuotasMaximo: [1, Validators.min(1)],
      esPredeterminado: [false]
    });
  }

  ngOnInit(): void {
    this.cargarCondicionesPago();
  }

  get condicionesPagoFiltradas(): CondicionPagoResponse[] {
    if (!this.searchTerm.trim()) {
      return this.condicionesPago;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.condicionesPago.filter(condicion =>
      condicion.codigo?.toLowerCase().includes(termino) ||
      condicion.nombre?.toLowerCase().includes(termino) ||
      condicion.descripcion?.toLowerCase().includes(termino)
    );
  }

  cargarCondicionesPago(): void {
    this.loading = true;
    this.condicionPagoService.findAll().subscribe({
      next: (data) => {
        this.condicionesPago = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar condiciones de pago:', error);
        this.notificationService.error(error.message, 'Error al cargar');
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingCondicionId = null;
    this.condicionPagoForm.reset({
      diasCredito: 0,
      requiereGarantia: false,
      requiereAprobacionCredito: false,
      permiteCuotas: false,
      numeroCuotasMaximo: 1,
      esPredeterminado: false
    });
    this.showModal = true;
  }

  abrirModalEditar(condicion: CondicionPagoResponse): void {
    this.isEditing = true;
    this.editingCondicionId = condicion.id;
    this.condicionPagoForm.patchValue({
      codigo: condicion.codigo,
      nombre: condicion.nombre,
      descripcion: condicion.descripcion,
      diasCredito: condicion.diasCredito,
      requiereGarantia: condicion.requiereGarantia,
      requiereAprobacionCredito: condicion.requiereAprobacionCredito,
      permiteCuotas: condicion.permiteCuotas,
      numeroCuotasMaximo: condicion.numeroCuotasMaximo,
      esPredeterminado: condicion.esPredeterminado
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.condicionPagoForm.reset();
    this.isEditing = false;
    this.editingCondicionId = null;
  }

  guardarCondicionPago(): void {
    if (this.condicionPagoForm.invalid) {
      this.condicionPagoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const condicionData: CondicionPagoRequest = this.condicionPagoForm.value;

    if (this.isEditing && this.editingCondicionId !== null) {
      this.condicionPagoService.update(this.editingCondicionId, condicionData).subscribe({
        next: () => {
          this.notificationService.success('Condición de pago actualizada exitosamente');
          this.cargarCondicionesPago();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar condición de pago:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.condicionPagoService.save(condicionData).subscribe({
        next: () => {
          this.notificationService.success('Condición de pago creada exitosamente');
          this.cargarCondicionesPago();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear condición de pago:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarCondicionPago(condicion: CondicionPagoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(condicion.nombre);

    if (!confirmed) {
      return;
    }

    this.condicionPagoService.delete(condicion.id).subscribe({
      next: () => {
        this.notificationService.toast('Condición de pago eliminada exitosamente', 'success');
        this.cargarCondicionesPago();
      },
      error: (error) => {
        console.error('Error al eliminar condición de pago:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.condicionPagoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.condicionPagoForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Debe tener máximo ${maxLength} caracteres`;
    }

    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Debe ser mayor o igual a ${min}`;
    }

    return '';
  }

  getTipoPago(diasCredito: number): string {
    return diasCredito === 0 ? 'Contado' : `Crédito (${diasCredito} días)`;
  }
}
