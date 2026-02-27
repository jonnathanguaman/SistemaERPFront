import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PermisoDirectoPersonal, PermisoDirectoPersonalDetalle } from '../../Entidad/permiso-directo-personal.model';
import { PersonaEmpresa, PersonaEmpresaDetalle } from '../../Entidad/persona-empresa.model';
import { AccionProceso } from '../../Entidad/accion-proceso.model';
import { PermisoDirectoPersonalService } from '../../Service/permiso-directo-personal.service';
import { PersonaEmpresaService } from   '../../Service/persona-empresa.service';
import { AccionProcesoService } from '../../Service/accion-proceso.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PersonaService } from '../../../ModuloEmpleados/Service/persona.service';
import { EmpresaService } from '../../Service/empresa.service';
import { PersonaResponse } from '../../../ModuloEmpleados/Entidades/persona.model';
import { EmpresaResponse } from '../../Entidad/empresa.model';

@Component({
  selector: 'app-permiso-directo-personal',
  standalone: false,
  templateUrl: './permiso-directo-personal.component.html',
  styleUrls: ['./permiso-directo-personal.component.css']
})
export class PermisoDirectoPersonalComponent implements OnInit {
  permisosDirectos: PermisoDirectoPersonalDetalle[] = [];
  permisosDirectosFiltrados: PermisoDirectoPersonalDetalle[] = [];
  personasEmpresa: PersonaEmpresaDetalle[] = [];
  accionesProceso: AccionProceso[] = [];
  personas: PersonaResponse[] = [];
  empresas: EmpresaResponse[] = [];
  permisoDirectoForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  permisoDirectoIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private permisoDirectoPersonalService: PermisoDirectoPersonalService,
    private personaEmpresaService: PersonaEmpresaService,
    private accionProcesoService: AccionProcesoService,
    private personaService: PersonaService,
    private empresaService: EmpresaService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.permisoDirectoForm = this.fb.group({
      personaEmpresaId: ['', Validators.required],
      accionProcesoId: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      permisos: this.permisoDirectoPersonalService.findAll(),
      personasEmpresa: this.personaEmpresaService.findAll(),
      accionesProceso: this.accionProcesoService.findAll(),
      personas: this.personaService.findAll(),
      empresas: this.empresaService.findAll()
    }).subscribe({
      next: (data) => {
        this.personas = data.personas;
        this.empresas = data.empresas;
        this.accionesProceso = data.accionesProceso;
        this.personasEmpresa = this.procesarPersonasEmpresa(data.personasEmpresa);
        this.permisosDirectos = this.procesarPermisos(data.permisos);
        this.permisosDirectosFiltrados = this.permisosDirectos;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  procesarPersonasEmpresa(personasEmpresa: PersonaEmpresa[]): PersonaEmpresaDetalle[] {
    return personasEmpresa.map(pe => {
      const persona = this.personas.find(p => p.id === pe.personaId);
      const empresa = this.empresas.find(e => e.id === pe.empresaId);
      return {
        ...pe,
        personaNombre: persona?.nombre,
        personaCedula: persona?.cedula,
        empresaNombre: empresa?.nombre,
        empresaNit: empresa?.nit
      };
    });
  }

  procesarPermisos(permisos: PermisoDirectoPersonal[]): PermisoDirectoPersonalDetalle[] {
    return permisos.map(permiso => {
      const personaEmpresa = this.personasEmpresa.find(pe => pe.id === permiso.personaEmpresaId);
      const accionProceso = this.accionesProceso.find(ap => ap.id === permiso.accionProcesoId);
      return {
        ...permiso,
        personaNombre: personaEmpresa?.personaNombre,
        personaCedula: personaEmpresa?.personaCedula,
        empresaNombre: personaEmpresa?.empresaNombre,
        accionProcesoCodigo: accionProceso?.codigo,
        procesoNombre: (accionProceso as any)?.proceso?.nombre
      };
    });
  }

  filtrarPermisos(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.permisosDirectosFiltrados = this.permisosDirectos.filter(permiso =>
      (permiso.personaNombre && permiso.personaNombre.toLowerCase().includes(busquedaLower)) ||
      (permiso.personaCedula && permiso.personaCedula.toLowerCase().includes(busquedaLower)) ||
      (permiso.accionProcesoCodigo && permiso.accionProcesoCodigo.toLowerCase().includes(busquedaLower))
    );
  }

  abrirModal(permisoDirecto?: PermisoDirectoPersonal): void {
    if (permisoDirecto) {
      this.modoEdicion = true;
      this.permisoDirectoIdEditar = permisoDirecto.id || null;
      this.permisoDirectoForm.patchValue({
        personaEmpresaId: permisoDirecto.personaEmpresaId,
        accionProcesoId: permisoDirecto.accionProcesoId,
        fechaInicio: permisoDirecto.fechaInicio,
        fechaFin: permisoDirecto.fechaFin
      });
    } else {
      this.modoEdicion = false;
      this.permisoDirectoIdEditar = null;
      this.permisoDirectoForm.reset();
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.permisoDirectoForm.reset();
    this.modoEdicion = false;
    this.permisoDirectoIdEditar = null;
  }

  async guardarPermisoDirecto(): Promise<void> {
    if (this.permisoDirectoForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const permisoDirecto: PermisoDirectoPersonal = this.permisoDirectoForm.value;

    try {
      if (this.modoEdicion && this.permisoDirectoIdEditar) {
        await this.permisoDirectoPersonalService.update(this.permisoDirectoIdEditar, permisoDirecto).toPromise();
        this.notificationService.showSuccess('Permiso directo actualizado correctamente');
      } else {
        await this.permisoDirectoPersonalService.save(permisoDirecto).toPromise();
        this.notificationService.showSuccess('Permiso directo creado correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      this.notificationService.showError('Error al guardar el permiso directo');
    }
  }

  async eliminarPermisoDirecto(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar este permiso directo?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await this.permisoDirectoPersonalService.deleteById(id).toPromise();
        this.notificationService.showSuccess('Permiso directo eliminado correctamente');
        this.cargarDatos();
      } catch (error) {
        this.notificationService.showError('Error al eliminar el permiso directo');
      }
    }
  }
}
