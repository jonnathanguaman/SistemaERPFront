import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RecepcionInventarioService } from '../../Service/recepcion-inventario.service';
import { DetalleRecepcionService } from '../../Service/detalle-recepcion.service';
import { OrdenCompraService } from '../../Service/orden-compra.service';
import { ProveedorService } from '../../Service/proveedor.service';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { PersonaService } from '../../../ModuloEmpleados/Service/persona.service';
import { RecepcionInventarioRequest, RecepcionInventarioResponse, DetalleRecepcionRequest, EstadoRecepcion, EstadoCalidad } from '../../Entidades/recepcion-inventario.model';
import { OrdenCompraResponse } from '../../Entidades/orden-compra.model';
import { ProveedorResponse } from '../../Entidades/proveedor.model';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { PersonaResponse } from '../../../ModuloEmpleados/Entidades/persona.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { AuthService } from '../../../Compartido/services/auth.service';

interface FilaDetalle {
  id?: number;
  detalleOrdenCompraId?: number;
  productoId: number;
  productoNombre: string;
  productoSku: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadRechazada: number;
  costoUnitario: number;
  estadoCalidad: string;
  numeroLote: string;
  loteId: number | null;
  fechaFabricacion: string;
  fechaVencimiento: string;
  motivoRechazo: string;
  observaciones: string;
  excedeCantidad: boolean;
}

@Component({
  selector: 'app-recepcion-form',
  standalone: false,
  templateUrl: './recepcion-form.component.html',
  styleUrl: './recepcion-form.component.css'
})
export class RecepcionFormComponent implements OnInit {

  recepcionId: number | null = null;
  isEditMode = false;
  recepcion: RecepcionInventarioResponse | null = null;
  isSaving = false;
  isLoading = false;

  headerForm: FormGroup;
  filas: FilaDetalle[] = [];

  showDetalleModal = false;
  filaEditando: FilaDetalle | null = null;
  filaEditandoIndex = -1;
  detalleForm: FormGroup;

