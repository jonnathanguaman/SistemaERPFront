import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReporteJerarquico, ReporteJerarquicoDetalle } from '../../Entidad/reporte-jerarquico.model';
import { PersonaEmpresa } from '../../Entidad/persona-empresa.model';
import { ReporteJerarquicoService } from '../../Service/reporte-jerarquico.service';
import { PersonaEmpresaService } from '../../Service/persona-empresa.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-reporte-jerarquico',
  standalone: false,
  templateUrl: './reporte-jerarquico.component.html',
  styleUrls: ['./reporte-jerarquico.component.css']
})
export class ReporteJerarquicoComponent implements OnInit {
  reportesJerarquicos: ReporteJerarquicoDetalle[] = [];
  reportesJerarquicosFiltrados: ReporteJerarquicoDetalle[] = [];
  personasEmpresa: PersonaEmpresa[] = [];
  reporteJerarquicoForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  reporteJerarquicoIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private reporteJerarquicoService: ReporteJerarquicoService,
    private personaEmpresaService: PersonaEmpresaService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.reporteJerarquicoForm = this.fb.group({
      subordinadoId: ['', Validators.required],
      jefeId: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      reportes: this.reporteJerarquicoService.findAll(),
      personasEmpresa: this.personaEmpresaService.findAll()
    }).subscribe({
      next: (data) => {
        this.personasEmpresa = data.personasEmpresa;
        this.reportesJerarquicos = data.reportes;
        this.reportesJerarquicosFiltrados = this.reportesJerarquicos;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  filtrarReportes(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.reportesJerarquicosFiltrados = this.reportesJerarquicos.filter(reporte =>
      (reporte.subordinadoNombre && reporte.subordinadoNombre.toLowerCase().includes(busquedaLower)) ||
      (reporte.subordinadoCedula && reporte.subordinadoCedula.toLowerCase().includes(busquedaLower)) ||
      (reporte.jefeNombre && reporte.jefeNombre.toLowerCase().includes(busquedaLower)) ||
      (reporte.jefeCedula && reporte.jefeCedula.toLowerCase().includes(busquedaLower))
    );
  }

  abrirModal(reporteJerarquico?: ReporteJerarquico): void {
    if (reporteJerarquico) {
      this.modoEdicion = true;
      this.reporteJerarquicoIdEditar = reporteJerarquico.id || null;
      this.reporteJerarquicoForm.patchValue({
        subordinadoId: reporteJerarquico.subordinadoId,
        jefeId: reporteJerarquico.jefeId,
        fechaInicio: reporteJerarquico.fechaInicio,
        fechaFin: reporteJerarquico.fechaFin,
        activo: reporteJerarquico.activo
      });
    } else {
      this.modoEdicion = false;
      this.reporteJerarquicoIdEditar = null;
      this.reporteJerarquicoForm.reset({ activo: true });
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reporteJerarquicoForm.reset({ activo: true });
    this.modoEdicion = false;
    this.reporteJerarquicoIdEditar = null;
  }

  async guardarReporteJerarquico(): Promise<void> {
    if (this.reporteJerarquicoForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const reporteJerarquico: ReporteJerarquico = this.reporteJerarquicoForm.value;

    try {
      if (this.modoEdicion && this.reporteJerarquicoIdEditar) {
        await this.reporteJerarquicoService.update(this.reporteJerarquicoIdEditar, reporteJerarquico).toPromise();
        this.notificationService.showSuccess('Reporte jerárquico actualizado correctamente');
      } else {
        await this.reporteJerarquicoService.save(reporteJerarquico).toPromise();
        this.notificationService.showSuccess('Reporte jerárquico creado correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      this.notificationService.showError('Error al guardar el reporte jerárquico');
    }
  }

  async eliminarReporteJerarquico(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar este reporte jerárquico?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await this.reporteJerarquicoService.deleteById(id).toPromise();
        this.notificationService.showSuccess('Reporte jerárquico eliminado correctamente');
        this.cargarDatos();
      } catch (error) {
        this.notificationService.showError('Error al eliminar el reporte jerárquico');
      }
    }
  }
}
