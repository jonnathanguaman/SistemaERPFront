import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { CiudadRequest, CiudadResponse } from '../../Entidad/ciudad.model';
import { PaisResponse } from '../../Entidad/pais.model';
import { ProvinciaResponse } from '../../Entidad/provincia.model';
import { CiudadService } from '../../Service/ciudad.service';
import { PaisService } from '../../Service/pais.service';
import { ProvinciaService } from '../../Service/provincia.service';

@Component({
  selector: 'app-ciudad',
  standalone: false,
  templateUrl: './ciudad.component.html',
  styleUrl: './ciudad.component.css'
})
export class CiudadComponent implements OnInit {
  ciudades: CiudadResponse[] = [];
  ciudadesFiltradas: CiudadResponse[] = [];
  paises: PaisResponse[] = [];
  provinciasDisponibles: ProvinciaResponse[] = [];
  ciudadForm: FormGroup;
  showForm = false;
  isEditMode = false;
  selectedCiudadId?: number;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly ciudadService: CiudadService,
    private readonly paisService: PaisService,
    private readonly provinciaService: ProvinciaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.ciudadForm = this.fb.group({
      paisId: [null, [Validators.required]],
      provinciaId: [null, [Validators.required]],
      codigo: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.loading = true;
    this.paisService.findActivos().subscribe({
      next: (paises) => {
        this.paises = paises;
        this.cargarCiudades();
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar países');
        this.loading = false;
      }
    });
  }

  cargarCiudades(): void {
    this.ciudadService.findAll().subscribe({
      next: (ciudades) => {
        this.ciudades = ciudades;
        this.ciudadesFiltradas = ciudades;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar ciudades');
        this.loading = false;
      }
    });
  }

  filtrarCiudades(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.ciudadesFiltradas = this.ciudades.filter(ciudad =>
      ciudad.nombre.toLowerCase().includes(term) ||
      ciudad.provinciaNombre.toLowerCase().includes(term) ||
      ciudad.paisNombre.toLowerCase().includes(term) ||
      (ciudad.codigo || '').toLowerCase().includes(term)
    );
  }

  onPaisChange(paisId: number | null): void {
    this.ciudadForm.patchValue({ provinciaId: null });
    this.provinciasDisponibles = [];

    if (!paisId) {
      return;
    }

    this.provinciaService.findByPais(Number(paisId)).subscribe({
      next: (data) => {
        this.provinciasDisponibles = data;
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar provincias');
      }
    });
  }

  abrirFormCrear(): void {
    this.isEditMode = false;
    this.selectedCiudadId = undefined;
    this.provinciasDisponibles = [];
    this.ciudadForm.reset({ activo: true, paisId: null, provinciaId: null });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirFormEditar(ciudad: CiudadResponse): void {
    this.isEditMode = true;
    this.selectedCiudadId = ciudad.id;

    this.provinciaService.findByPais(ciudad.paisId).subscribe({
      next: (provincias) => {
        this.provinciasDisponibles = provincias;
        this.ciudadForm.patchValue({
          paisId: ciudad.paisId,
          provinciaId: ciudad.provinciaId,
          codigo: ciudad.codigo,
          nombre: ciudad.nombre,
          activo: ciudad.activo
        });
        this.showForm = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (error) => this.notificationService.error(error.message, 'Error al cargar provincias')
    });
  }

  cerrarForm(): void {
    this.showForm = false;
    this.ciudadForm.reset({ activo: true, paisId: null, provinciaId: null });
    this.provinciasDisponibles = [];
    this.selectedCiudadId = undefined;
    this.isEditMode = false;
  }

  guardarCiudad(): void {
    if (this.ciudadForm.invalid) {
      this.ciudadForm.markAllAsTouched();
      this.notificationService.warning('Formulario incompleto', 'Completa los campos obligatorios');
      return;
    }

    const formValue = this.ciudadForm.value;
    const payload: CiudadRequest = {
      provinciaId: Number(formValue.provinciaId),
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      activo: formValue.activo
    };

    if (this.isEditMode && this.selectedCiudadId) {
      this.ciudadService.update(this.selectedCiudadId, payload).subscribe({
        next: () => {
          this.notificationService.success('Ciudad actualizada correctamente');
          this.cargarCiudades();
          this.cerrarForm();
        },
        error: (error) => this.notificationService.error(error.message, 'Error al actualizar')
      });
      return;
    }

    this.ciudadService.save(payload).subscribe({
      next: () => {
        this.notificationService.success('Ciudad creada correctamente');
        this.cargarCiudades();
        this.cerrarForm();
      },
      error: (error) => this.notificationService.error(error.message, 'Error al crear')
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ciudadForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.ciudadForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength']?.requiredLength;
      return `Debe tener máximo ${maxLength} caracteres`;
    }
    if (field?.hasError('min')) {
      const min = field.errors?.['min']?.min;
      return `Debe ser mayor o igual a ${min}`;
    }
    return '';
  }

  async eliminarCiudad(ciudad: CiudadResponse): Promise<void> {
    const ok = await this.notificationService.confirmDelete(ciudad.nombre);
    if (!ok) {
      return;
    }
    this.ciudadService.delete(ciudad.id).subscribe({
      next: () => {
        this.notificationService.toast('Ciudad inactivada correctamente', 'success');
        this.cargarCiudades();
      },
      error: (error) => this.notificationService.error(error.message, 'Error al eliminar')
    });
  }
}