  ordenes: OrdenCompraResponse[] = [];
  proveedores: ProveedorResponse[] = [];
  bodegas: BodegaResponse[] = [];
  responsables: PersonaResponse[] = [];
  estadosCalidad = Object.values(EstadoCalidad);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly recepcionService: RecepcionInventarioService,
    private readonly detalleService: DetalleRecepcionService,
    private readonly ordenCompraService: OrdenCompraService,
    private readonly proveedorService: ProveedorService,
    private readonly bodegaService: BodegaService,
    private readonly personaService: PersonaService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService
  ) {
    this.headerForm = this.fb.group({
      numeroRecepcion: ['', [Validators.required, Validators.minLength(3)]],
      ordenCompraId: [null, [Validators.required]],
      proveedorId: [null, [Validators.required]],
      fechaRecepcion: ['', [Validators.required]],
      bodegaId: [null, [Validators.required]],
      responsableRecepcionId: [null],
      numeroFacturaProveedor: [''],
      numeroGuiaRemision: [''],
      observaciones: ['']
    });

    this.detalleForm = this.fb.group({
      productoId: [null, [Validators.required, Validators.min(1)]],
      productoNombre: [''],
      productoSku: [''],
      detalleOrdenCompraId: [null],
      cantidadOrdenada: [0, [Validators.required, Validators.min(0)]],
      cantidadRecibida: [0, [Validators.required, Validators.min(0)]],
      cantidadRechazada: [0, [Validators.min(0)]],
      costoUnitario: [0, [Validators.required, Validators.min(0.0001)]],
      estadoCalidad: ['APROBADO'],
      numeroLote: [''],
      loteId: [null],
      fechaFabricacion: [''],
      fechaVencimiento: [''],
      motivoRechazo: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatosDropdowns();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recepcionId = +id;
      this.isEditMode = true;
      this.cargarRecepcion(this.recepcionId);
    } else {
      this.headerForm.patchValue({
        numeroRecepcion: this.generarNumeroRecepcion(),
        fechaRecepcion: new Date().toISOString().split('T')[0]
      });
    }
  }

  cargarDatosDropdowns(): void {
    forkJoin({
      ordenes: this.ordenCompraService.findByEstado('CONFIRMADA'),
      proveedores: this.proveedorService.findActive(),
      bodegas: this.bodegaService.findAll(),
      responsables: this.personaService.findAll()
    }).subscribe({
      next: (data) => {
        this.ordenes = data.ordenes;
        this.proveedores = data.proveedores;
        this.bodegas = (data.bodegas as any[]).filter(
          b => b.activo && b.bodegaTipo === 'CONTABLE' && b.permiteBodegaDestino === true
        );
        this.responsables = data.responsables.filter((p: any) => p.activo);
      },
      error: () => {
        this.notificationService.error('Error al cargar datos del formulario', 'Error');
      }
    });
  }

  cargarRecepcion(id: number): void {
    this.isLoading = true;
    this.recepcionService.findById(id).subscribe({
      next: (recepcion) => {
        this.recepcion = recepcion;
        this.headerForm.patchValue({
          numeroRecepcion: recepcion.numeroRecepcion,
          ordenCompraId: recepcion.ordenCompraId,
          proveedorId: recepcion.proveedorId,
          fechaRecepcion: recepcion.fechaRecepcion,
          bodegaId: recepcion.bodegaId,
          responsableRecepcionId: recepcion.responsableRecepcionId,
          numeroFacturaProveedor: recepcion.numeroFacturaProveedor,
          numeroGuiaRemision: recepcion.numeroGuiaRemision,
          observaciones: recepcion.observaciones
        });
        if (recepcion.estado !== EstadoRecepcion.PENDIENTE) {
          this.headerForm.disable();
        }
        this.filas = (recepcion.detalles || []).map(d => ({
          id: d.id,
          detalleOrdenCompraId: d.detalleOrdenCompraId,
          productoId: d.productoId,
          productoNombre: d.productoNombre || `Producto #${d.productoId}`,
          productoSku: d.productoSku || '',
          cantidadOrdenada: d.cantidadOrdenada,
          cantidadRecibida: d.cantidadRecibida,
          cantidadRechazada: d.cantidadRechazada || 0,
          costoUnitario: d.costoUnitario,
          estadoCalidad: d.estadoCalidad || 'APROBADO',
          numeroLote: d.numeroLote || '',
          loteId: d.loteId || null,
          fechaFabricacion: d.fechaFabricacion || '',
          fechaVencimiento: d.fechaVencimiento || '',
          motivoRechazo: d.motivoRechazo || '',
          observaciones: d.observaciones || '',
          excedeCantidad: d.cantidadRecibida > d.cantidadOrdenada && d.cantidadOrdenada > 0
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('No se pudo cargar la recepción', 'Error');
        this.router.navigate(['/compras/recepciones']);
      }
    });
  }

  onOrdenChange(): void {
    const ordenId = this.headerForm.get('ordenCompraId')?.value;
    if (!ordenId || this.isEditMode) return;

    this.ordenCompraService.findById(ordenId).subscribe({
      next: (orden) => {
        this.headerForm.patchValue({ proveedorId: orden.proveedorId });
        if (orden.detalles && orden.detalles.length > 0) {
          this.filas = orden.detalles.map(d => ({
            detalleOrdenCompraId: d.id,
            productoId: d.productoId,
            productoNombre: d.productoNombre || `Producto #${d.productoId}`,
            productoSku: d.productoSku || '',
            cantidadOrdenada: d.cantidadOrdenada,
            cantidadRecibida: d.cantidadOrdenada,
            cantidadRechazada: 0,
            costoUnitario: d.precioUnitario,
            estadoCalidad: 'APROBADO',
            numeroLote: '',
            loteId: null,
            fechaFabricacion: '',
            fechaVencimiento: '',
            motivoRechazo: '',
            observaciones: '',
            excedeCantidad: false
          }));
        }
      },
      error: () => {
        this.notificationService.error('No se pudieron cargar los productos de la orden', 'Error');
      }
    });
  }

  abrirModalAgregarDetalle(): void {
    this.filaEditando = null;
    this.filaEditandoIndex = -1;
    this.detalleForm.reset({
      cantidadOrdenada: 0,
      cantidadRecibida: 0,
      cantidadRechazada: 0,
      costoUnitario: 0,
      estadoCalidad: 'APROBADO'
    });
    this.showDetalleModal = true;
  }

  abrirModalEditarDetalle(fila: FilaDetalle, index: number): void {
    this.filaEditando = fila;
    this.filaEditandoIndex = index;
    this.detalleForm.patchValue({
      productoId: fila.productoId,
      productoNombre: fila.productoNombre,
      productoSku: fila.productoSku,
      detalleOrdenCompraId: fila.detalleOrdenCompraId,
      cantidadOrdenada: fila.cantidadOrdenada,
      cantidadRecibida: fila.cantidadRecibida,
      cantidadRechazada: fila.cantidadRechazada,
      costoUnitario: fila.costoUnitario,
      estadoCalidad: fila.estadoCalidad,
      numeroLote: fila.numeroLote,
      loteId: fila.loteId,
      fechaFabricacion: fila.fechaFabricacion,
      fechaVencimiento: fila.fechaVencimiento,
      motivoRechazo: fila.motivoRechazo,
      observaciones: fila.observaciones
    });
    this.showDetalleModal = true;
  }

  cerrarModalDetalle(): void {
    this.showDetalleModal = false;
    this.detalleForm.reset();
    this.filaEditando = null;
    this.filaEditandoIndex = -1;
  }

  guardarDetalle(): void {
    const v = this.detalleForm.value;
    if (!v.productoId) {
      this.notificationService.warning('El ID de producto es obligatorio', 'Campo requerido');
      return;
    }
    if (!v.costoUnitario || v.costoUnitario <= 0) {
      this.notificationService.warning('El costo unitario debe ser mayor a 0', 'Campo requerido');
      return;
    }

    const excede = v.cantidadOrdenada > 0 && v.cantidadRecibida > v.cantidadOrdenada;

    const fila: FilaDetalle = {
      id: this.filaEditando?.id,
      detalleOrdenCompraId: v.detalleOrdenCompraId || undefined,
      productoId: v.productoId,
      productoNombre: v.productoNombre || `Producto #${v.productoId}`,
      productoSku: v.productoSku || '',
      cantidadOrdenada: v.cantidadOrdenada || 0,
      cantidadRecibida: v.cantidadRecibida || 0,
      cantidadRechazada: v.cantidadRechazada || 0,
      costoUnitario: v.costoUnitario,
      estadoCalidad: v.estadoCalidad || 'APROBADO',
      numeroLote: v.numeroLote || '',
      loteId: v.loteId || null,
      fechaFabricacion: v.fechaFabricacion || '',
      fechaVencimiento: v.fechaVencimiento || '',
      motivoRechazo: v.motivoRechazo || '',
      observaciones: v.observaciones || '',
      excedeCantidad: excede
    };

    if (this.isEditMode && this.recepcionId && this.esPendiente) {
      const request = this.filaToRequest(fila);
      if (fila.id) {
        this.detalleService.update(fila.id, request).subscribe({
          next: (saved) => {
            fila.id = saved.id;
            if (this.filaEditandoIndex >= 0) {
              this.filas[this.filaEditandoIndex] = fila;
            }
            this.cerrarModalDetalle();
            this.notificationService.success('Producto actualizado', '');
          },
          error: (e) => this.notificationService.error(e.message, 'Error al actualizar')
        });
      } else {
        this.detalleService.create(this.recepcionId!, request).subscribe({
          next: (saved) => {
            fila.id = saved.id;
            this.filas.push(fila);
            this.cerrarModalDetalle();
            this.notificationService.success('Producto agregado', '');
          },
          error: (e) => this.notificationService.error(e.message, 'Error al agregar')
        });
      }
    } else {
      if (this.filaEditandoIndex >= 0) {
        this.filas[this.filaEditandoIndex] = fila;
      } else {
        this.filas.push(fila);
      }
      this.cerrarModalDetalle();
    }
  }

  eliminarFila(fila: FilaDetalle, index: number): void {
    if (this.isEditMode && fila.id && this.esPendiente) {
      this.notificationService.confirm('¿Eliminar este producto de la recepción?', 'Confirmar eliminación')
        .then(confirmed => {
          if (confirmed) {
            this.detalleService.delete(fila.id!).subscribe({
              next: () => {
                this.filas.splice(index, 1);
                this.notificationService.success('Producto eliminado', '');
              },
              error: (e) => this.notificationService.error(e.message, 'Error al eliminar')
            });
          }
        });
    } else {
      this.filas.splice(index, 1);
    }
  }

  get totalCosto(): number {
    return this.filas.reduce((sum, f) => sum + (f.cantidadRecibida * f.costoUnitario), 0);
  }

  get totalUnidades(): number {
    return this.filas.reduce((sum, f) => sum + f.cantidadRecibida, 0);
  }

  get tieneAdvertencias(): boolean {
    return this.filas.some(f => f.excedeCantidad);
  }

  get esPendiente(): boolean {
    if (!this.isEditMode) return true;
    return this.recepcion?.estado === EstadoRecepcion.PENDIENTE;
  }

  guardarRecepcion(): void {
    if (this.headerForm.invalid) {
      this.notificationService.warning('Completa todos los campos obligatorios', 'Formulario incompleto');
      this.headerForm.markAllAsTouched();
      return;
    }
    if (this.filas.length === 0) {
      this.notificationService.warning('Debes agregar al menos un producto a recibir', 'Sin productos');
      return;
    }

    const v = this.headerForm.getRawValue();
    const request: RecepcionInventarioRequest = {
      numeroRecepcion: v.numeroRecepcion,
      ordenCompraId: v.ordenCompraId,
      proveedorId: v.proveedorId,
      fechaRecepcion: v.fechaRecepcion,
      bodegaId: v.bodegaId,
      responsableRecepcionId: v.responsableRecepcionId || undefined,
      numeroFacturaProveedor: v.numeroFacturaProveedor || undefined,
      numeroGuiaRemision: v.numeroGuiaRemision || undefined,
      observaciones: v.observaciones || undefined,
      detalles: []
    };

    if (this.isEditMode && this.recepcionId) {
      this.actualizarEncabezado(request);
    } else {
      this.crearRecepcion(request);
    }
  }

  private crearRecepcion(request: RecepcionInventarioRequest): void {
    this.isSaving = true;
    this.recepcionService.create(request).subscribe({
      next: (recepcion) => {
        const calls = this.filas.map(f => this.detalleService.create(recepcion.id, this.filaToRequest(f)));
        forkJoin(calls).subscribe({
          next: () => {
            const usuarioId = this.authService.userId;
            if (!usuarioId) {
              this.isSaving = false;
              this.notificationService.error('No se pudo obtener el usuario autenticado', 'Error');
              return;
            }
            this.recepcionService.confirmar(recepcion.id, usuarioId).subscribe({
              next: () => {
                this.isSaving = false;
                this.notificationService.success(
                  `Recepción ${recepcion.numeroRecepcion} creada y confirmada. La OC fue marcada como RECIBIDA.`,
                  'Completado'
                );
                this.router.navigate(['/compras/recepciones']);
              },
              error: (e) => {
                this.isSaving = false;
                this.notificationService.error(
                  `Productos guardados pero no se pudo confirmar: ${e.message}`,
                  'Advertencia'
                );
                this.router.navigate(['/compras/recepciones', recepcion.id, 'editar']);
              }
            });
          },
          error: (e) => {
            this.isSaving = false;
            this.notificationService.error(
              `Encabezado creado pero algunos productos fallaron: ${e.message}`,
              'Advertencia'
            );
            this.router.navigate(['/compras/recepciones', recepcion.id, 'editar']);
          }
        });
      },
      error: (e) => {
        this.isSaving = false;
        this.notificationService.error(e.message, 'Error al crear recepción');
      }
    });
  }

  private actualizarEncabezado(request: RecepcionInventarioRequest): void {
    this.isSaving = true;
    this.recepcionService.update(this.recepcionId!, request).subscribe({
      next: (recepcion) => {
        this.isSaving = false;
        this.notificationService.success(`Recepción ${recepcion.numeroRecepcion} actualizada`, 'Guardado');
        this.router.navigate(['/compras/recepciones']);
      },
      error: (e) => {
        this.isSaving = false;
        this.notificationService.error(e.message, 'Error al actualizar');
      }
    });
  }

  confirmarRecepcion(): void {
    if (!this.recepcionId || !this.recepcion) return;
    if (this.filas.length === 0) {
      this.notificationService.warning('Agrega al menos un producto antes de confirmar', 'Sin productos');
      return;
    }
    this.notificationService.confirm(
      `¿Confirmar la recepción ${this.recepcion.numeroRecepcion}? Se generará el movimiento de inventario y no podrá revertirse.`,
      'Confirmar recepción'
    ).then(confirmed => {
      if (confirmed) {
        const usuarioId = this.authService.userId;
        if (!usuarioId) {
          this.notificationService.error('No se pudo obtener el usuario autenticado', 'Error');
          return;
        }
        this.recepcionService.confirmar(this.recepcionId!, usuarioId).subscribe({
          next: (data) => {
            this.notificationService.success(`Recepción ${data.numeroRecepcion} confirmada exitosamente`, 'Confirmada');
            this.router.navigate(['/compras/recepciones']);
          },
          error: (e) => this.notificationService.error(e.message, 'Error al confirmar')
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/compras/recepciones']);
  }

  calcularCostoFila(fila: FilaDetalle): number {
    return fila.cantidadRecibida * fila.costoUnitario;
  }

  onCantidadChange(): void {
    const v = this.detalleForm.value;
    if (v.cantidadOrdenada > 0 && v.cantidadRecibida > v.cantidadOrdenada) {
      // visual warning handled in template
    }
  }

  get cantidadRecibidaExcede(): boolean {
    const v = this.detalleForm.value;
    return v.cantidadOrdenada > 0 && v.cantidadRecibida > v.cantidadOrdenada;
  }

  isHeaderFieldInvalid(field: string): boolean {
    const f = this.headerForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  getHeaderFieldError(field: string): string {
    const f = this.headerForm.get(field);
    if (f?.hasError('required')) return 'Este campo es obligatorio';
    if (f?.hasError('minlength')) return `Mínimo ${f.errors?.['minlength'].requiredLength} caracteres`;
    return '';
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-warning';
      case 'CONFIRMADA': return 'badge-success';
      case 'CANCELADA': return 'badge-error';
      default: return 'badge-default';
    }
  }

  getCalidadBadgeClass(estado: string): string {
    switch (estado) {
      case 'APROBADO': return 'badge-success';
      case 'RECHAZADO': return 'badge-error';
      case 'INSPECCION': return 'badge-warning';
      default: return 'badge-default';
    }
  }

  private filaToRequest(fila: FilaDetalle): DetalleRecepcionRequest {
    return {
      detalleOrdenCompraId: fila.detalleOrdenCompraId,
      productoId: fila.productoId,
      loteId: fila.loteId || undefined,
      numeroLote: fila.numeroLote || undefined,
      fechaFabricacion: fila.fechaFabricacion || undefined,
      fechaVencimiento: fila.fechaVencimiento || undefined,
      cantidadOrdenada: fila.cantidadOrdenada,
      cantidadRecibida: fila.cantidadRecibida,
      cantidadRechazada: fila.cantidadRechazada,
      costoUnitario: fila.costoUnitario,
      estadoCalidad: fila.estadoCalidad || undefined,
      motivoRechazo: fila.motivoRechazo || undefined,
      observaciones: fila.observaciones || undefined
    };
  }

  private generarNumeroRecepcion(): string {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `REC-${year}${month}-${random}`;
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
