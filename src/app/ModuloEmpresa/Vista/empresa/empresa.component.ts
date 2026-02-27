import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaService } from '../../Service/empresa.service';
import { EmpresaRequest, EmpresaResponse } from '../../Entidad/empresa.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-empresa',
  standalone: false,
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.css'
})
export class EmpresaComponent implements OnInit {
  empresas: EmpresaResponse[] = [];
  empresasFiltradas: EmpresaResponse[] = [];
  empresaForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedEmpresaId?: number;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly empresaService: EmpresaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.empresaForm = this.fb.group({
      nit: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.loading = true;
    this.empresaService.findAll().subscribe({
      next: (data) => {
        this.empresas = data;
        this.empresasFiltradas = data;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar empresas', error.message);
        this.loading = false;
      }
    });
  }

  filtrarEmpresas(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.empresasFiltradas = this.empresas.filter(empresa =>
      empresa.nombre.toLowerCase().includes(term) ||
      empresa.nit.toLowerCase().includes(term) ||
      empresa.email.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.empresaForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(empresa: EmpresaResponse): void {
    this.isEditMode = true;
    this.selectedEmpresaId = empresa.id;
    this.empresaForm.patchValue({
      nit: empresa.nit,
      nombre: empresa.nombre,
      direccion: empresa.direccion,
      telefono: empresa.telefono,
      email: empresa.email
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.empresaForm.reset();
    this.isEditMode = false;
    this.selectedEmpresaId = undefined;
  }

  async guardarEmpresa(): Promise<void> {
    if (this.empresaForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos correctamente');
      return;
    }

    const empresaData: EmpresaRequest = this.empresaForm.value;

    if (this.isEditMode && this.selectedEmpresaId) {
      this.empresaService.update(this.selectedEmpresaId, empresaData).subscribe({
        next: () => {
          this.notificationService.success('Empresa actualizada', 'La empresa se actualizó correctamente');
          this.cargarEmpresas();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al actualizar empresa', error.message);
        }
      });
    } else {
      this.empresaService.save(empresaData).subscribe({
        next: () => {
          this.notificationService.success('Empresa creada', 'La empresa se creó correctamente');
          this.cargarEmpresas();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al crear empresa', error.message);
        }
      });
    }
  }

  async eliminarEmpresa(empresa: EmpresaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar la empresa "${empresa.nombre}"?`
    );

    if (confirmed) {
      this.empresaService.delete(empresa.id).subscribe({
        next: () => {
          this.notificationService.success('Empresa eliminada', 'La empresa se eliminó correctamente');
          this.cargarEmpresas();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar empresa', error.message);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.empresaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.empresaForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('maxlength')) return 'Texto demasiado largo';
    return '';
  }
}
