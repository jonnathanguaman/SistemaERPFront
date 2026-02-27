import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ListaPreciosRequest, ListaPreciosResponse, TipoLista } from '../../Entidad/lista-precios.model';
import { ListaPreciosService } from '../../Service/lista-precios.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-lista-precios',
  standalone: false,
  templateUrl: './lista-precios.component.html',
  styleUrl: './lista-precios.component.css'
})
export class ListaPreciosComponent implements OnInit {
  listasPrecios: ListaPreciosResponse[] = [];
  listasPreciosFiltradas: ListaPreciosResponse[] = [];
  listaPreciosForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  listaPreciosIdEditar: number | null = null;
  busqueda = '';
  tiposLista = Object.values(TipoLista);

  constructor(
    private readonly listaPreciosService: ListaPreciosService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.listaPreciosForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      tipoLista: ['PUBLICO'],
      monedaId: [1, Validators.required],
      fechaVigenciaDesde: ['', Validators.required],
      fechaVigenciaHasta: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.listaPreciosService.findAll().subscribe({
      next: (data) => {
        this.listasPrecios = data;
        this.listasPreciosFiltradas = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar las listas de precios');
      }
    });
  }

  filtrarListasPrecios(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.listasPreciosFiltradas = this.listasPrecios.filter(lista =>
      lista.codigo.toLowerCase().includes(busquedaLower) ||
      lista.nombre.toLowerCase().includes(busquedaLower) ||
      lista.tipoLista.toLowerCase().includes(busquedaLower) ||
      lista.descripcion?.toLowerCase().includes(busquedaLower)
    );
  }

  abrirModal(listaPrecios?: ListaPreciosResponse): void {
    if (listaPrecios) {
      this.modoEdicion = true;
      this.listaPreciosIdEditar = listaPrecios.id;
      this.listaPreciosForm.patchValue({
        codigo: listaPrecios.codigo,
        nombre: listaPrecios.nombre,
        descripcion: listaPrecios.descripcion,
        tipoLista: listaPrecios.tipoLista,
        monedaId: listaPrecios.monedaId,
        fechaVigenciaDesde: listaPrecios.fechaVigenciaDesde,
        fechaVigenciaHasta: listaPrecios.fechaVigenciaHasta,
        activo: listaPrecios.activo
      });
    } else {
      this.modoEdicion = false;
      this.listaPreciosIdEditar = null;
      this.listaPreciosForm.reset({ activo: true, tipoLista: 'PUBLICO', monedaId: 1 });
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.listaPreciosForm.reset({ activo: true, tipoLista: 'PUBLICO', monedaId: 1 });
    this.modoEdicion = false;
    this.listaPreciosIdEditar = null;
  }

  async guardarListaPrecios(): Promise<void> {
    if (this.listaPreciosForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const listaPrecios: ListaPreciosRequest = this.listaPreciosForm.value;

    try {
      if (this.modoEdicion && this.listaPreciosIdEditar) {
        await lastValueFrom(this.listaPreciosService.update(this.listaPreciosIdEditar, listaPrecios));
        this.notificationService.showSuccess('Lista de precios actualizada correctamente');
      } else {
        await lastValueFrom(this.listaPreciosService.save(listaPrecios));
        this.notificationService.showSuccess('Lista de precios creada correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar la lista de precios:', error);
      this.notificationService.showError('Error al guardar la lista de precios');
    }
  }

  async eliminarListaPrecios(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar esta lista de precios?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await lastValueFrom(this.listaPreciosService.deleteById(id));
        this.notificationService.showSuccess('Lista de precios eliminada correctamente');
        this.cargarDatos();
      } catch (error) {
        console.error('Error al eliminar la lista de precios:', error);
        this.notificationService.showError('Error al eliminar la lista de precios');
      }
    }
  }
}
