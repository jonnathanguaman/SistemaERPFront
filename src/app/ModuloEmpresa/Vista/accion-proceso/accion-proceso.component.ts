import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AccionProceso, AccionProcesoDetalle } from '../../Entidad/accion-proceso.model';
import { Proceso } from '../../Entidad/proceso.model';
import { AccionProcesoService } from '../../Service/accion-proceso.service';
import { ProcesoService } from '../../Service/proceso.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-accion-proceso',
  standalone: false,
  templateUrl: './accion-proceso.component.html',
  styleUrls: ['./accion-proceso.component.css']
})
export class AccionProcesoComponent implements OnInit {
  accionesProceso: AccionProcesoDetalle[] = [];
  accionesProcesoFiltradas: AccionProcesoDetalle[] = [];
  procesos: Proceso[] = [];
  accionProcesoForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  accionProcesoIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private accionProcesoService: AccionProcesoService,
    private procesoService: ProcesoService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.accionProcesoForm = this.fb.group({
      codigo: ['', Validators.required],
      procesoId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      acciones: this.accionProcesoService.findAll(),
      procesos: this.procesoService.findAll()
    }).subscribe({
      next: (data) => {
        this.procesos = data.procesos;
        this.accionesProceso = this.procesarAcciones(data.acciones);
        this.accionesProcesoFiltradas = this.accionesProceso;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  procesarAcciones(acciones: AccionProceso[]): AccionProcesoDetalle[] {
    return acciones.map(accion => {
      const proceso = this.procesos.find(p => p.id === accion.procesoId);
      return {
        ...accion,
        procesoNombre: proceso?.nombre,
        procesoCodigo: proceso?.codigo
      };
    });
  }

  filtrarAcciones(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.accionesProcesoFiltradas = this.accionesProceso.filter(accion =>
      accion.codigo.toLowerCase().includes(busquedaLower) ||
      (accion.procesoNombre && accion.procesoNombre.toLowerCase().includes(busquedaLower)) ||
      (accion.procesoCodigo && accion.procesoCodigo.toLowerCase().includes(busquedaLower))
    );
  }

  abrirModal(accionProceso?: AccionProceso): void {
    if (accionProceso) {
      this.modoEdicion = true;
      this.accionProcesoIdEditar = accionProceso.id || null;
      this.accionProcesoForm.patchValue({
        codigo: accionProceso.codigo,
        procesoId: accionProceso.procesoId
      });
    } else {
      this.modoEdicion = false;
      this.accionProcesoIdEditar = null;
      this.accionProcesoForm.reset();
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.accionProcesoForm.reset();
    this.modoEdicion = false;
    this.accionProcesoIdEditar = null;
  }

  async guardarAccionProceso(): Promise<void> {
    if (this.accionProcesoForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos');
      return;
    }

    const accionProceso: AccionProceso = this.accionProcesoForm.value;

    try {
      if (this.modoEdicion && this.accionProcesoIdEditar) {
        await this.accionProcesoService.update(this.accionProcesoIdEditar, accionProceso).toPromise();
        this.notificationService.showSuccess('Acción de proceso actualizada correctamente');
      } else {
        await this.accionProcesoService.save(accionProceso).toPromise();
        this.notificationService.showSuccess('Acción de proceso creada correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      this.notificationService.showError('Error al guardar la acción de proceso');
    }
  }

  async eliminarAccionProceso(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar esta acción de proceso?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await this.accionProcesoService.deleteById(id).toPromise();
        this.notificationService.showSuccess('Acción de proceso eliminada correctamente');
        this.cargarDatos();
      } catch (error) {
        this.notificationService.showError('Error al eliminar la acción de proceso');
      }
    }
  }
}
