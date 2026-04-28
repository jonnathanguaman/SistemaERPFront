import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ListaIvaResponse } from '../../Entidad/lista-iva.model';
import { ListaIvaService } from '../../Service/lista-iva.service';
import { NotificationService } from '../../../Compartido/services/notification.service';

interface ListaIvaRequest {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoIva: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo: boolean;
}

@Component({
  selector: 'app-lista-iva',
  standalone: false,
  templateUrl: './lista-iva.component.html',
  styleUrl: './lista-iva.component.css'
})
export class ListaIvaComponent implements OnInit {
  listasIva: ListaIvaResponse[] = [];
  listasIvaFiltradas: ListaIvaResponse[] = [];
  listaIvaForm: FormGroup;
  showForm = false;
  modoEdicion = false;
  listaIvaIdEditar: number | null = null;
  busqueda = '';
  cargando = false;

  constructor(
    private readonly listaIvaService: ListaIvaService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.listaIvaForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(1)]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      tipoIva: ['', Validators.required],
      fechaVigenciaDesde: ['', Validators.required],
      fechaVigenciaHasta: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.listaIvaService.findAll().subscribe({
      next: (data) => {
        this.listasIva = data;
        this.listasIvaFiltradas = data;
        this.cargando = false;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar las listas de IVA');
        this.cargando = false;
      }
    });
  }

  filtrarListasIva(): void {
    const busquedaLower = this.busqueda.toLowerCase().trim();

    if (!busquedaLower) {
      this.listasIvaFiltradas = [...this.listasIva];
      return;
    }

    this.listasIvaFiltradas = this.listasIva.filter(lista => {
      return lista.codigo.toLowerCase().includes(busquedaLower)
        || lista.nombre.toLowerCase().includes(busquedaLower)
        || (lista.descripcion || '').toLowerCase().includes(busquedaLower)
        || (lista.tipoIva || '').toLowerCase().includes(busquedaLower);
    });
  }

  abrirFormCrear(): void {
    this.modoEdicion = false;
    this.listaIvaIdEditar = null;
    this.listaIvaForm.reset({
      activo: true,
      fechaVigenciaDesde: new Date().toISOString().slice(0, 10)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  abrirFormEditar(listaIva: ListaIvaResponse): void {
    this.modoEdicion = true;
    this.listaIvaIdEditar = listaIva.id;
    this.listaIvaForm.patchValue({
      codigo: listaIva.codigo,
      nombre: listaIva.nombre,
      descripcion: listaIva.descripcion || '',
      tipoIva: listaIva.tipoIva,
      fechaVigenciaDesde: this.normalizarFecha(listaIva.fechaVigenciaDesde || null),
      fechaVigenciaHasta: this.normalizarFecha(listaIva.fechaVigenciaHasta || null),
      activo: listaIva.activo
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  cerrarForm(): void {
    this.showForm = false;
    this.listaIvaForm.reset();
    this.modoEdicion = false;
    this.listaIvaIdEditar = null;
  }

  guardarListaIva(): void {
    if (!this.listaIvaForm.valid) {
      this.notificationService.showWarning('Por favor completa los campos requeridos');
      return;
    }

    const formValue = this.listaIvaForm.value;
    const payload: ListaIvaRequest = {
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || '',
      tipoIva: formValue.tipoIva,
      fechaVigenciaDesde: formValue.fechaVigenciaDesde,
      fechaVigenciaHasta: formValue.fechaVigenciaHasta || null,
      activo: formValue.activo
    };

    if (this.modoEdicion && this.listaIvaIdEditar) {
      this.listaIvaService.update(this.listaIvaIdEditar, payload).subscribe({
        next: () => {
          this.notificationService.showSuccess('Lista IVA actualizada correctamente');
          this.cerrarForm();
          this.cargarDatos();
        },
        error: () => {
          this.notificationService.showError('Error al actualizar la lista IVA');
        }
      });
    } else {
      this.listaIvaService.save(payload).subscribe({
        next: () => {
          this.notificationService.showSuccess('Lista IVA creada correctamente');
          this.cerrarForm();
          this.cargarDatos();
        },
        error: () => {
          this.notificationService.showError('Error al crear la lista IVA');
        }
      });
    }
  }

  eliminarListaIva(listaIva: ListaIvaResponse): void {
    this.notificationService.confirm(
      `¿Deseas eliminar la lista IVA "${listaIva.nombre}"?`,
      '¿Estás seguro?'
    ).then((confirmed) => {
      if (confirmed) {
        this.listaIvaService.deleteById(listaIva.id).subscribe({
          next: () => {
            this.notificationService.showSuccess('Lista IVA eliminada correctamente');
            this.cargarDatos();
          },
          error: () => {
            this.notificationService.showError('Error al eliminar la lista IVA');
          }
        });
      }
    });
  }

  normalizarFecha(fecha: string | Date | null): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().slice(0, 10);
  }

  obtenerEstadoVigencia(listaIva: ListaIvaResponse): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const desde = new Date(listaIva.fechaVigenciaDesde);
    desde.setHours(0, 0, 0, 0);

    const hasta = listaIva.fechaVigenciaHasta ? new Date(listaIva.fechaVigenciaHasta) : null;
    if (hasta) hasta.setHours(23, 59, 59, 999);

    if (hoy < desde) return 'Próxima';
    if (hasta && hoy > hasta) return 'Vencida';
    return 'Vigente';
  }

  obtenerClaseEstado(listaIva: ListaIvaResponse): string {
    const estado = this.obtenerEstadoVigencia(listaIva);
    if (estado === 'Vigente') return 'badge-success';
    if (estado === 'Vencida') return 'badge-danger';
    return 'badge-warning';
  }
}
