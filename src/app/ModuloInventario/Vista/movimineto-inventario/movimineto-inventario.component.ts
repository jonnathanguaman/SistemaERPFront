import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MovimientoInventarioService } from '../../Service/movimiento-inventario.service';
import { TipoMovimientoService } from '../../Service/tipo-movimiento.service';
import { ProductoService } from '../../Service/producto.service';
import { ProductoLoteService } from '../../Service/producto-lote.service';
import { MovimientoInventarioResponse, MovimientoInventarioRequest } from '../../Entidad/movimiento-inventario.model';
import { TipoMovimientoResponse } from '../../Entidad/tipo-movimiento.model';
import { ProductoResponse } from '../../Entidad/producto.model';
import { ProductoLoteResponse } from '../../Entidad/producto-lote.model';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-movimineto-inventario',
  standalone: false,
  templateUrl: './movimineto-inventario.component.html',
  styleUrl: './movimineto-inventario.component.css'
})
export class MoviminetoInventarioComponent implements OnInit {
  movimientos: MovimientoInventarioResponse[] = [];
  movimientoForm: FormGroup;
  showModal: boolean = false;
  showDetalleModal: boolean = false;
  isEditing: boolean = false;
  editingMovimientoId: number | null = null;
  movimientoSeleccionado: MovimientoInventarioResponse | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  tiposMovimiento: TipoMovimientoResponse[] = [];
  bodegas: BodegaResponse[] = [];
  productos: ProductoResponse[] = [];
  lotes: ProductoLoteResponse[] = [];

  estadoOpciones = [
    { value: 'BORRADOR', label: 'Borrador' },
    { value: 'CONFIRMADO', label: 'Confirmado' },
    { value: 'CONTABILIZADO', label: 'Contabilizado' },
    { value: 'ANULADO', label: 'Anulado' }
  ];

