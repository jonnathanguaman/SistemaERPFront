import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonaRolService } from '../../Service/persona-rol.service';
import { PersonaService } from '../../Service/persona.service';
import { RolAccesoService } from '../../Service/rol.service';
import { PersonaRolResponse, PersonaRolRequest, PersonaRolDetalle } from '../../Entidades/persona-rol.model';
import { PersonaResponse } from '../../Entidades/persona.model';
import { RolAccesoResponse } from '../../Entidades/rol.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-asignar-roles',
  standalone: false,
  templateUrl: './asignar-roles.component.html',
  styleUrl: './asignar-roles.component.css'
})
export class AsignarRolesComponent implements OnInit {
  
  asignaciones: PersonaRolDetalle[] = [];
  empleados: PersonaResponse[] = [];
  roles: RolAccesoResponse[] = [];
  
  asignacionForm: FormGroup;
  showModal: boolean = false;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly personaRolService: PersonaRolService,
    private readonly personaService: PersonaService,
    private readonly rolService: RolAccesoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.asignacionForm = this.formBuilder.group({
      personaId: ['', Validators.required],
      rolId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga todos los datos necesarios
   */
  cargarDatos(): void {
    this.loading = true;
    
    forkJoin({
      asignaciones: this.personaRolService.findAll(),
      empleados: this.personaService.findAll(),
      roles: this.rolService.findAll()
    }).subscribe({
      next: (data) => {
        this.empleados = data.empleados;
        this.roles = data.roles;
        this.procesarAsignaciones(data.asignaciones);
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar datos');
        this.loading = false;
      }
    });
  }

  /**
   * Procesa las asignaciones para mostrar información completa
   */
  procesarAsignaciones(asignaciones: PersonaRolResponse[]): void {
    this.asignaciones = asignaciones.map(asig => {
      const empleado = this.empleados.find(e => e.id === asig.personaId);
      const rol = this.roles.find(r => r.id === asig.rolId);
      
      return {
        id: asig.id,
        personaId: asig.personaId,
        personaNombre: empleado?.nombre || 'Desconocido',
        personaCedula: empleado?.cedula || 'N/A',
        rolId: asig.rolId,
        rolNombre: rol?.nombre || 'Desconocido',
        activo: asig.activo
      };
    });
  }

  /**
   * Filtra las asignaciones según el término de búsqueda
   */
  get asignacionesFiltradas(): PersonaRolDetalle[] {
    if (!this.searchTerm.trim()) {
      return this.asignaciones;
    }

    const term = this.searchTerm.toLowerCase();
    return this.asignaciones.filter(asig =>
      asig.personaNombre.toLowerCase().includes(term) ||
      asig.personaCedula.includes(term) ||
      asig.rolNombre.toLowerCase().includes(term)
    );
  }

  /**
   * Abre el modal para asignar un rol
   */
  abrirModalAsignar(): void {
    this.asignacionForm.reset();
    this.showModal = true;
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.showModal = false;
    this.asignacionForm.reset();
  }

  /**
   * Asigna un rol a un empleado
   */
  asignarRol(): void {
    if (this.asignacionForm.invalid) {
      this.asignacionForm.markAllAsTouched();
      this.notificationService.warning('Por favor, selecciona un empleado y un rol.');
      return;
    }

    this.loading = true;

    const request: PersonaRolRequest = {
      personaId: this.asignacionForm.value.personaId,
      rolId: this.asignacionForm.value.rolId
    };

    this.personaRolService.assignRol(request).subscribe({
      next: () => {
        this.notificationService.success('Rol asignado exitosamente');
        this.cargarDatos();
        this.cerrarModal();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(error.message, 'Error al asignar rol');
      }
    });
  }

  /**
   * Elimina una asignación de rol
   */
  async eliminarAsignacion(asignacion: PersonaRolDetalle): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Eliminar el rol "${asignacion.rolNombre}" de ${asignacion.personaNombre}?`,
      'Confirmar eliminación',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;

    this.personaRolService.delete(asignacion.id).subscribe({
      next: () => {
        this.notificationService.toast('Asignación eliminada exitosamente', 'success');
        this.cargarDatos();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  /**
   * Obtiene el nombre del empleado por ID
   */
  getNombreEmpleado(personaId: number): string {
    const empleado = this.empleados.find(e => e.id === personaId);
    return empleado?.nombre || 'Desconocido';
  }

  /**
   * Obtiene el nombre del rol por ID
   */
  getNombreRol(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol?.nombre || 'Desconocido';
  }

  /**
   * Verifica si un campo es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.asignacionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.asignacionForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    return '';
  }
}

