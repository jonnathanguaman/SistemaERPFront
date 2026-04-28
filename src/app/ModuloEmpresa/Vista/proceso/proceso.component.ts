import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Proceso } from '../../Entidad/proceso.model';
import { ProcesoService } from '../../Service/proceso.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-proceso',
  standalone: false,
  templateUrl: './proceso.component.html',
  styleUrls: ['./proceso.component.css']
})
export class ProcesoComponent implements OnInit {
  procesos: Proceso[] = [];
  procesosFiltrados: Proceso[] = [];
  procesoForm: FormGroup;
  showForm = false;
  modoEdicion = false;
  procesoIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private procesoService: ProcesoService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.procesoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarProcesos();
  }

  cargarProcesos(): void {
    this.procesoService.findAll().subscribe({
      next: (data) => {
        this.procesos = data;
        this.procesosFiltrados = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los procesos');
      }
    });
  }

  filtrarProcesos(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.procesosFiltrados = this.procesos.filter(proceso =>
      proceso.codigo.toLowerCase().includes(busquedaLower) ||
      proceso.nombre.toLowerCase().includes(busquedaLower)
    );
  }

  abrirFormCrear(): void {
    this.modoEdicion = false;
    this.procesoIdEditar = null;
    this.procesoForm.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  abrirFormEditar(proceso: Proceso): void {
    this.modoEdicion = true;
    this.procesoIdEditar = proceso.id || null;
    this.procesoForm.patchValue({
      codigo: proceso.codigo,
      nombre: proceso.nombre
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  cerrarForm(): void {
    this.showForm = false;
    this.procesoForm.reset();
    this.modoEdicion = false;
    this.procesoIdEditar = null;
  }

  async guardarProceso(): Promise<void> {
    if (this.procesoForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos');
      return;
    }

    const proceso: Proceso = this.procesoForm.value;

    try {
      if (this.modoEdicion && this.procesoIdEditar) {
        await this.procesoService.update(this.procesoIdEditar, proceso).toPromise();
        this.notificationService.showSuccess('Proceso actualizado correctamente');
      } else {
        await this.procesoService.save(proceso).toPromise();
        this.notificationService.showSuccess('Proceso creado correctamente');
      }
      this.cargarProcesos();
      this.cerrarForm();
    } catch (error) {
      this.notificationService.showError('Error al guardar el proceso');
    }
  }

  async eliminarProceso(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar este proceso?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await this.procesoService.deleteById(id).toPromise();
        this.notificationService.showSuccess('Proceso eliminado correctamente');
        this.cargarProcesos();
      } catch (error) {
        this.notificationService.showError('Error al eliminar el proceso');
      }
    }
  }
}
