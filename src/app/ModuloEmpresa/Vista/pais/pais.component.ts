import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PaisRequest, PaisResponse } from '../../Entidad/pais.model';
import { PaisService } from '../../Service/pais.service';

@Component({
  selector: 'app-pais',
  standalone: false,
  templateUrl: './pais.component.html',
  styleUrl: './pais.component.css'
})
export class PaisComponent implements OnInit {
  paises: PaisResponse[] = [];
  paisesFiltrados: PaisResponse[] = [];
  paisForm: FormGroup;
  showForm = false;
  isEditMode = false;
  selectedPaisId?: number;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly paisService: PaisService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.paisForm = this.fb.group({
      codigoIso2: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarPaises();
  }

  cargarPaises(): void {
    this.loading = true;
    this.paisService.findAll().subscribe({
      next: (data) => {
        this.paises = data;
        this.paisesFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar países');
        this.loading = false;
      }
    });
  }

  filtrarPaises(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.paisesFiltrados = this.paises.filter(pais =>
      pais.nombre.toLowerCase().includes(term) ||
      pais.codigoIso2.toLowerCase().includes(term)
    );
  }

  abrirFormCrear(): void {
    this.isEditMode = false;
    this.selectedPaisId = undefined;
    this.paisForm.reset({ activo: true });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirFormEditar(pais: PaisResponse): void {
    this.isEditMode = true;
    this.selectedPaisId = pais.id;
    this.paisForm.patchValue({
      codigoIso2: pais.codigoIso2,
      nombre: pais.nombre,
      activo: pais.activo
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cerrarForm(): void {
    this.showForm = false;
    this.paisForm.reset({ activo: true });
    this.selectedPaisId = undefined;
    this.isEditMode = false;
  }

  guardarPais(): void {
    if (this.paisForm.invalid) {
      this.paisForm.markAllAsTouched();
      this.notificationService.warning('Formulario incompleto', 'Completa los campos obligatorios');
      return;
    }

    const payload: PaisRequest = {
      ...this.paisForm.value,
      codigoIso2: this.paisForm.value.codigoIso2?.toUpperCase().trim()
    };

    if (this.isEditMode && this.selectedPaisId) {
      this.paisService.update(this.selectedPaisId, payload).subscribe({
        next: () => {
          this.notificationService.success('País actualizado correctamente');
          this.cargarPaises();
          this.cerrarForm();
        },
        error: (error) => this.notificationService.error(error.message, 'Error al actualizar')
      });
      return;
    }

    this.paisService.save(payload).subscribe({
      next: () => {
        this.notificationService.success('País creado correctamente');
        this.cargarPaises();
        this.cerrarForm();
      },
      error: (error) => this.notificationService.error(error.message, 'Error al crear')
    });
  }

  async eliminarPais(pais: PaisResponse): Promise<void> {
    const ok = await this.notificationService.confirmDelete(pais.nombre);
    if (!ok) {
      return;
    }
    this.paisService.delete(pais.id).subscribe({
      next: () => {
        this.notificationService.toast('País inactivado correctamente', 'success');
        this.cargarPaises();
      },
      error: (error) => this.notificationService.error(error.message, 'Error al eliminar')
    });
  }
}
