import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UnidadOrganizacional, UnidadOrganizacionalDetalle } from '../../Entidad/unidad-organizacional.model';
import { EmpresaResponse } from '../../Entidad/empresa.model';
import { UnidadOrganizacionalService } from '../../Service/unidad-organizacional.service';
import { EmpresaService } from '../../Service/empresa.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-unidad-organizacional',
  standalone: false,
  templateUrl: './unidad-organizacional.component.html',
  styleUrls: ['./unidad-organizacional.component.css']
})
export class UnidadOrganizacionalComponent implements OnInit {
  unidadesOrganizacionales: UnidadOrganizacionalDetalle[] = [];
  unidadesOrganizacionalesFiltradas: UnidadOrganizacionalDetalle[] = [];
  empresas: EmpresaResponse[] = [];
  unidadOrganizacionalForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  unidadOrganizacionalIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private unidadOrganizacionalService: UnidadOrganizacionalService,
    private empresaService: EmpresaService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.unidadOrganizacionalForm = this.fb.group({
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      empresaId: ['', Validators.required],
      unidadPadreId: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      unidades: this.unidadOrganizacionalService.findAll(),
      empresas: this.empresaService.findAll()
    }).subscribe({
      next: (data) => {
        this.empresas = data.empresas;
        this.unidadesOrganizacionales = this.procesarUnidades(data.unidades);
        this.unidadesOrganizacionalesFiltradas = this.unidadesOrganizacionales;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  procesarUnidades(unidades: UnidadOrganizacional[]): UnidadOrganizacionalDetalle[] {
    return unidades.map(unidad => {
      const empresa = this.empresas.find(e => e.id === unidad.empresaId);
      const unidadPadre = unidades.find(u => u.id === unidad.unidadPadreId);
      return {
        ...unidad,
        empresaNombre: empresa?.nombre,
        unidadPadreNombre: unidadPadre?.nombre
      };
    });
  }

  filtrarUnidades(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.unidadesOrganizacionalesFiltradas = this.unidadesOrganizacionales.filter(unidad =>
      unidad.nombre.toLowerCase().includes(busquedaLower) ||
      unidad.tipo.toLowerCase().includes(busquedaLower) ||
      (unidad.empresaNombre && unidad.empresaNombre.toLowerCase().includes(busquedaLower))
    );
  }

  abrirModal(unidadOrganizacional?: UnidadOrganizacional): void {
    if (unidadOrganizacional) {
      this.modoEdicion = true;
      this.unidadOrganizacionalIdEditar = unidadOrganizacional.id || null;
      this.unidadOrganizacionalForm.patchValue({
        nombre: unidadOrganizacional.nombre,
        tipo: unidadOrganizacional.tipo,
        empresaId: unidadOrganizacional.empresaId,
        unidadPadreId: unidadOrganizacional.unidadPadreId
      });
    } else {
      this.modoEdicion = false;
      this.unidadOrganizacionalIdEditar = null;
      this.unidadOrganizacionalForm.reset();
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.unidadOrganizacionalForm.reset();
    this.modoEdicion = false;
    this.unidadOrganizacionalIdEditar = null;
  }

  async guardarUnidadOrganizacional(): Promise<void> {
    if (this.unidadOrganizacionalForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const unidadOrganizacional: UnidadOrganizacional = this.unidadOrganizacionalForm.value;

    try {
      if (this.modoEdicion && this.unidadOrganizacionalIdEditar) {
        await this.unidadOrganizacionalService.update(this.unidadOrganizacionalIdEditar, unidadOrganizacional).toPromise();
        this.notificationService.showSuccess('Unidad organizacional actualizada correctamente');
      } else {
        await this.unidadOrganizacionalService.save(unidadOrganizacional).toPromise();
        this.notificationService.showSuccess('Unidad organizacional creada correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      this.notificationService.showError('Error al guardar la unidad organizacional');
    }
  }

  async eliminarUnidadOrganizacional(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar esta unidad organizacional?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await this.unidadOrganizacionalService.deleteById(id).toPromise();
        this.notificationService.showSuccess('Unidad organizacional eliminada correctamente');
        this.cargarDatos();
      } catch (error) {
        this.notificationService.showError('Error al eliminar la unidad organizacional');
      }
    }
  }
}
