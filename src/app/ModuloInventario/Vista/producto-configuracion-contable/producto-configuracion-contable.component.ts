import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoConfiguracionContableService } from '../../Service/producto-configuracion-contable.service';
import { ProductoService } from '../../Service/producto.service';
import { CuentaContableService } from '../../Service/cuenta-contable.service';
import { CentroCostosService } from '../../Service/centro-costos.service';
import { MetodoValuacionService } from '../../Service/metodo-valuacion.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { ProductoConfiguracionContableRequest, ProductoConfiguracionContableResponse } from '../../Entidad/producto-configuracion-contable.model';
import { ProductoResponse } from '../../Entidad/producto.model';
import { CuentaContableResponse } from '../../Entidad/cuenta-contable.model';
import { CentroCostosResponse } from '../../Entidad/centro-costos.model';
import { MetodoValuacionResponse } from '../../Entidad/metodo-valuacion.model';

@Component({
  selector: 'app-producto-configuracion-contable',
  standalone: false,
  templateUrl: './producto-configuracion-contable.component.html',
  styleUrl: './producto-configuracion-contable.component.css'
})
export class ProductoConfiguracionContableComponent implements OnInit {
  configuracionList: ProductoConfiguracionContableResponse[] = [];
  productos: ProductoResponse[] = [];
  cuentasContables: CuentaContableResponse[] = [];
  centrosCostos: CentroCostosResponse[] = [];
  metodosValuacion: MetodoValuacionResponse[] = [];
  configuracionForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  searchTerm: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly configuracionService: ProductoConfiguracionContableService,
    private readonly productoService: ProductoService,
    private readonly cuentaContableService: CuentaContableService,
    private readonly centroCostosService: CentroCostosService,
    private readonly metodoValuacionService: MetodoValuacionService,
    private readonly notificationService: NotificationService
  ) {
    this.configuracionForm = this.fb.group({
      productoId: ['', Validators.required],
      cuentaContableId: ['', Validators.required],
      centroCostosId: ['', Validators.required],
      metodoValuacionId: ['', Validators.required],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadConfiguraciones();
    this.loadProductos();
    this.loadCuentasContables();
    this.loadCentrosCostos();
    this.loadMetodosValuacion();
  }

  /**
   * Obtiene la lista filtrada de configuraciones según el término de búsqueda
   */
  get configuracionesFiltradas(): ProductoConfiguracionContableResponse[] {
    if (!this.searchTerm.trim()) {
      return this.configuracionList;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.configuracionList.filter(config =>
      config.productoNombre?.toLowerCase().includes(termino) ||
      config.cuentaContableNombre?.toLowerCase().includes(termino) ||
      config.centroCostosNombre?.toLowerCase().includes(termino) ||
      config.metodoValuacionNombre?.toLowerCase().includes(termino) ||
      config.id.toString().includes(termino)
    );
  }

  loadConfiguraciones(): void {
    this.configuracionService.findAll().subscribe({
      next: (data) => {
        this.configuracionList = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar configuraciones: ' + error.message);
      }
    });
  }

  loadProductos(): void {
    this.productoService.findAll().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar productos: ' + error.message);
      }
    });
  }

  loadCuentasContables(): void {
    this.cuentaContableService.findAll().subscribe({
      next: (data) => {
        this.cuentasContables = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar cuentas contables: ' + error.message);
      }
    });
  }

  loadCentrosCostos(): void {
    this.centroCostosService.findAll().subscribe({
      next: (data) => {
        this.centrosCostos = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar centros de costos: ' + error.message);
      }
    });
  }

  loadMetodosValuacion(): void {
    this.metodoValuacionService.findAll().subscribe({
      next: (data) => {
        this.metodosValuacion = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar métodos de valuación: ' + error.message);
      }
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.configuracionForm.reset({ activo: true });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.configuracionForm.reset();
  }

  edit(configuracion: ProductoConfiguracionContableResponse): void {
    this.isEditing = true;
    this.editingId = configuracion.id;
    this.configuracionForm.patchValue({
      productoId: configuracion.productoId,
      cuentaContableId: configuracion.cuentaContableId,
      centroCostosId: configuracion.centroCostosId,
      metodoValuacionId: configuracion.metodoValuacionId,
      activo: configuracion.activo
    });
    this.showModal = true;
  }

  save(): void {
    if (this.configuracionForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos requeridos');
      return;
    }

    const configuracionData: ProductoConfiguracionContableRequest = this.configuracionForm.value;

    if (this.isEditing && this.editingId !== null) {
      this.configuracionService.update(this.editingId, configuracionData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Configuración actualizada exitosamente');
          this.loadConfiguraciones();
          this.closeModal();
        },
        error: (error) => {
          this.notificationService.showError('Error al actualizar: ' + error.message);
        }
      });
    } else {
      this.configuracionService.save(configuracionData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Configuración creada exitosamente');
          this.loadConfiguraciones();
          this.closeModal();
        },
        error: (error) => {
          this.notificationService.showError('Error al crear: ' + error.message);
        }
      });
    }
  }

  delete(id: number): void {
    if (confirm('¿Está seguro de eliminar esta configuración contable?')) {
      this.configuracionService.delete(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Configuración eliminada exitosamente');
          this.loadConfiguraciones();
        },
        error: (error) => {
          this.notificationService.showError('Error al eliminar: ' + error.message);
        }
      });
    }
  }
}
