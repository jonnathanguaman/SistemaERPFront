import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, lastValueFrom } from 'rxjs';
import { PrecioProductoRequest, PrecioProductoResponse } from '../../Entidad/precio-producto.model';
import { ListaPreciosResponse } from '../../Entidad/lista-precios.model';
import { PrecioProductoService } from '../../Service/precio-producto.service';
import { ListaPreciosService } from '../../Service/lista-precios.service';
import { ProductoService } from '../../../ModuloInventario/Service/producto.service';
import { ProductoResponse } from '../../../ModuloInventario/Entidad/producto.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-precio-producto',
  standalone: false,
  templateUrl: './precio-producto.component.html',
  styleUrl: './precio-producto.component.css'
})
export class PrecioProductoComponent implements OnInit {
  preciosProducto: PrecioProductoResponse[] = [];
  preciosProductoFiltrados: PrecioProductoResponse[] = [];
  listasPrecios: ListaPreciosResponse[] = [];
  listasPreciosActivas: ListaPreciosResponse[] = [];
  productos: ProductoResponse[] = [];
  precioProductoForm: FormGroup;
  mostrarModal = false;
  modoEdicion = false;
  precioProductoIdEditar: number | null = null;
  busqueda = '';

  constructor(
    private readonly precioProductoService: PrecioProductoService,
    private readonly listaPreciosService: ListaPreciosService,
    private readonly productoService: ProductoService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.precioProductoForm = this.fb.group({
      listaPreciosId: ['', Validators.required],
      productoId: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      precioMinimo: ['', Validators.min(0.01)],
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
      precios: this.precioProductoService.findAll(),
      listas: this.listaPreciosService.findAll(),
      productos: this.productoService.findAll()
    }).subscribe({
      next: (data) => {
        this.preciosProducto = data.precios;
        this.preciosProductoFiltrados = data.precios;
        this.listasPrecios = data.listas;
        this.listasPreciosActivas = data.listas.filter(lista => lista.activo);
        this.productos = data.productos.filter(producto => producto.activo);
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar los datos');
      }
    });
  }

  filtrarPreciosProducto(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.preciosProductoFiltrados = this.preciosProducto.filter(precio => {
      const nombreProducto = this.obtenerNombreProducto(precio.productoId).toLowerCase();
      return precio.listaPreciosNombre.toLowerCase().includes(busquedaLower) ||
        precio.listaPreciosCodigo.toLowerCase().includes(busquedaLower) ||
        nombreProducto.includes(busquedaLower) ||
        precio.productoId.toString().includes(busquedaLower);
    });
  }

  abrirModal(precioProducto?: PrecioProductoResponse): void {
    if (precioProducto) {
      this.modoEdicion = true;
      this.precioProductoIdEditar = precioProducto.id;
      this.precioProductoForm.patchValue({
        listaPreciosId: precioProducto.listaPreciosId,
        productoId: precioProducto.productoId,
        precio: precioProducto.precio,
        precioMinimo: precioProducto.precioMinimo,
        fechaVigenciaDesde: precioProducto.fechaVigenciaDesde,
        fechaVigenciaHasta: precioProducto.fechaVigenciaHasta,
        activo: precioProducto.activo
      });
    } else {
      this.modoEdicion = false;
      this.precioProductoIdEditar = null;
      this.precioProductoForm.reset({ activo: true });
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.precioProductoForm.reset({ activo: true });
    this.modoEdicion = false;
    this.precioProductoIdEditar = null;
  }

  async guardarPrecioProducto(): Promise<void> {
    if (this.precioProductoForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos obligatorios');
      return;
    }

    const precioProducto: PrecioProductoRequest = this.precioProductoForm.value;

    try {
      if (this.modoEdicion && this.precioProductoIdEditar) {
        await lastValueFrom(this.precioProductoService.update(this.precioProductoIdEditar, precioProducto));
        this.notificationService.showSuccess('Precio de producto actualizado correctamente');
      } else {
        await lastValueFrom(this.precioProductoService.save(precioProducto));
        this.notificationService.showSuccess('Precio de producto creado correctamente');
      }
      this.cargarDatos();
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar el precio de producto:', error);
      this.notificationService.showError('Error al guardar el precio de producto');
    }
  }

  async eliminarPrecioProducto(id: number): Promise<void> {
    const confirmado = await this.notificationService.showConfirm(
      '¿Está seguro de eliminar este precio de producto?',
      'Esta acción no se puede deshacer'
    );

    if (confirmado) {
      try {
        await lastValueFrom(this.precioProductoService.deleteById(id));
        this.notificationService.showSuccess('Precio de producto eliminado correctamente');
        this.cargarDatos();
      } catch (error) {
        console.error('Error al eliminar el precio de producto:', error);
        this.notificationService.showError('Error al eliminar el precio de producto');
      }
    }
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? `${producto.sku} - ${producto.productoNombre}` : `ID: ${productoId}`;
  }
}
