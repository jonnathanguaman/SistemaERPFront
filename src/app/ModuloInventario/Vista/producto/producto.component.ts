import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../Service/producto.service';
import { ProductoTipoService } from '../../Service/producto-tipo.service';
import { LineaNegocioService } from '../../Service/linea-negocio.service';
import { SubgrupoService } from '../../Service/subgrupo.service';
import { ProductoRequest, ProductoResponse } from '../../Entidad/producto.model';
import { ProductoTipoResponse } from '../../Entidad/producto-tipo.model';
import { LineaNegocioResponse } from '../../Entidad/linea-negocio.model';
import { SubgrupoResponse } from '../../Entidad/subgrupo.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-producto',
  standalone: false,
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent implements OnInit {
  productos: ProductoResponse[] = [];
  productosFiltrados: ProductoResponse[] = [];
  productoForm: FormGroup;
  showModal = false;
  isEditMode = false;
  selectedProductoId?: number;
  loading = false;
  searchTerm = '';

  // Listas para los selectores
  productoTipos: ProductoTipoResponse[] = [];
  lineasNegocio: LineaNegocioResponse[] = [];
  subgrupos: SubgrupoResponse[] = [];

  // Opciones de temperatura
  temperaturas = ['AMBIENTE', 'REFRIGERADO', 'CONGELADO'];

  constructor(
    private readonly productoService: ProductoService,
    private readonly productoTipoService: ProductoTipoService,
    private readonly lineaNegocioService: LineaNegocioService,
    private readonly subgrupoService: SubgrupoService,
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.productoForm = this.fb.group({
      sku: ['', [Validators.required, Validators.maxLength(50)]],
      codigoBarras: ['', [Validators.maxLength(50)]],
      codigoInterno: ['', [Validators.maxLength(50)]],
      productoNombre: ['', [Validators.required, Validators.maxLength(200)]],
      presentacion: ['', [Validators.maxLength(100)]],
      temperatura: ['AMBIENTE', [Validators.required]],
      peso: [0, [Validators.min(0)]],
      volumen: [0, [Validators.min(0)]],
      unidadMedida: ['', [Validators.maxLength(20)]],
      cantidadMaxima: [0, [Validators.min(0)]],
      cantidadMinimo: [0, [Validators.min(0)]],
      cantidadPorCaja: [1, [Validators.required, Validators.min(1)]],
      estado: [true],
      lineaNegocioId: ['', [Validators.required]],
      subgrupoId: ['', [Validators.required]],
      productoTipoId: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarDatosAuxiliares();
  }

  cargarDatosAuxiliares(): void {
    this.productoTipoService.findAll().subscribe({
      next: (data) => this.productoTipos = data.filter(t => t.activo),
      error: (error) => console.error('Error al cargar tipos de producto:', error)
    });

    this.lineaNegocioService.findAll().subscribe({
      next: (data) => this.lineasNegocio = data.filter(l => l.activo),
      error: (error) => console.error('Error al cargar líneas de negocio:', error)
    });

    this.subgrupoService.findAll().subscribe({
      next: (data) => this.subgrupos = data.filter(s => s.activo),
      error: (error) => console.error('Error al cargar subgrupos:', error)
    });
  }

  cargarProductos(): void {
    this.loading = true;
    this.productoService.findAll().subscribe({
      next: (data) => {
        this.productos = data;
        this.productosFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Error al cargar productos', error.message);
        this.loading = false;
      }
    });
  }

  filtrarProductos(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.productosFiltrados = this.productos.filter(producto =>
      producto.productoNombre.toLowerCase().includes(term) ||
      producto.sku.toLowerCase().includes(term) ||
      producto.codigoBarras?.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.productoForm.reset({
      temperatura: 'AMBIENTE',
      peso: 0,
      volumen: 0,
      cantidadMaxima: 0,
      cantidadMinimo: 0,
      cantidadPorCaja: 1,
      estado: true
    });
    this.showModal = true;
  }

  abrirModalEditar(producto: ProductoResponse): void {
    this.isEditMode = true;
    this.selectedProductoId = producto.id;
    this.productoForm.patchValue({
      sku: producto.sku,
      codigoBarras: producto.codigoBarras,
      codigoInterno: producto.codigoInterno,
      productoNombre: producto.productoNombre,
      presentacion: producto.presentacion,
      temperatura: producto.temperatura,
      peso: producto.peso,
      volumen: producto.volumen,
      unidadMedida: producto.unidadMedida,
      cantidadMaxima: producto.cantidadMaxima,
      cantidadMinimo: producto.cantidadMinimo,
      cantidadPorCaja: producto.cantidadPorCaja,
      estado: producto.estado,
      lineaNegocioId: producto.lineaNegocioId,
      subgrupoId: producto.subgrupoId,
      productoTipoId: producto.productoTipoId
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.productoForm.reset();
    this.isEditMode = false;
    this.selectedProductoId = undefined;
  }

  async guardarProducto(): Promise<void> {
    if (this.productoForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Por favor complete todos los campos requeridos correctamente');
      return;
    }

    const productoData: ProductoRequest = this.productoForm.value;

    if (this.isEditMode && this.selectedProductoId) {
      this.productoService.update(this.selectedProductoId, productoData).subscribe({
        next: () => {
          this.notificationService.success('Producto actualizado', 'El producto se actualizó correctamente');
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al actualizar producto', error.message);
        }
      });
    } else {
      this.productoService.save(productoData).subscribe({
        next: () => {
          this.notificationService.success('Producto creado', 'El producto se creó correctamente');
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (error) => {
          this.notificationService.error('Error al crear producto', error.message);
        }
      });
    }
  }

  async eliminarProducto(producto: ProductoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Está seguro de eliminar el producto "${producto.productoNombre}"?`
    );

    if (confirmed) {
      this.productoService.delete(producto.id).subscribe({
        next: () => {
          this.notificationService.success('Producto eliminado', 'El producto se eliminó correctamente');
          this.cargarProductos();
        },
        error: (error) => {
          this.notificationService.error('Error al eliminar producto', error.message);
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.productoForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('maxlength')) return 'Texto demasiado largo';
    if (field?.hasError('min')) return 'El valor debe ser mayor o igual a 0';
    return '';
  }

  getTemperaturaLabel(temp: string): string {
    const labels: { [key: string]: string } = {
      'AMBIENTE': 'Ambiente',
      'REFRIGERADO': 'Refrigerado',
      'CONGELADO': 'Congelado'
    };
    return labels[temp] || temp;
  }
}
