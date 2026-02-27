import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { RolEmpresa, RolEmpresaDetalle } from '../../Entidad/rol-empresa.model';
import { EmpresaResponse } from '../../Entidad/empresa.model';
import { RolEmpresaService } from '../../Service/rol-empresa.service';
import { EmpresaService } from '../../Service/empresa.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-rol-empresa',
  standalone: false,
  templateUrl: './rol-empresa.component.html',
  styleUrls: ['./rol-empresa.component.css']
})
export class RolEmpresaComponent implements OnInit {
  rolesEmpresa: RolEmpresaDetalle[] = [];
  rolesEmpresaFiltrados: RolEmpresaDetalle[] = [];
  empresas: EmpresaResponse[] = [];
  rolEmpresaForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  rolEmpresaIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private rolEmpresaService: RolEmpresaService,
    private empresaService: EmpresaService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.rolEmpresaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      empresaId: ['', Validators.required],
      rolPadreId: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      roles: this.rolEmpresaService.findAll(),
      empresas: this.empresaService.findAll()
    }).subscribe({
      next: (data) => {
        this.empresas = data.empresas;
        this.rolesEmpresa = this.procesarRoles(data.roles);
        this.rolesEmpresaFiltrados = this.rolesEmpresa;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  procesarRoles(roles: RolEmpresa[]): RolEmpresaDetalle[] {
    return roles.map(rol => {
      const empresa = this.empresas.find(e => e.id === rol.empresaId);
      const rolPadre = roles.find(r => r.id === rol.rolPadreId);
      return {
        ...rol,
        empresaNombre: empresa?.nombre,
        empresaNit: empresa?.nit,
        rolPadreNombre: rolPadre?.nombre
      };
    });
  }

  filtrarRoles(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.rolesEmpresaFiltrados = this.rolesEmpresa.filter(rol =>
      rol.nombre.toLowerCase().includes(busquedaLower) ||
      (rol.descripcion && rol.descripcion.toLowerCase().includes(busquedaLower)) ||
      (rol.empresaNombre && rol.empresaNombre.toLowerCase().includes(busquedaLower))
    );
  }

  abrirModal(rolEmpresa?: RolEmpresa): void {
    if (rolEmpresa) {
      this.modoEdicion = true;
      this.rolEmpresaIdEditar = rolEmpresa.id || null;
      this.rolEmpresaForm.patchValue({
        nombre: rolEmpresa.nombre,
        descripcion: rolEmpresa.descripcion,
        empresaId: rolEmpresa.empresaId,
        rolPadreId: rolEmpresa.rolPadreId
      });
    } else {
      this.modoEdicion = false;
      this.rolEmpresaIdEditar = null;
      this.rolEmpresaForm.reset();
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.rolEmpresaForm.reset();
    this.modoEdicion = false;
    this.rolEmpresaIdEditar = null;
  }

  async guardarRolEmpresa(): Promise<void> {
    if (this.rolEmpresaForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const rolEmpresa: RolEmpresa = this.rolEmpresaForm.value;

    try {
      if (this.modoEdicion && this.rolEmpresaIdEditar) {
        await this.rolEmpresaService.update(this.rolEmpresaIdEditar, rolEmpresa).toPromise();
        this.notificationService.showSuccess('Rol actualizado correctamente');
      } else {
        await this.rolEmpresaService.save(rolEmpresa).toPromise();
        this.notificationService.showSuccess('Rol creado correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      this.notificationService.showError('Error al guardar el rol');
    }
  }

  async eliminarRolEmpresa(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar este rol?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await this.rolEmpresaService.deleteById(id).toPromise();
        this.notificationService.showSuccess('Rol eliminado correctamente');
        this.cargarDatos();
      } catch (error) {
        this.notificationService.showError('Error al eliminar el rol');
      }
    }
  }
}
