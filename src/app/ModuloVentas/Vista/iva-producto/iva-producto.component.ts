import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, lastValueFrom } from 'rxjs';
import { ProductoResponse } from '../../../ModuloInventario/Entidad/producto.model';
import { ProductoService } from '../../../ModuloInventario/Service/producto.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { IvaProductoRequest, IvaProductoResponse } from '../../Entidad/iva-producto.model';
import { IvaProductoService } from '../../Service/iva-producto.service';
import { ListaIvaResponse } from '../../Entidad/lista-iva.model';
import { ListaIvaService } from '../../Service/lista-iva.service';

@Component({
  selector: 'app-iva-producto',
  standalone: false,
  templateUrl: './iva-producto.component.html',
  styleUrl: './iva-producto.component.css'
})
export class IvaProductoComponent implements OnInit {
  ivasProducto: IvaProductoResponse[] = [];
  ivasProductoFiltrados: IvaProductoResponse[] = [];
  productos: ProductoResponse[] = [];
  listasIva: ListaIvaResponse[] = [];

  ivaProductoForm: FormGroup;
  showForm = false;
  modoEdicion = false;
  ivaProductoIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private readonly ivaProductoService: IvaProductoService,
    private readonly listaIvaService: ListaIvaService,
    private readonly productoService: ProductoService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.ivaProductoForm = this.fb.group({
      listaIvaId: ['', [Validators.required, Validators.min(1)]],
      productoId: ['', Validators.required],
      impuestoPorcentaje: ['', [Validators.required, Validators.min(0)]],
      impuestoCodigo: [''],
      fechaVigenciaDesde: ['', Validators.required],
      fechaVigenciaHasta: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    forkJoin({
      ivas: this.ivaProductoService.findAll(),
      listasIvaVigentes: this.listaIvaService.findVigentes(),
      listasIvaActivas: this.listaIvaService.findActivos(),
      productos: this.productoService.findAll()
    }).subscribe({
      next: (data) => {
        this.ivasProducto = data.ivas;
        this.ivasProductoFiltrados = data.ivas;
        this.listasIva = data.listasIvaVigentes.length > 0 ? data.listasIvaVigentes : data.listasIvaActivas;
        this.productos = data.productos.filter(producto => producto.activo);

        if (this.listasIva.length === 0) {
          this.notificationService.showWarning('No existen listas de IVA activas. Ejecuta la migracion o registra una lista IVA.');
        }
      },
      error: () => {
        this.notificationService.showError('Error al cargar los datos de IVA por producto');
      }
    });
  }

  filtrarIvasProducto(): void {
    const busquedaLower = this.busqueda.toLowerCase().trim();

    if (!busquedaLower) {
      this.ivasProductoFiltrados = [...this.ivasProducto];
      return;
    }

    this.ivasProductoFiltrados = this.ivasProducto.filter(iva => {
      const nombreProducto = this.obtenerNombreProducto(iva.productoId).toLowerCase();
      return iva.listaIvaNombre.toLowerCase().includes(busquedaLower)
        || iva.listaIvaCodigo.toLowerCase().includes(busquedaLower)
        || String(iva.listaIvaId).includes(busquedaLower)
        || nombreProducto.includes(busquedaLower)
        || (iva.impuestoCodigo || '').toLowerCase().includes(busquedaLower);
    });
  }

  abrirFormCrear(): void {
    this.modoEdicion = false;
    this.ivaProductoIdEditar = null;
    this.ivaProductoForm.reset({
      listaIvaId: this.listasIva.length > 0 ? this.listasIva[0].id : '',
      activo: true,
      impuestoPorcentaje: 0,
      fechaVigenciaDesde: new Date().toISOString().slice(0, 10)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  abrirFormEditar(ivaProducto: IvaProductoResponse): void {
    this.modoEdicion = true;
    this.ivaProductoIdEditar = ivaProducto.id;
    this.ivaProductoForm.patchValue({
      listaIvaId: ivaProducto.listaIvaId,
      productoId: ivaProducto.productoId,
      impuestoPorcentaje: ivaProducto.impuestoPorcentaje,
      impuestoCodigo: ivaProducto.impuestoCodigo || '',
      fechaVigenciaDesde: this.normalizarFecha(ivaProducto.fechaVigenciaDesde),
      fechaVigenciaHasta: this.normalizarFecha(ivaProducto.fechaVigenciaHasta),
      activo: ivaProducto.activo
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  cerrarForm(): void {
    this.showForm = false;
    this.ivaProductoForm.reset({ activo: true });
    this.modoEdicion = false;
    this.ivaProductoIdEditar = null;
  }

  onListaIvaChange(): void {
    const listaIvaId = this.ivaProductoForm.get('listaIvaId')?.value;
    if (!listaIvaId) {
      return;
    }

    // Convertir string a número porque los selects devuelven strings
    const listaIvaIdNum = Number(listaIvaId);
    const listaIva = this.listasIva.find(l => l.id === listaIvaIdNum);
    if (!listaIva) {
      console.warn('Lista IVA no encontrada con ID:', listaIvaIdNum);
      return;
    }

    // Extraer porcentaje del tipoIva (ej: "15" de "15%" o "15")
    const porcentajeMatch = (listaIva.tipoIva || '').match(/\d+(?:\.\d+)?/);
    const porcentaje = porcentajeMatch ? Number.parseFloat(porcentajeMatch[0]) : 0;

    // Llenar campos automáticamente
    this.ivaProductoForm.patchValue({
      impuestoPorcentaje: porcentaje,
      impuestoCodigo: listaIva.codigo,
      fechaVigenciaDesde: this.normalizarFecha(listaIva.fechaVigenciaDesde),
      fechaVigenciaHasta: this.normalizarFecha(listaIva.fechaVigenciaHasta)
    });
  }

  async guardarIvaProducto(): Promise<void> {
    if (this.listasIva.length === 0) {
      this.notificationService.showWarning('No hay listas de IVA disponibles para asignar.');
      return;
    }

    if (this.ivaProductoForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const ivaProducto: IvaProductoRequest = this.ivaProductoForm.value;

    try {
      if (this.modoEdicion && this.ivaProductoIdEditar) {
        await lastValueFrom(this.ivaProductoService.update(this.ivaProductoIdEditar, ivaProducto));
        this.notificationService.showSuccess('Asignación de IVA actualizada correctamente');
      } else {
        await lastValueFrom(this.ivaProductoService.save(ivaProducto));
        this.notificationService.showSuccess('Asignación de IVA creada correctamente');
      }

      // Cerrar modal inmediatamente después de guardar
      this.cerrarForm();
      
      // Recargar datos en background sin esperar
      this.cargarDatos();
    } catch (error) {
      console.error('Error al guardar IVA por producto:', error);
      this.notificationService.showError('Error al guardar la asignación de IVA');
    }
  }

  async eliminarIvaProducto(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar esta asignación de IVA?',
      'Eliminar asignación',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmado) {
      return;
    }

    try {
      await lastValueFrom(this.ivaProductoService.deleteById(id));
      await this.notificationService.showSuccess('Asignación de IVA eliminada correctamente');
      this.cargarDatos();
    } catch (error) {
      console.error('Error al eliminar IVA por producto:', error);
      await this.notificationService.showError('Error al eliminar la asignación de IVA');
    }
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? `${producto.sku} - ${producto.productoNombre}` : `ID: ${productoId}`;
  }

  private normalizarFecha(fecha?: string): string {
    if (!fecha) {
      return '';
    }
    return fecha.length >= 10 ? fecha.substring(0, 10) : fecha;
  }
}
