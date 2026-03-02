import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetalleCobroService } from '../../Service/detalle-cobro.service';
import { CobroService } from '../../Service/cobro.service';
import { CuentaPorCobrarService } from '../../Service/cuenta-por-cobrar.service';
import { FacturaService } from '../../Service/factura.service';
import { DetalleCobroResponse, DetalleCobroRequest } from '../../Entidad/detalle-cobro.model';
import { CobroResponse } from '../../Entidad/cobro.model';
import { CuentaPorCobrarResponse } from '../../Entidad/cuenta-por-cobrar.model';
import { FacturaResponse } from '../../Entidad/factura.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-detalle-cobro',
  standalone: false,
  templateUrl: './detalle-cobro.component.html',
  styleUrl: './detalle-cobro.component.css'
})
export class DetalleCobroComponent implements OnInit {
  detallesCobro: DetalleCobroResponse[] = [];
  cobros: CobroResponse[] = [];
  cuentasPorCobrar: CuentaPorCobrarResponse[] = [];
  facturas: FacturaResponse[] = [];
  detalleCobroForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingDetalleId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';
  filterCobro: number | null = null;

  constructor(
    private readonly detalleCobroService: DetalleCobroService,
    private readonly cobroService: CobroService,
    private readonly cuentaPorCobrarService: CuentaPorCobrarService,
    private readonly facturaService: FacturaService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.detalleCobroForm = this.formBuilder.group({
      cobroId: [null, Validators.required],
      cuentaPorCobrarId: [null, Validators.required],
      facturaId: [null, Validators.required],
      montoAplicado: [0, [Validators.required, Validators.min(0.01)]],
      fechaAplicacion: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCobros();
    this.cargarCuentasPorCobrar();
    this.cargarFacturas();
    this.cargarDetallesCobro(); // Cargar todos los detalles inicialmente
  }

  get detallesCobroFiltrados(): DetalleCobroResponse[] {
    let filtered = this.detallesCobro;

    if (this.filterCobro !== null) {
      filtered = filtered.filter(d => d.cobroId === this.filterCobro);
    }

    if (!this.searchTerm.trim()) {
      return filtered;
    }

    const termino = this.searchTerm.toLowerCase();
    return filtered.filter(detalle =>
      detalle.cobroNumero?.toLowerCase().includes(termino) ||
      detalle.facturaNumero?.toLowerCase().includes(termino) ||
      detalle.observaciones?.toLowerCase().includes(termino)
    );
  }

  cargarDetallesCobro(): void {
    this.loading = true;
    if (this.filterCobro !== null && this.filterCobro > 0) {
      // Cargar detalles de un cobro específico
      this.detalleCobroService.obtenerPorCobro(this.filterCobro).subscribe({
        next: (data) => {
          this.detallesCobro = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar detalles de cobro:', error);
          this.notificationService.error(error.message, 'Error al cargar');
          this.loading = false;
        }
      });
    } else {
      // Cargar todos los detalles
      this.detalleCobroService.obtenerTodos().subscribe({
        next: (data) => {
          this.detallesCobro = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar detalles de cobro:', error);
          this.notificationService.error(error.message, 'Error al cargar');
          this.loading = false;
        }
      });
    }
  }

  cargarCobros(): void {
    this.cobroService.findActivos().subscribe({
      next: (data) => {
        this.cobros = data;
        // No seleccionar automáticamente, dejar en "Todos"
      },
      error: (error) => {
        console.error('Error al cargar cobros:', error);
      }
    });
  }

  cargarCuentasPorCobrar(): void {
    this.cuentaPorCobrarService.findActivas().subscribe({
      next: (data) => {
        this.cuentasPorCobrar = data;
      },
      error: (error) => {
        console.error('Error al cargar cuentas por cobrar:', error);
      }
    });
  }

  cargarFacturas(): void {
    this.facturaService.obtenerTodos().subscribe({
      next: (data) => {
        this.facturas = data;
      },
      error: (error) => {
        console.error('Error al cargar facturas:', error);
      }
    });
  }

  onCobroFilterChange(): void {
    this.cargarDetallesCobro();
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingDetalleId = null;
    const today = new Date().toISOString().split('T')[0];
    this.detalleCobroForm.reset({
      fechaAplicacion: today,
      montoAplicado: 0
    });
    this.showModal = true;
  }

  abrirModalEditar(detalle: DetalleCobroResponse): void {
    this.isEditing = true;
    this.editingDetalleId = detalle.id;
    this.detalleCobroForm.patchValue({
      cobroId: detalle.cobroId,
      cuentaPorCobrarId: detalle.cuentaPorCobrarId,
      facturaId: detalle.facturaId,
      montoAplicado: detalle.montoAplicado,
      fechaAplicacion: detalle.fechaAplicacion,
      observaciones: detalle.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.detalleCobroForm.reset();
    this.isEditing = false;
    this.editingDetalleId = null;
  }

  guardarDetalleCobro(): void {
    if (this.detalleCobroForm.invalid) {
      this.detalleCobroForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const detalleData: DetalleCobroRequest = this.detalleCobroForm.value;

    if (this.isEditing && this.editingDetalleId !== null) {
      this.detalleCobroService.actualizar(this.editingDetalleId, detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle de cobro actualizado exitosamente');
          this.cargarDetallesCobro();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar detalle:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.detalleCobroService.crear(detalleData).subscribe({
        next: () => {
          this.notificationService.success('Detalle de cobro creado exitosamente');
          this.cargarDetallesCobro();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear detalle:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarDetalleCobro(detalle: DetalleCobroResponse): Promise<void> {
    const confirmed = confirm(`¿Eliminar el detalle de cobro de la factura ${detalle.facturaNumero}?`);
    if (!confirmed) return;

    this.detalleCobroService.eliminar(detalle.id).subscribe({
      next: () => {
        this.notificationService.toast('Detalle de cobro eliminado exitosamente', 'success');
        this.cargarDetallesCobro();
      },
      error: (error) => {
        console.error('Error al eliminar detalle:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.detalleCobroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.detalleCobroForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `Debe ser mayor o igual a ${min}`;
    }
    return '';
  }
}
