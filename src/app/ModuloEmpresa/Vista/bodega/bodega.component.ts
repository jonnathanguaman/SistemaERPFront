import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BodegaService } from '../../Service/bodega.service';
import { EmpresaService } from '../../Service/empresa.service';
import { BodegaRequest, BodegaResponse } from '../../Entidad/bodega.model';
import { EmpresaResponse } from '../../Entidad/empresa.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-bodega',
  standalone: false,
  templateUrl: './bodega.component.html',
  styleUrl: './bodega.component.css'
})
export class BodegaComponent implements OnInit {
  bodegas: BodegaResponse[] = [];
  bodegasFiltradas: BodegaResponse[] = [];
  empresas: EmpresaResponse[] = [];
  bodegaForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedBodegaId?: number;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly bodegaService: BodegaService,
    private readonly empresaService: EmpresaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.bodegaForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      empresaId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      bodegas: this.bodegaService.findAll(),
      empresas: this.empresaService.findAll()
    }).subscribe({
      next: (data) => {
        this.bodegas = data.bodegas;
        this.bodegasFiltradas = data.bodegas;
        this.empresas = data.empresas;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar datos', error.message);
        this.loading = false;
      }
    });
  }

  filtrarBodegas(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.bodegasFiltradas = this.bodegas.filter(bodega =>
      bodega.nombre.toLowerCase().includes(term) ||
      bodega.codigo.toLowerCase().includes(term) ||
      bodega.empresaNombre.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.bodegaForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(bodega: BodegaResponse): void {
    this.isEditMode = true;
    this.selectedBodegaId = bodega.id;
    this.bodegaForm.patchValue({
      codigo: bodega.codigo,
      nombre: bodega.nombre,
      direccion: bodega.direccion,
      empresaId: bodega.empresaId
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.bodegaForm.reset();
    this.isEditMode = false;
    this.selectedBodegaId = undefined;
  }

  async guardarBodega(): Promise<void> {
    if (this.bodegaForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos correctamente');
      return;
    }

    const bodegaData: BodegaRequest = this.bodegaForm.value;

    if (this.isEditMode && this.selectedBodegaId) {
      this.bodegaService.update(this.selectedBodegaId, bodegaData).subscribe({
        next: () => {
          this.notificationService.success('Bodega actualizada', 'La bodega se actualizó correctamente');
          this.cargarDatos();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al actualizar bodega', error.message);
        }
      });
    } else {
      this.bodegaService.save(bodegaData).subscribe({
        next: () => {
          this.notificationService.success('Bodega creada', 'La bodega se creó correctamente');
          this.cargarDatos();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al crear bodega', error.message);
        }
      });
    }
  }

  async eliminarBodega(bodega: BodegaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar la bodega "${bodega.nombre}"?`
    );

    if (confirmed) {
      this.bodegaService.delete(bodega.id).subscribe({
        next: () => {
          this.notificationService.success('Bodega eliminada', 'La bodega se eliminó correctamente');
          this.cargarDatos();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar bodega', error.message);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bodegaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.bodegaForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) return 'Texto demasiado largo';
    return '';
  }
}