  constructor(
    private readonly movimientoService: MovimientoInventarioService,
    private readonly tipoMovimientoService: TipoMovimientoService,
    private readonly bodegaService: BodegaService,
    private readonly productoService: ProductoService,
    private readonly productoLoteService: ProductoLoteService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.movimientoForm = this.formBuilder.group({
      numeroMovimiento: ['', Validators.required],
      tipoMovimientoId: ['', Validators.required],
      bodegaOrigenId: [null],
      bodegaDestinoId: [null],
      fechaMovimiento: ['', Validators.required],
      fechaContabilizacion: [''],
      documentoReferencia: [''],
      tipoDocumentoReferencia: [''],
      motivo: [''],
      observaciones: [''],
      estado: ['BORRADOR', Validators.required],
      detalles: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.cargarMovimientos();
    this.cargarTiposMovimiento();
    this.cargarBodegas();
    this.cargarProductos();
    this.cargarLotes();
  }

  get detalles(): FormArray {
    return this.movimientoForm.get('detalles') as FormArray;
  }

  get movimientosFiltrados(): MovimientoInventarioResponse[] {
    if (!this.searchTerm.trim()) {
      return this.movimientos;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.movimientos.filter(mov =>
      mov.numeroMovimiento.toLowerCase().includes(termino) ||
      mov.tipoMovimientoNombre.toLowerCase().includes(termino) ||
      mov.estado.toLowerCase().includes(termino) ||
      mov.id.toString().includes(termino)
    );
  }

  cargarMovimientos(): void {
    this.loading = true;
    this.movimientoService.findAll().subscribe({
      next: (data) => {
        this.movimientos = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar movimientos:', error);
        this.notificationService.error(error.message, 'Error al cargar movimientos');
        this.loading = false;
      }
    });
  }

  cargarTiposMovimiento(): void {
    this.tipoMovimientoService.findAll().subscribe({
      next: (data) => this.tiposMovimiento = data,
      error: (error) => console.error('Error al cargar tipos de movimiento:', error)
    });
  }

  cargarBodegas(): void {
    this.bodegaService.findAll().subscribe({
      next: (data) => this.bodegas = data,
      error: (error) => console.error('Error al cargar bodegas:', error)
    });
  }

  cargarProductos(): void {
    this.productoService.findAll().subscribe({
      next: (data) => this.productos = data,
      error: (error) => console.error('Error al cargar productos:', error)
    });
  }

  cargarLotes(): void {
    this.productoLoteService.findAll().subscribe({
      next: (data) => this.lotes = data,
      error: (error) => console.error('Error al cargar lotes:', error)
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingMovimientoId = null;
    this.movimientoForm.reset({ estado: 'BORRADOR' });
    this.detalles.clear();
    this.agregarDetalle();
    this.showModal = true;
  }

  abrirModalEditar(movimiento: MovimientoInventarioResponse): void {
    this.isEditing = true;
    this.editingMovimientoId = movimiento.id;
    
    this.movimientoForm.patchValue({
      numeroMovimiento: movimiento.numeroMovimiento,
      tipoMovimientoId: movimiento.tipoMovimientoId,
      bodegaOrigenId: movimiento.bodegaOrigenId,
      bodegaDestinoId: movimiento.bodegaDestinoId,
      fechaMovimiento: movimiento.fechaMovimiento?.substring(0, 16),
      fechaContabilizacion: movimiento.fechaContabilizacion?.substring(0, 16),
      documentoReferencia: movimiento.documentoReferencia,
      tipoDocumentoReferencia: movimiento.tipoDocumentoReferencia,
      motivo: movimiento.motivo,
      observaciones: movimiento.observaciones,
      estado: movimiento.estado
    });

    this.detalles.clear();
    movimiento.detalles?.forEach(detalle => {
      this.detalles.push(this.formBuilder.group({
        productoId: [detalle.productoId, Validators.required],
        loteId: [detalle.loteId],
        cantidad: [detalle.cantidad, [Validators.required, Validators.min(0.01)]],
        costoUnitario: [detalle.costoUnitario, [Validators.required, Validators.min(0)]],
        ubicacionFisica: [detalle.ubicacionFisica],
        observaciones: [detalle.observaciones]
      }));
    });

    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.movimientoForm.reset();
    this.detalles.clear();
    this.isEditing = false;
    this.editingMovimientoId = null;
  }

  agregarDetalle(): void {
    const detalleGroup = this.formBuilder.group({
      productoId: ['', Validators.required],
      loteId: [null],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      costoUnitario: [0, [Validators.required, Validators.min(0)]],
      ubicacionFisica: [''],
      observaciones: ['']
    });
    this.detalles.push(detalleGroup);
  }

  eliminarDetalle(index: number): void {
    this.detalles.removeAt(index);
  }

  guardarMovimiento(): void {
    if (this.movimientoForm.invalid) {
      this.movimientoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    if (this.detalles.length === 0) {
      this.notificationService.warning('Debe agregar al menos un detalle al movimiento.');
      return;
    }

    const formValue = this.movimientoForm.value;
    const movimientoData: MovimientoInventarioRequest = {
      ...formValue,
      detalles: formValue.detalles
    };

    if (this.isEditing && this.editingMovimientoId !== null) {
      this.movimientoService.update(this.editingMovimientoId, movimientoData).subscribe({
        next: () => {
          this.notificationService.success('Movimiento actualizado exitosamente');
          this.cargarMovimientos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar movimiento:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.movimientoService.save(movimientoData).subscribe({
        next: () => {
          this.notificationService.success('Movimiento creado exitosamente');
          this.cargarMovimientos();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear movimiento:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarMovimiento(movimiento: MovimientoInventarioResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(movimiento.numeroMovimiento);
    
    if (!confirmed) {
      return;
    }

    this.movimientoService.delete(movimiento.id).subscribe({
      next: () => {
        this.notificationService.toast('Movimiento eliminado exitosamente', 'success');
        this.cargarMovimientos();
      },
      error: (error) => {
        console.error('Error al eliminar movimiento:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  verDetalles(movimiento: MovimientoInventarioResponse): void {
    this.movimientoSeleccionado = movimiento;
    this.showDetalleModal = true;
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.movimientoSeleccionado = null;
  }

  confirmarMovimiento(movimiento: MovimientoInventarioResponse): void {
    this.movimientoService.confirmar(movimiento.id).subscribe({
      next: () => {
        this.notificationService.success('Movimiento confirmado exitosamente');
        this.cargarMovimientos();
      },
      error: (error) => {
        console.error('Error al confirmar movimiento:', error);
        this.notificationService.error(error.message, 'Error al confirmar');
      }
    });
  }

  contabilizarMovimiento(movimiento: MovimientoInventarioResponse): void {
    this.movimientoService.contabilizar(movimiento.id).subscribe({
      next: () => {
        this.notificationService.success('Movimiento contabilizado exitosamente');
        this.cargarMovimientos();
      },
      error: (error) => {
        console.error('Error al contabilizar movimiento:', error);
        this.notificationService.error(error.message, 'Error al contabilizar');
      }
    });
  }

  anularMovimiento(movimiento: MovimientoInventarioResponse): void {
    this.movimientoService.anular(movimiento.id).subscribe({
      next: () => {
        this.notificationService.success('Movimiento anulado exitosamente');
        this.cargarMovimientos();
      },
      error: (error) => {
        console.error('Error al anular movimiento:', error);
        this.notificationService.error(error.message, 'Error al anular');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.movimientoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.movimientoForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }
    
    return '';
  }

  getEstadoLabel(valor: string): string {
    const opcion = this.estadoOpciones.find(o => o.value === valor);
    return opcion ? opcion.label : valor;
  }

  calcularTotalDetalle(detalle: any): number {
    return (detalle.cantidad || 0) * (detalle.costoUnitario || 0);
  }

  calcularTotalMovimiento(): number {
    return this.detalles.controls.reduce((total, control) => {
      const cantidad = control.get('cantidad')?.value || 0;
      const costoUnitario = control.get('costoUnitario')?.value || 0;
      return total + (cantidad * costoUnitario);
    }, 0);
  }

  calcularTotalMovimientoSeleccionado(): number {
    if (!this.movimientoSeleccionado?.detalles) {
      return 0;
    }
    return this.movimientoSeleccionado.detalles.reduce((total, detalle) => {
      return total + (detalle.costoTotal || 0);
    }, 0);
  }

  obtenerNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.productoNombre : 'Producto no encontrado';
  }
}

