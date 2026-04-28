import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PaisResponse } from '../../Entidad/pais.model';
import { ProvinciaRequest, ProvinciaResponse } from '../../Entidad/provincia.model';
import { PaisService } from '../../Service/pais.service';
import { ProvinciaService } from '../../Service/provincia.service';

@Component({
  selector: 'app-provincia',
  standalone: false,
  templateUrl: './provincia.component.html',
  styleUrl: './provincia.component.css'
})
export class ProvinciaComponent implements OnInit {
  provincias: ProvinciaResponse[] = [];
  provinciasFiltradas: ProvinciaResponse[] = [];
  paises: PaisResponse[] = [];
  provinciaForm: FormGroup;
  showForm = false;
  isEditMode = false;
  selectedProvinciaId?: number;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly provinciaService: ProvinciaService,
    private readonly paisService: PaisService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.provinciaForm = this.fb.group({
      paisId: [null, [Validators.required]],
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
        this.cargarProvincias();
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar países');
        this.loading = false;
      }
    });
  }

  cargarProvincias(): void {
    this.provinciaService.findAll().subscribe({
      next: (provincias) => {
        this.provincias = provincias;
        this.provinciasFiltradas = provincias;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar provincias');
        this.loading = false;
      }
    });
  }

  filtrarProvincias(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.provinciasFiltradas = this.provincias.filter(provincia =>
      provincia.nombre.toLowerCase().includes(term) ||
      provincia.paisNombre.toLowerCase().includes(term) ||
      (provincia.codigo || '').toLowerCase().includes(term)
    );
  }

  abrirFormCrear(): void {
    this.isEditMode = false;
    this.selectedProvinciaId = undefined;
    this.provinciaForm.reset({ activo: true });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirFormEditar(provincia: ProvinciaResponse): void {
    this.isEditMode = true;
    this.selectedProvinciaId = provincia.id;
    this.provinciaForm.patchValue({
      paisId: provincia.paisId,
      codigo: provincia.codigo,
      nombre: provincia.nombre,
      activo: provincia.activo
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cerrarForm(): void {
    this.showForm = false;
    this.provinciaForm.reset({ activo: true });
    this.selectedProvinciaId = undefined;
    this.isEditMode = false;
  }

  guardarProvincia(): void {
    if (this.provinciaForm.invalid) {
      this.provinciaForm.markAllAsTouched();
      this.notificationService.warning('Formulario incompleto', 'Completa los campos obligatorios');
      return;
    }

    const payload: ProvinciaRequest = this.provinciaForm.value;

    if (this.isEditMode && this.selectedProvinciaId) {
      this.provinciaService.update(this.selectedProvinciaId, payload).subscribe({
        next: () => {
          this.notificationService.success('Provincia actualizada correctamente');
          this.cargarProvincias();
          this.cerrarForm();
        },
        error: (error) => this.notificationService.error(error.message, 'Error al actualizar')
      });
      return;
    }

    this.provinciaService.save(payload).subscribe({
      next: () => {
        this.notificationService.success('Provincia creada correctamente');
        this.cargarProvincias();
        this.cerrarForm();
      },
      error: (error) => this.notificationService.error(error.message, 'Error al crear')
    });
  }

  async eliminarProvincia(provincia: ProvinciaResponse): Promise<void> {
    const ok = await this.notificationService.confirmDelete(provincia.nombre);
    if (!ok) {
      return;
    }
    this.provinciaService.delete(provincia.id).subscribe({
      next: () => {
        this.notificationService.toast('Provincia inactivada correctamente', 'success');
        this.cargarProvincias();
      },
      error: (error) => this.notificationService.error(error.message, 'Error al eliminar')
    });
  }
}
