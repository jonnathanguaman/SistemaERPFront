import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { TipoClienteRequest, TipoClienteResponse } from '../../Entidad/tipo-cliente.model';
import { TipoClienteService } from '../../Service/tipo-cliente.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-tipo-cliente',
  standalone: false,
  templateUrl: './tipo-cliente.component.html',
  styleUrl: './tipo-cliente.component.css'
})
export class TipoClienteComponent implements OnInit {
  tiposCliente: TipoClienteResponse[] = [];
  tiposClienteFiltrados: TipoClienteResponse[] = [];
  tipoClienteForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  tipoClienteIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private readonly tipoClienteService: TipoClienteService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.tipoClienteForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.tipoClienteService.findAll().subscribe({
      next: (data) => {
        this.tiposCliente = data;
        this.tiposClienteFiltrados = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los tipos de cliente');
      }
    });
  }

  filtrarTiposCliente(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.tiposClienteFiltrados = this.tiposCliente.filter(tipo =>
      tipo.codigo.toLowerCase().includes(busquedaLower) ||
      tipo.nombre.toLowerCase().includes(busquedaLower) ||
      tipo.descripcion?.toLowerCase().includes(busquedaLower)
    );
  }

  abrirModal(tipoCliente?: TipoClienteResponse): void {
    if (tipoCliente) {
      this.modoEdicion = true;
      this.tipoClienteIdEditar = tipoCliente.id;
      this.tipoClienteForm.patchValue({
        codigo: tipoCliente.codigo,
        nombre: tipoCliente.nombre,
        descripcion: tipoCliente.descripcion,
        activo: tipoCliente.activo
      });
    } else {
      this.modoEdicion = false;
      this.tipoClienteIdEditar = null;
      this.tipoClienteForm.reset({ activo: true });
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.tipoClienteForm.reset({ activo: true });
    this.modoEdicion = false;
    this.tipoClienteIdEditar = null;
  }

  async guardarTipoCliente(): Promise<void> {
    if (this.tipoClienteForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const tipoCliente: TipoClienteRequest = this.tipoClienteForm.value;

    try {
      if (this.modoEdicion && this.tipoClienteIdEditar) {
        await lastValueFrom(this.tipoClienteService.update(this.tipoClienteIdEditar, tipoCliente));
        this.notificationService.showSuccess('Tipo de cliente actualizado correctamente');
      } else {
        await lastValueFrom(this.tipoClienteService.save(tipoCliente));
        this.notificationService.showSuccess('Tipo de cliente creado correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar el tipo de cliente:', error);
      this.notificationService.showError('Error al guardar el tipo de cliente');
    }
  }

  async eliminarTipoCliente(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar este tipo de cliente?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await lastValueFrom(this.tipoClienteService.deleteById(id));
        this.notificationService.showSuccess('Tipo de cliente eliminado correctamente');
        this.cargarDatos();
      } catch (error) {
        console.error('Error al eliminar el tipo de cliente:', error);
        this.notificationService.showError('Error al eliminar el tipo de cliente');
      }
    }
  }
}
