import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PersonaEmpresaService } from '../../Service/persona-empresa.service';
import { EmpresaService } from '../../Service/empresa.service';
import { PersonaService } from '../../../ModuloEmpleados/Service/persona.service';
import { PersonaEmpresa, PersonaEmpresaDetalle } from '../../Entidad/persona-empresa.model';
import { EmpresaResponse } from '../../Entidad/empresa.model';
import { PersonaResponse } from '../../../ModuloEmpleados/Entidades/persona.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-persona-empresa',
  standalone: false,
  templateUrl: './persona-empresa.component.html',
  styleUrl: './persona-empresa.component.css'
})
export class PersonaEmpresaComponent implements OnInit {
  asignaciones: PersonaEmpresaDetalle[] = [];
  asignacionesFiltradas: PersonaEmpresaDetalle[] = [];
  empresas: EmpresaResponse[] = [];
  personas: PersonaResponse[] = [];
  asignacionForm: FormGroup;
  showModal = false;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly personaEmpresaService: PersonaEmpresaService,
    private readonly empresaService: EmpresaService,
    private readonly personaService: PersonaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.asignacionForm = this.fb.group({
      personaId: ['', [Validators.required]],
      empresaId: ['', [Validators.required]],
      fechaIngreso: ['', [Validators.required]],
      fechaSalida: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      asignaciones: this.personaEmpresaService.findAll(),
      empresas: this.empresaService.findAll(),
      personas: this.personaService.findAll()
    }).subscribe({
      next: (data) => {
        this.empresas = data.empresas;
        this.personas = data.personas;
        this.asignaciones = this.procesarAsignaciones(data.asignaciones);
        this.asignacionesFiltradas = this.asignaciones;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar datos', error.message);
        this.loading = false;
      }
    });
  }

  procesarAsignaciones(asignaciones: PersonaEmpresa[]): PersonaEmpresaDetalle[] {
    return asignaciones.map(asignacion => {
      const persona = this.personas.find(p => p.id === asignacion.personaId);
      const empresa = this.empresas.find(e => e.id === asignacion.empresaId);

      return {
        ...asignacion,
        personaNombre: persona?.nombre,
        personaCedula: persona?.cedula,
        empresaNombre: empresa?.nombre,
        empresaNit: empresa?.nit
      };
    });
  }

  filtrarAsignaciones(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.asignacionesFiltradas = this.asignaciones.filter(asignacion =>
      asignacion.personaNombre?.toLowerCase().includes(term) ||
      asignacion.personaCedula?.toLowerCase().includes(term) ||
      asignacion.empresaNombre?.toLowerCase().includes(term) ||
      asignacion.empresaNit?.toLowerCase().includes(term)
    );
  }

  abrirModalAsignar(): void {
    this.asignacionForm.reset({ activo: true });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.asignacionForm.reset();
  }

  async asignarPersona(): Promise<void> {
    if (this.asignacionForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos correctamente');
      return;
    }

    const asignacionData: PersonaEmpresa = this.asignacionForm.value;

    this.personaEmpresaService.save(asignacionData).subscribe({
      next: () => {
        this.notificationService.success('Persona asignada', 'La persona se asignó correctamente a la empresa');
        this.cargarDatos();
        this.cerrarModal();
      },
      error: (error) => {
        this.notificationService.error('Error al asignar persona', error.message);
      }
    });
  }

  async eliminarAsignacion(asignacion: PersonaEmpresaDetalle): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar la asignación de "${asignacion.personaNombre}" en "${asignacion.empresaNombre}"?`
    );

    if (confirmed && asignacion.id) {
      this.personaEmpresaService.delete(asignacion.id).subscribe({
        next: () => {
          this.notificationService.success('Asignación eliminada', 'La asignación se eliminó correctamente');
          this.cargarDatos();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar asignación', error.message);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.asignacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.asignacionForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    return '';
  }
}
