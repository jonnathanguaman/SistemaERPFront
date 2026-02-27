import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BodegaResponsableService } from '../../Service/bodega-responsable.service';
import { BodegaService } from '../../Service/bodega.service';
import { PersonaEmpresaService } from '../../Service/persona-empresa.service';
import { PersonaService } from '../../../ModuloEmpleados/Service/persona.service';
import { BodegaResponsable, BodegaResponsableDetalle } from '../../Entidad/bodega-responsable.model';
import { BodegaResponse } from '../../Entidad/bodega.model';
import { PersonaEmpresa } from '../../Entidad/persona-empresa.model';
import { PersonaResponse } from '../../../ModuloEmpleados/Entidades/persona.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-bodega-responsable',
  standalone: false,
  templateUrl: './bodega-responsable.component.html',
  styleUrl: './bodega-responsable.component.css'
})
export class BodegaResponsableComponent implements OnInit {
  asignaciones: BodegaResponsableDetalle[] = [];
  asignacionesFiltradas: BodegaResponsableDetalle[] = [];
  bodegas: BodegaResponse[] = [];
  personasEmpresa: PersonaEmpresa[] = [];
  personas: PersonaResponse[] = [];
  asignacionForm: FormGroup;
  showModal = false;
  loading = false;
  searchTerm = '';

  constructor(
    private readonly bodegaResponsableService: BodegaResponsableService,
    private readonly bodegaService: BodegaService,
    private readonly personaEmpresaService: PersonaEmpresaService,
    private readonly personaService: PersonaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.asignacionForm = this.fb.group({
      bodegaId: ['', [Validators.required]],
      personaEmpresaId: ['', [Validators.required]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      asignaciones: this.bodegaResponsableService.findAll(),
      bodegas: this.bodegaService.findAll(),
      personasEmpresa: this.personaEmpresaService.findActivos(),
      personas: this.personaService.findAll()
    }).subscribe({
      next: (data) => {
        this.bodegas = data.bodegas;
        this.personasEmpresa = data.personasEmpresa;
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

  procesarAsignaciones(asignaciones: BodegaResponsable[]): BodegaResponsableDetalle[] {
    return asignaciones.map(asignacion => {
      const bodega = this.bodegas.find(b => b.id === asignacion.bodegaId);
      const personaEmpresa = this.personasEmpresa.find(pe => pe.id === asignacion.personaEmpresaId);
      const persona = personaEmpresa ? this.personas.find(p => p.id === personaEmpresa.personaId) : undefined;

      return {
        ...asignacion,
        bodegaNombre: bodega?.nombre,
        bodegaCodigo: bodega?.codigo,
        personaNombre: persona?.nombre,
        personaCedula: persona?.cedula
      };
    });
  }

  filtrarAsignaciones(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.asignacionesFiltradas = this.asignaciones.filter(asignacion =>
      asignacion.bodegaNombre?.toLowerCase().includes(term) ||
      asignacion.bodegaCodigo?.toLowerCase().includes(term) ||
      asignacion.personaNombre?.toLowerCase().includes(term) ||
      asignacion.personaCedula?.toLowerCase().includes(term)
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

  async asignarResponsable(): Promise<void> {
    if (this.asignacionForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos correctamente');
      return;
    }

    const asignacionData: BodegaResponsable = this.asignacionForm.value;

    this.bodegaResponsableService.save(asignacionData).subscribe({
      next: () => {
        this.notificationService.success('Responsable asignado', 'El responsable se asignó correctamente');
        this.cargarDatos();
        this.cerrarModal();
      },
      error: (error) => {
        this.notificationService.error('Error al asignar responsable', error.message);
      }
    });
  }

  async eliminarAsignacion(asignacion: BodegaResponsableDetalle): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar esta asignación?`
    );

    if (confirmed && asignacion.id) {
      this.bodegaResponsableService.delete(asignacion.id).subscribe({
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

  getPersonaNombre(personaEmpresa: PersonaEmpresa): string {
    const persona = this.personas.find(p => p.id === personaEmpresa.personaId);
    return persona ? persona.nombre : 'Desconocido';
  }
}

