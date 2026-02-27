import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CuentaContableService } from '../../Service/cuenta-contable.service';
import { CuentaContableResponse, CuentaContableRequest } from '../../Entidad/cuenta-contable.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-cuenta-contable',
  standalone: false,
  templateUrl: './cuenta-contable.component.html',
  styleUrl: './cuenta-contable.component.css'
})
export class CuentaContableComponent implements OnInit {
  cuentasContables: CuentaContableResponse[] = [];
  cuentaContableForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingCuentaContableId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly cuentaContableService: CuentaContableService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.cuentaContableForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.cargarCuentasContables();
  }

  get cuentasContablesFiltradas(): CuentaContableResponse[] {
    if (!this.searchTerm.trim()) {
      return this.cuentasContables;
    }
    const termino = this.searchTerm.toLowerCase();
    return this.cuentasContables.filter(cuenta =>
      cuenta.nombre.toLowerCase().includes(termino) ||
      cuenta.descripcion.toLowerCase().includes(termino) ||
      cuenta.id.toString().includes(termino)
    );
  }

  cargarCuentasContables(): void {
    this.loading = true;
    this.cuentaContableService.findAll().subscribe({
      next: (data) => {
        this.cuentasContables = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cuentas contables:', error);
        this.notificationService.error(error.message, 'Error al cargar cuentas contables');
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingCuentaContableId = null;
    this.cuentaContableForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(cuentaContable: CuentaContableResponse): void {
    this.isEditing = true;
    this.editingCuentaContableId = cuentaContable.id;
    this.cuentaContableForm.patchValue({
      nombre: cuentaContable.nombre,
      descripcion: cuentaContable.descripcion
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.cuentaContableForm.reset();
    this.isEditing = false;
    this.editingCuentaContableId = null;
  }

  guardarCuentaContable(): void {
    if (this.cuentaContableForm.invalid) {
      this.cuentaContableForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const cuentaContableData: CuentaContableRequest = {
      nombre: this.cuentaContableForm.value.nombre,
      descripcion: this.cuentaContableForm.value.descripcion
    };

    if (this.isEditing && this.editingCuentaContableId !== null) {
      this.cuentaContableService.update(this.editingCuentaContableId, cuentaContableData).subscribe({
        next: (response) => {
          this.notificationService.success('Cuenta contable actualizada exitosamente');
          this.cargarCuentasContables();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar cuenta contable:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.cuentaContableService.save(cuentaContableData).subscribe({
        next: (response) => {
          this.notificationService.success('Cuenta contable creada exitosamente');
          this.cargarCuentasContables();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear cuenta contable:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarCuentaContable(cuentaContable: CuentaContableResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(cuentaContable.nombre);
    if (!confirmed) {
      return;
    }
    this.cuentaContableService.delete(cuentaContable.id).subscribe({
      next: () => {
        this.notificationService.toast('Cuenta contable eliminada exitosamente', 'success');
        this.cargarCuentasContables();
      },
      error: (error) => {
        console.error('Error al eliminar cuenta contable:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cuentaContableForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.cuentaContableForm.get(fieldName);
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
