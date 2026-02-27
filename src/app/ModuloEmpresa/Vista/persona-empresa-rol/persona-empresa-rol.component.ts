import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, lastValueFrom } from 'rxjs';
import { PersonaEmpresaRol, PersonaEmpresaRolDetalle } from '../../Entidad/persona-empresa-rol.model';
import { PersonaEmpresa } from '../../Entidad/persona-empresa.model';
import { RolEmpresa } from '../../Entidad/rol-empresa.model';
import { PersonaEmpresaRolService } from '../../Service/persona-empresa-rol.service';
import { PersonaEmpresaService } from '../../Service/persona-empresa.service';
import { RolEmpresaService } from '../../Service/rol-empresa.service';
import { PersonaService } from '../../../ModuloEmpleados/Service/persona.service';
import { EmpresaService } from '../../Service/empresa.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PersonaResponse } from '../../../ModuloEmpleados/Entidades/persona.model';
import { EmpresaResponse } from '../../Entidad/empresa.model';

@Component({
  selector: 'app-persona-empresa-rol',
  standalone: false,
  templateUrl: './persona-empresa-rol.component.html',
  styleUrls: ['./persona-empresa-rol.component.css']
})
export class PersonaEmpresaRolComponent implements OnInit {
  personasEmpresaRoles: PersonaEmpresaRolDetalle[] = [];
  personasEmpresaRolesFiltradas: PersonaEmpresaRolDetalle[] = [];
  personasEmpresa: PersonaEmpresa[] = [];
  rolesEmpresa: RolEmpresa[] = [];
  personas: PersonaResponse[] = [];
  empresas: EmpresaResponse[] = [];
  personaEmpresaRolForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  personaEmpresaRolIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private readonly personaEmpresaRolService: PersonaEmpresaRolService,
    private readonly personaEmpresaService: PersonaEmpresaService,
    private readonly rolEmpresaService: RolEmpresaService,
    private readonly personaService: PersonaService,
    private readonly empresaService: EmpresaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.personaEmpresaRolForm = this.fb.group({
      personaEmpresaId: ['', Validators.required],
      rolEmpresaId: ['', Validators.required],
      fechaAsignacion: ['', Validators.required],
      fechaFin: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      asignaciones: this.personaEmpresaRolService.findAll(),
      personasEmpresa: this.personaEmpresaService.findAll(),
      rolesEmpresa: this.rolEmpresaService.findAll(),
      personas: this.personaService.findAll(),
      empresas: this.empresaService.findAll()
    }).subscribe({
      next: (data) => {
        this.personasEmpresa = data.personasEmpresa;
        this.rolesEmpresa = data.rolesEmpresa;
        this.personas = data.personas;
        this.empresas = data.empresas;
        this.personasEmpresaRoles = this.procesarAsignaciones(data.asignaciones);
        this.personasEmpresaRolesFiltradas = this.personasEmpresaRoles;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  procesarAsignaciones(asignaciones: PersonaEmpresaRol[]): PersonaEmpresaRolDetalle[] {
    return asignaciones.map(asignacion => {
      const personaEmpresa = this.personasEmpresa.find(pe => pe.id === asignacion.personaEmpresaId);
      const rolEmpresa = this.rolesEmpresa.find(re => re.id === asignacion.rolEmpresaId);
      
      // Obtener datos de persona y empresa
      let personaNombre = 'N/A';
      let personaCedula = '';
      let empresaNombre = 'N/A';
      
      if (personaEmpresa) {
        const persona = this.personas.find(p => p.id === personaEmpresa.personaId);
        const empresa = this.empresas.find(e => e.id === personaEmpresa.empresaId);
        
        if (persona) {
          personaNombre = persona.nombre;
          personaCedula = persona.cedula;
        }
        
        if (empresa) {
          empresaNombre = empresa.nombre;
        }
      }
      
      return {
        ...asignacion,
        personaNombre,
        personaCedula,
        empresaNombre,
        rolNombre: rolEmpresa?.nombre
      };
    });
  }

  filtrarAsignaciones(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.personasEmpresaRolesFiltradas = this.personasEmpresaRoles.filter(asignacion =>
      asignacion.personaNombre?.toLowerCase().includes(busquedaLower) ||
      asignacion.personaCedula?.toLowerCase().includes(busquedaLower) ||
      asignacion.empresaNombre?.toLowerCase().includes(busquedaLower) ||
      asignacion.rolNombre?.toLowerCase().includes(busquedaLower)
    );
  }

  abrirModal(personaEmpresaRol?: PersonaEmpresaRol): void {
    if (personaEmpresaRol) {
      this.modoEdicion = true;
      this.personaEmpresaRolIdEditar = personaEmpresaRol.id || null;
      this.personaEmpresaRolForm.patchValue({
        personaEmpresaId: personaEmpresaRol.personaEmpresaId,
        rolEmpresaId: personaEmpresaRol.rolEmpresaId,
        fechaAsignacion: personaEmpresaRol.fechaAsignacion,
        fechaFin: personaEmpresaRol.fechaFin,
        activo: personaEmpresaRol.activo
      });
    } else {
      this.modoEdicion = false;
      this.personaEmpresaRolIdEditar = null;
      this.personaEmpresaRolForm.reset({ activo: true });
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.personaEmpresaRolForm.reset({ activo: true });
    this.modoEdicion = false;
    this.personaEmpresaRolIdEditar = null;
  }

  async guardarPersonaEmpresaRol(): Promise<void> {
    if (this.personaEmpresaRolForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const personaEmpresaRol: PersonaEmpresaRol = this.personaEmpresaRolForm.value;

    try {
      if (this.modoEdicion && this.personaEmpresaRolIdEditar) {
        await lastValueFrom(this.personaEmpresaRolService.update(this.personaEmpresaRolIdEditar, personaEmpresaRol));
        this.notificationService.showSuccess('Asignación de rol actualizada correctamente');
      } else {
        await lastValueFrom(this.personaEmpresaRolService.save(personaEmpresaRol));
        this.notificationService.showSuccess('Asignación de rol creada correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error al guardar:', message);
      this.notificationService.showError('Error al guardar la asignación de rol');
    }
  }

  async eliminarPersonaEmpresaRol(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar esta asignación de rol?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await lastValueFrom(this.personaEmpresaRolService.deleteById(id));
        this.notificationService.showSuccess('Asignación de rol eliminada correctamente');
        this.cargarDatos();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al eliminar:', message);
        this.notificationService.showError('Error al eliminar la asignación de rol');
      }
    }
  }
}
