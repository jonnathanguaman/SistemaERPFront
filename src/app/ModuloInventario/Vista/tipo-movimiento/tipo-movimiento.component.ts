import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoMovimientoService } from '../../Service/tipo-movimiento.service';
import { TipoMovimientoResponse, TipoMovimientoRequest } from '../../Entidad/tipo-movimiento.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-tipo-movimiento',
  standalone: false,
  templateUrl: './tipo-movimiento.component.html',
  styleUrl: './tipo-movimiento.component.css'
})
export class TipoMovimientoComponent implements OnInit {
  tiposMovimiento: TipoMovimientoResponse[] = [];
  tipoMovimientoForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingTipoMovimientoId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  afectaInventarioOpciones = [
    { value: 'ENTRADA', label: 'Entrada' },
    { value: 'SALIDA', label: 'Salida' },
    { value: 'NEUTRO', label: 'Neutro' }
  ];

  constructor(
    private readonly tipoMovimientoService: TipoMovimientoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.tipoMovimientoForm = this.formBuilder.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      afectaInventario: ['ENTRADA', Validators.required],
      requiereAprobacion: [false],
      generaAsiento: [false]
    });
  }

  ngOnInit(): void {
    this.cargarTiposMovimiento();
  }

  get tiposMovimientoFiltrados(): TipoMovimientoResponse[] {
    if (!this.searchTerm.trim()) {
      return this.tiposMovimiento;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.tiposMovimiento.filter(tipo =>
      tipo.nombre.toLowerCase().includes(termino) ||
      tipo.codigo.toLowerCase().includes(termino) ||
      tipo.afectaInventario.toLowerCase().includes(termino) ||
      tipo.id.toString().includes(termino)
    );
  }

  cargarTiposMovimiento(): void {
    this.loading = true;
    this.tipoMovimientoService.findAll().subscribe({
      next: (data) => {
        this.tiposMovimiento = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar tipos de movimiento:', error);
        this.notificationService.error(error.message, 'Error al cargar tipos de movimiento');
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingTipoMovimientoId = null;
    this.tipoMovimientoForm.reset({
      afectaInventario: 'ENTRADA',
      requiereAprobacion: false,
      generaAsiento: false
    });
    this.showModal = true;
  }

  abrirModalEditar(tipoMovimiento: TipoMovimientoResponse): void {
    this.isEditing = true;
    this.editingTipoMovimientoId = tipoMovimiento.id;
    this.tipoMovimientoForm.patchValue({
      codigo: tipoMovimiento.codigo,
      nombre: tipoMovimiento.nombre,
      descripcion: tipoMovimiento.descripcion,
      afectaInventario: tipoMovimiento.afectaInventario,
      requiereAprobacion: tipoMovimiento.requiereAprobacion,
      generaAsiento: tipoMovimiento.generaAsiento
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.tipoMovimientoForm.reset();
    this.isEditing = false;
    this.editingTipoMovimientoId = null;
  }

  guardarTipoMovimiento(): void {
    if (this.tipoMovimientoForm.invalid) {
      this.tipoMovimientoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const tipoMovimientoData: TipoMovimientoRequest = {
      codigo: this.tipoMovimientoForm.value.codigo,
      nombre: this.tipoMovimientoForm.value.nombre,
      descripcion: this.tipoMovimientoForm.value.descripcion || '',
      afectaInventario: this.tipoMovimientoForm.value.afectaInventario,
      requiereAprobacion: this.tipoMovimientoForm.value.requiereAprobacion,
      generaAsiento: this.tipoMovimientoForm.value.generaAsiento
    };

    if (this.isEditing && this.editingTipoMovimientoId !== null) {
      this.tipoMovimientoService.update(this.editingTipoMovimientoId, tipoMovimientoData).subscribe({
        next: () => {
          this.notificationService.success('Tipo de movimiento actualizado exitosamente');
          this.cargarTiposMovimiento();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar tipo de movimiento:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.tipoMovimientoService.save(tipoMovimientoData).subscribe({
        next: () => {
          this.notificationService.success('Tipo de movimiento creado exitosamente');
          this.cargarTiposMovimiento();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear tipo de movimiento:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarTipoMovimiento(tipoMovimiento: TipoMovimientoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(tipoMovimiento.nombre);
    
    if (!confirmed) {
      return;
    }

    this.tipoMovimientoService.delete(tipoMovimiento.id).subscribe({
      next: () => {
        this.notificationService.toast('Tipo de movimiento eliminado exitosamente', 'success');
        this.cargarTiposMovimiento();
      },
      error: (error) => {
        console.error('Error al eliminar tipo de movimiento:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tipoMovimientoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.tipoMovimientoForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    return '';
  }

  getAfectaInventarioLabel(valor: string): string {
    const opcion = this.afectaInventarioOpciones.find(o => o.value === valor);
    return opcion ? opcion.label : valor;
  }
}
