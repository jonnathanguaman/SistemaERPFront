import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { RolProcesoPermiso, RolProcesoPermisoDetalle } from '../../Entidad/rol-proceso-permiso.model';
import { RolEmpresa } from '../../Entidad/rol-empresa.model';
import { AccionProceso } from '../../Entidad/accion-proceso.model';
import { EmpresaResponse } from '../../Entidad/empresa.model';
import { Proceso } from '../../Entidad/proceso.model';
import { RolProcesoPermisoService } from '../../Service/rol-proceso-permiso.service';
import { RolEmpresaService } from '../../Service/rol-empresa.service';
import { AccionProcesoService } from '../../Service/accion-proceso.service';
import { EmpresaService } from '../../Service/empresa.service';
import { ProcesoService } from '../../Service/proceso.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-rol-proceso-permiso',
  standalone: false,
  templateUrl: './rol-proceso-permiso.component.html',
  styleUrls: ['./rol-proceso-permiso.component.css']
})
export class RolProcesoPermisoComponent implements OnInit {
  rolesProcesosPermisos: RolProcesoPermisoDetalle[] = [];
  rolesProcesoPermisosFiltrados: RolProcesoPermisoDetalle[] = [];
  rolesEmpresa: RolEmpresa[] = [];
  accionesProceso: AccionProceso[] = [];
  empresas: EmpresaResponse[] = [];
  procesos: Proceso[] = [];
  rolProcesoPermisoForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  rolProcesoPermisoIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private rolProcesoPermisoService: RolProcesoPermisoService,
    private rolEmpresaService: RolEmpresaService,
    private accionProcesoService: AccionProcesoService,
    private empresaService: EmpresaService,
    private procesoService: ProcesoService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.rolProcesoPermisoForm = this.fb.group({
      rolEmpresaId: ['', Validators.required],
      accionProcesoId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      permisos: this.rolProcesoPermisoService.findAll(),
      rolesEmpresa: this.rolEmpresaService.findAll(),
      accionesProceso: this.accionProcesoService.findAll(),
      empresas: this.empresaService.findAll(),
      procesos: this.procesoService.findAll()
    }).subscribe({
      next: (data) => {
        this.rolesEmpresa = data.rolesEmpresa;
        this.accionesProceso = data.accionesProceso;
        this.empresas = data.empresas;
        this.procesos = data.procesos;
        this.rolesProcesosPermisos = this.procesarPermisos(data.permisos);
        this.rolesProcesoPermisosFiltrados = this.rolesProcesosPermisos;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  procesarPermisos(permisos: RolProcesoPermiso[]): RolProcesoPermisoDetalle[] {
    return permisos.map(permiso => {
      const rolEmpresa = this.rolesEmpresa.find(re => re.id === permiso.rolEmpresaId);
      const accionProceso = this.accionesProceso.find(ap => ap.id === permiso.accionProcesoId);
      
      // Buscar empresa usando el empresaId del rol
      const empresa = rolEmpresa ? this.empresas.find(e => e.id === rolEmpresa.empresaId) : undefined;
      
      // Buscar proceso usando el procesoId de la acción
      const proceso = accionProceso ? this.procesos.find(p => p.id === accionProceso.procesoId) : undefined;
      
      return {
        ...permiso,
        rolNombre: rolEmpresa?.nombre,
        empresaNombre: empresa?.nombre,
        accionProcesoCodigo: accionProceso?.codigo,
        procesoNombre: proceso?.nombre
      };
    });
  }

  filtrarPermisos(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.rolesProcesoPermisosFiltrados = this.rolesProcesosPermisos.filter(permiso =>
      (permiso.rolNombre && permiso.rolNombre.toLowerCase().includes(busquedaLower)) ||
      (permiso.accionProcesoCodigo && permiso.accionProcesoCodigo.toLowerCase().includes(busquedaLower)) ||
      (permiso.empresaNombre && permiso.empresaNombre.toLowerCase().includes(busquedaLower)) ||
      (permiso.procesoNombre && permiso.procesoNombre.toLowerCase().includes(busquedaLower))
    );
  }

  abrirModal(rolProcesoPermiso?: RolProcesoPermiso): void {
    if (rolProcesoPermiso) {
      this.modoEdicion = true;
      this.rolProcesoPermisoIdEditar = rolProcesoPermiso.id || null;
      this.rolProcesoPermisoForm.patchValue({
        rolEmpresaId: rolProcesoPermiso.rolEmpresaId,
        accionProcesoId: rolProcesoPermiso.accionProcesoId
      });
    } else {
      this.modoEdicion = false;
      this.rolProcesoPermisoIdEditar = null;
      this.rolProcesoPermisoForm.reset();
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.rolProcesoPermisoForm.reset();
    this.modoEdicion = false;
    this.rolProcesoPermisoIdEditar = null;
  }

  async guardarRolProcesoPermiso(): Promise<void> {
    if (this.rolProcesoPermisoForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos');
      return;
    }

    const rolProcesoPermiso: RolProcesoPermiso = this.rolProcesoPermisoForm.value;

    try {
      if (this.modoEdicion && this.rolProcesoPermisoIdEditar) {
        await this.rolProcesoPermisoService.update(this.rolProcesoPermisoIdEditar, rolProcesoPermiso).toPromise();
        this.notificationService.showSuccess('Permiso actualizado correctamente');
      } else {
        await this.rolProcesoPermisoService.save(rolProcesoPermiso).toPromise();
        this.notificationService.showSuccess('Permiso creado correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      this.notificationService.showError('Error al guardar el permiso');
    }
  }

  async eliminarRolProcesoPermiso(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar este permiso?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await this.rolProcesoPermisoService.deleteById(id).toPromise();
        this.notificationService.showSuccess('Permiso eliminado correctamente');
        this.cargarDatos();
      } catch (error) {
        this.notificationService.showError('Error al eliminar el permiso');
      }
    }
  }
}
