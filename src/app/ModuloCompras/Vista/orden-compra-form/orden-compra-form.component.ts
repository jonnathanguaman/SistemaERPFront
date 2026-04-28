import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdenCompraService } from '../../Service/orden-compra.service';
import { ProveedorService } from '../../Service/proveedor.service';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { AuthService } from '../../../Compartido/services/auth.service';
import { OrdenCompraRequest, OrdenCompraResponse } from '../../Entidades/orden-compra.model';
import { ProveedorResponse } from '../../Entidades/proveedor.model';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { ProductoService } from '../../../ModuloInventario/Service/producto.service';
import { ProductoResponse } from '../../../ModuloInventario/Entidad/producto.model';
import { IvaProductoService } from '../../../ModuloVentas/Service/iva-producto.service';

@Component({
  selector: 'app-orden-compra-form',
  standalone: false,
  templateUrl: './orden-compra-form.component.html',
  styleUrl: './orden-compra-form.component.css'
})
export class OrdenCompraFormComponent implements OnInit {
  proveedores: ProveedorResponse[] = [];
  bodegas: BodegaResponse[] = [];
  productos: ProductoResponse[] = [];
  private readonly ivaPorProducto = new Map<number, number>();
  ordenSeleccionada: OrdenCompraResponse | null = null;
  ordenForm: FormGroup;

  isLoading = false;
  isLoadingProductos = false;
  isEditMode = false;
  isViewMode = false;
  ordenId: number | null = null;
  estadosDisponibles = ['BORRADOR', 'APROBADA', 'ENVIADA', 'CONFIRMADA', 'RECIBIDA', 'FACTURADA', 'CANCELADA'];

  constructor(
    private readonly ordenCompraService: OrdenCompraService,
    private readonly proveedorService: ProveedorService,
    private readonly bodegaService: BodegaService,
    private readonly productoService: ProductoService,
    private readonly ivaProductoService: IvaProductoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.ordenForm = this.formBuilder.group({
      numeroOrden: [{ value: '', disabled: true }, [Validators.required, Validators.maxLength(20)]],
      proveedorId: ['', [Validators.required]],
      fechaOrden: ['', [Validators.required]],
      fechaEntregaEsperada: [''],
      bodegaId: [null, [Validators.required]],
      direccionEntrega: [''],
      compradorId: [''],
      aprobadorId: [''],
      condicionPagoId: [''],
      diasCredito: [''],
      formaPagoId: [''],
      subtotal: [{ value: 0, disabled: true }],
      descuentoPorcentaje: [0],
      descuentoMonto: [{ value: 0, disabled: true }],
      impuestoMonto: [{ value: 0, disabled: true }],
      total: [{ value: 0, disabled: true }],
      estado: ['BORRADOR'],
      observaciones: [''],
      terminosCondiciones: [''],
      detalles: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    this.detalles.valueChanges.subscribe(() => {
      this.recalcularTotales();
    });

    this.cargarProveedores();
    this.cargarBodegas();
    this.cargarProductos();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      this.ordenId = idParam ? Number(idParam) : null;
      this.isEditMode = !!this.ordenId;

      this.route.queryParamMap.subscribe(queryParams => {
        this.isViewMode = queryParams.get('modo') === 'ver';

        if (this.ordenId) {
          this.cargarOrden(this.ordenId);
        } else {
          this.inicializarNuevaOrden();
        }
      });
    });
  }

  get detalles(): FormArray {
    return this.ordenForm.get('detalles') as FormArray;
  }

  get detallesControls(): FormGroup[] {
    return this.detalles.controls as FormGroup[];
  }

  get tituloPagina(): string {
    if (this.isViewMode) {
      return 'Detalle de Orden de Compra';
    }
    return this.isEditMode ? 'Editar Orden de Compra' : 'Nueva Orden de Compra';
  }

  get estadoActual(): string {
    return String(this.ordenForm.get('estado')?.value || 'BORRADOR');
  }

  get esEstadoBorrador(): boolean {
    return this.estadoActual === 'BORRADOR';
  }

  get puedeEditarFormulario(): boolean {
    return !this.isViewMode && this.esEstadoBorrador;
  }

  get mostrarAccionesEdicion(): boolean {
    return this.puedeEditarFormulario && this.ordenForm.dirty;
  }

  private inicializarNuevaOrden(): void {
    this.ordenSeleccionada = null;
    this.isEditMode = false;
    this.ordenForm.enable({ emitEvent: false });
    this.ordenForm.reset({
      estado: 'BORRADOR',
      descuentoPorcentaje: 0,
      descuentoMonto: 0,
      impuestoMonto: 0,
      subtotal: 0,
      total: 0,
      fechaOrden: new Date().toISOString().split('T')[0]
    });
    this.detalles.clear();
    this.agregarDetalle();
    this.actualizarEstadoEdicion();
    this.ordenForm.markAsPristine();
    this.ordenForm.markAsUntouched();
    this.recalcularTotales();
  }

  private cargarOrden(id: number): void {
    this.isLoading = true;
    this.ordenCompraService.findById(id).subscribe({
      next: (orden) => {
        this.isLoading = false;
        this.ordenSeleccionada = orden;
        this.ordenForm.patchValue({
          numeroOrden: orden.numeroOrden,
          proveedorId: orden.proveedorId,
          fechaOrden: this.normalizarFecha(orden.fechaOrden),
          fechaEntregaEsperada: this.normalizarFecha(orden.fechaEntregaEsperada),
          bodegaId: orden.bodegaId,
          direccionEntrega: orden.direccionEntrega,
          compradorId: orden.compradorId,
          aprobadorId: orden.aprobadorId,
          condicionPagoId: orden.condicionPagoId,
          diasCredito: orden.diasCredito,
          formaPagoId: orden.formaPagoId,
          subtotal: Number(orden.subtotal || 0),
          descuentoPorcentaje: orden.descuentoPorcentaje,
          descuentoMonto: Number(orden.descuentoMonto || 0),
          impuestoMonto: Number(orden.impuestoMonto || 0),
          total: Number(orden.total || 0),
          estado: orden.estado,
          observaciones: orden.observaciones,
          terminosCondiciones: orden.terminosCondiciones
        });

        this.detalles.clear();
        if (orden.detalles && orden.detalles.length > 0) {
          orden.detalles.forEach(detalle => {
            this.detalles.push(this.crearDetalleGroup({
              productoId: detalle.productoId,
              cantidadOrdenada: Number(detalle.cantidadOrdenada || 0),
              precioUnitario: Number(detalle.precioUnitario || 0),
              descuentoPorcentaje: Number(detalle.descuentoPorcentaje || 0),
              descuentoMonto: Number(detalle.descuentoMonto || 0),
              impuestoPorcentaje: Number(detalle.impuestoPorcentaje || 0),
              observaciones: detalle.observaciones || ''
            }));
          });
        } else {
          this.agregarDetalle();
        }

        this.recalcularTotales();
        this.actualizarEstadoEdicion();
        this.ordenForm.markAsPristine();
        this.ordenForm.markAsUntouched();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar orden');
        this.router.navigate(['/compras/ordenes']);
      }
    });
  }

  private normalizarFecha(fecha?: string): string {
    if (!fecha) {
      return '';
    }
    return fecha.length >= 10 ? fecha.substring(0, 10) : fecha;
  }

  cargarProveedores(): void {
    this.proveedorService.findActive().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar proveedores');
      }
    });
  }

  cargarBodegas(): void {
    this.bodegaService.findAll().subscribe({
      next: (data) => {
        this.bodegas = data.filter(
          (bodega) => bodega.activo
            && bodega.bodegaTipo === 'CONTABLE'
            && bodega.permiteBodegaDestino === true
        );
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al cargar bodegas');
      }
    });
  }

  cargarProductos(): void {
    this.isLoadingProductos = true;
    this.productoService.findAll().subscribe({
      next: (data) => {
        this.productos = data.filter(producto => producto.activo && producto.estado);
        this.isLoadingProductos = false;
      },
      error: (error) => {
        this.isLoadingProductos = false;
        this.notificationService.error(error.message, 'Error al cargar productos');
      }
    });
  }

  volverAlListado(): void {
    this.router.navigate(['/compras/ordenes']);
  }

  isEstadoActivo(estado: string): boolean {
    return this.estadoActual === estado;
  }

  puedeSeleccionarEstado(estadoDestino: string): boolean {
    if (this.isViewMode || this.isLoading || !this.ordenId) {
      return false;
    }

    const estadoOrigen = this.estadoActual;
    if (estadoDestino === estadoOrigen) {
      return false;
    }

    switch (estadoOrigen) {
      case 'BORRADOR':
        return estadoDestino === 'APROBADA' || estadoDestino === 'CANCELADA';
      case 'APROBADA':
        return estadoDestino === 'ENVIADA' || estadoDestino === 'CANCELADA';
      case 'ENVIADA':
        return estadoDestino === 'CONFIRMADA' || estadoDestino === 'CANCELADA';
      case 'CONFIRMADA':
        return estadoDestino === 'RECIBIDA' || estadoDestino === 'CANCELADA';
      case 'RECIBIDA':
        return estadoDestino === 'FACTURADA';
      default:
        return false;
    }
  }

  seleccionarEstado(estadoDestino: string): void {
    if (!this.ordenId || !this.puedeSeleccionarEstado(estadoDestino)) {
      return;
    }

    switch (estadoDestino) {
      case 'APROBADA':
        this.aprobarOrden();
        break;
      case 'ENVIADA':
        this.enviarOrden();
        break;
      case 'CONFIRMADA':
        this.confirmarOrden();
        break;
      case 'RECIBIDA':
        this.recibirOrden();
        break;
      case 'FACTURADA':
        this.facturarOrden();
        break;
      case 'CANCELADA':
        this.cancelarOrden();
        break;
      default:
        break;
    }
  }

  private getUsuarioId(): number | null {
    return this.authService.userId;
  }

  private aplicarRespuestaEstado(response: OrdenCompraResponse): void {
    this.ordenSeleccionada = response;
    this.ordenForm.patchValue({ estado: response.estado }, { emitEvent: false });
    this.actualizarEstadoEdicion();
  }

  private actualizarEstadoEdicion(): void {
    if (this.puedeEditarFormulario) {
      this.ordenForm.enable({ emitEvent: false });
      this.ordenForm.get('estado')?.disable({ emitEvent: false });
      this.detalles.enable({ emitEvent: false });
      return;
    }

    this.ordenForm.disable({ emitEvent: false });
  }

  aprobarOrden(): void {
    if (!this.ordenId) {
      return;
    }
    const usuarioId = this.getUsuarioId();
    if (!usuarioId) {
      this.notificationService.warning('No se pudo identificar el usuario autenticado. Vuelve a iniciar sesión.');
      return;
    }

    this.isLoading = true;
    this.ordenCompraService.aprobar(this.ordenId, usuarioId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.aplicarRespuestaEstado(response);
        this.notificationService.success('Orden aprobada exitosamente');
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al aprobar');
      }
    });
  }

  enviarOrden(): void {
    if (!this.ordenId) {
      return;
    }

    this.isLoading = true;
    this.ordenCompraService.enviar(this.ordenId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.aplicarRespuestaEstado(response);
        this.notificationService.success('Orden enviada exitosamente');
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al enviar');
      }
    });
  }

  confirmarOrden(): void {
    if (!this.ordenId) {
      return;
    }

    this.isLoading = true;
    this.ordenCompraService.confirmar(this.ordenId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.aplicarRespuestaEstado(response);
        this.notificationService.success('Orden confirmada exitosamente');
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al confirmar');
      }
    });
  }

  recibirOrden(): void {
    if (!this.ordenId) {
      return;
    }
    const usuarioId = this.getUsuarioId();
    if (!usuarioId) {
      this.notificationService.warning('No se pudo identificar el usuario autenticado. Vuelve a iniciar sesión.');
      return;
    }

    this.isLoading = true;
    this.ordenCompraService.recibir(this.ordenId, usuarioId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.aplicarRespuestaEstado(response);
        this.notificationService.success('Orden recibida. Se generó movimiento de entrada en Kardex.');
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al recibir');
      }
    });
  }

  facturarOrden(): void {
    if (!this.ordenId) {
      return;
    }

    this.isLoading = true;
    this.ordenCompraService.facturar(this.ordenId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.aplicarRespuestaEstado(response);
        this.notificationService.success('Orden facturada exitosamente');
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al facturar');
      }
    });
  }

  cancelarOrden(): void {
    if (!this.ordenId) {
      return;
    }

    this.isLoading = true;
    this.ordenCompraService.cancelar(this.ordenId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.aplicarRespuestaEstado(response);
        this.notificationService.success('Orden cancelada exitosamente');
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cancelar');
      }
    });
  }

  agregarDetalle(): void {
    if (!this.puedeEditarFormulario) {
      return;
    }

    const detalleGroup = this.crearDetalleGroup();

    this.detalles.push(detalleGroup);
    this.recalcularTotales();

    if (this.puedeEditarFormulario) {
      detalleGroup.enable({ emitEvent: false });
    }
  }

  eliminarDetalle(index: number): void {
    if (!this.puedeEditarFormulario) {
      return;
    }

    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
      this.recalcularTotales();
    } else {
      this.notificationService.warning('Debe haber al menos un detalle en la orden');
    }
  }

  onLineaChange(): void {
    if (!this.puedeEditarFormulario) {
      return;
    }
    this.recalcularTotales();
  }

  onProductoDetalleChange(index: number): void {
    if (!this.puedeEditarFormulario) {
      return;
    }

    const detalle = this.detalles.at(index);
    const productoId = Number(detalle.get('productoId')?.value || 0);

    if (!productoId) {
      detalle.get('impuestoPorcentaje')?.setValue(0, { emitEvent: false });
      this.recalcularTotales();
      return;
    }

    const ivaCacheado = this.ivaPorProducto.get(productoId);
    if (ivaCacheado !== undefined) {
      detalle.get('impuestoPorcentaje')?.setValue(ivaCacheado, { emitEvent: false });
      this.recalcularTotales();
      return;
    }

    this.ivaProductoService.findVigenteByProducto(productoId).subscribe({
      next: (iva) => {
        const porcentaje = Number(iva.impuestoPorcentaje || 0);
        this.ivaPorProducto.set(productoId, porcentaje);
        detalle.get('impuestoPorcentaje')?.setValue(porcentaje, { emitEvent: false });
        this.recalcularTotales();
      },
      error: () => {
        this.ivaPorProducto.set(productoId, 0);
        detalle.get('impuestoPorcentaje')?.setValue(0, { emitEvent: false });
        this.recalcularTotales();
      }
    });
  }

  private crearDetalleGroup(valores?: {
    productoId?: number | null;
    cantidadOrdenada?: number;
    precioUnitario?: number;
    descuentoPorcentaje?: number;
    descuentoMonto?: number;
    impuestoPorcentaje?: number;
    observaciones?: string;
  }): FormGroup {
    const detalleGroup = this.formBuilder.group({
      productoId: [valores?.productoId ?? null, [Validators.required]],
      cantidadOrdenada: [valores?.cantidadOrdenada ?? 1, [Validators.required, Validators.min(0.0001)]],
      precioUnitario: [valores?.precioUnitario ?? 0, [Validators.required, Validators.min(0)]],
      descuentoPorcentaje: [valores?.descuentoPorcentaje ?? 0],
      descuentoMonto: [valores?.descuentoMonto ?? 0],
      impuestoPorcentaje: [valores?.impuestoPorcentaje ?? 0, [Validators.required, Validators.min(0)]],
      observaciones: [valores?.observaciones ?? '']
    });

    detalleGroup.valueChanges.subscribe(() => {
      this.recalcularTotales();
    });

    return detalleGroup;
  }

  private redondear(valor: number): number {
    return Number((valor || 0).toFixed(2));
  }

  private recalcularTotales(): void {
    let subtotal = 0;
    let descuentoMonto = 0;
    let impuestoMonto = 0;

    this.detallesControls.forEach((_, index) => {
      const detalle = this.detalles.at(index);
      const subtotalLinea = this.calcularSubtotalDetalle(index);
      const descuentoLinea = subtotalLinea * ((Number(detalle.get('descuentoPorcentaje')?.value || 0) / 100));
      const descuentoLineaRedondeado = this.redondear(descuentoLinea);

      detalle.get('descuentoMonto')?.setValue(descuentoLineaRedondeado, { emitEvent: false });

      const baseImponible = Math.max(subtotalLinea - descuentoLineaRedondeado, 0);
      const impuestoLinea = baseImponible * ((Number(detalle.get('impuestoPorcentaje')?.value || 0) / 100));

      subtotal += subtotalLinea;
      descuentoMonto += descuentoLineaRedondeado;
      impuestoMonto += impuestoLinea;
    });

    const total = Math.max(subtotal - descuentoMonto + impuestoMonto, 0);

    this.ordenForm.patchValue({
      subtotal: this.redondear(subtotal),
      descuentoMonto: this.redondear(descuentoMonto),
      impuestoMonto: this.redondear(impuestoMonto),
      total: this.redondear(total)
    }, { emitEvent: false });
  }

  isDetalleFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.detalles.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  calcularSubtotalDetalle(index: number): number {
    const detalle = this.detalles.at(index).value;
    const cantidad = Number(detalle.cantidadOrdenada) || 0;
    const precio = Number(detalle.precioUnitario) || 0;
    return cantidad * precio;
  }

  calcularDescuentoDetalle(index: number): number {
    const detalle = this.detalles.at(index).value;
    return Number(detalle.descuentoMonto) || 0;
  }

  calcularImpuestoDetalle(index: number): number {
    const detalle = this.detalles.at(index).value;
    const base = this.calcularSubtotalDetalle(index) - this.calcularDescuentoDetalle(index);
    const impuestoPorcentaje = Number(detalle.impuestoPorcentaje) || 0;
    return base * (impuestoPorcentaje / 100);
  }

  calcularTotalDetalle(index: number): number {
    const base = this.calcularSubtotalDetalle(index) - this.calcularDescuentoDetalle(index);
    return base + this.calcularImpuestoDetalle(index);
  }

  calcularSubtotalOrden(): number {
    return Number(this.ordenForm.get('subtotal')?.value || 0);
  }

  calcularDescuentoOrden(): number {
    return Number(this.ordenForm.get('descuentoMonto')?.value || 0);
  }

  calcularImpuestoOrden(): number {
    return Number(this.ordenForm.get('impuestoMonto')?.value || 0);
  }

  calcularTotalOrden(): number {
    return Number(this.ordenForm.get('total')?.value || 0);
  }

  guardarOrden(): void {
    if (!this.puedeEditarFormulario) {
      return;
    }

    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    if (this.detalles.length === 0) {
      this.notificationService.warning('Debe agregar al menos un detalle a la orden.');
      return;
    }

    this.isLoading = true;

    const formData = this.ordenForm.getRawValue();
    const ordenData: OrdenCompraRequest = {
      numeroOrden: formData.numeroOrden,
      proveedorId: formData.proveedorId,
      fechaOrden: formData.fechaOrden,
      fechaEntregaEsperada: formData.fechaEntregaEsperada,
      fechaEntregaReal: formData.fechaEntregaReal,
      bodegaId: formData.bodegaId,
      direccionEntrega: formData.direccionEntrega,
      compradorId: formData.compradorId,
      aprobadorId: formData.aprobadorId,
      condicionPagoId: formData.condicionPagoId,
      diasCredito: formData.diasCredito,
      formaPagoId: formData.formaPagoId,
      descuentoPorcentaje: formData.descuentoPorcentaje,
      descuentoMonto: formData.descuentoMonto,
      estado: formData.estado,
      observaciones: formData.observaciones,
      terminosCondiciones: formData.terminosCondiciones,
      detalles: this.detalles.value
    };

    if (this.isEditMode && this.ordenSeleccionada) {
      this.ordenCompraService.update(this.ordenSeleccionada.id, ordenData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.ordenSeleccionada = response;
          this.ordenForm.markAsPristine();
          this.ordenForm.markAsUntouched();
          this.notificationService.success('Orden de compra actualizada exitosamente');
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.ordenCompraService.save(ordenData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.ordenForm.markAsPristine();
          this.ordenForm.markAsUntouched();
          this.notificationService.success('Orden de compra creada exitosamente');
          this.router.navigate(['/compras/ordenes', response.id]);
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  descartarCambios(): void {
    if (!this.puedeEditarFormulario || !this.ordenForm.dirty) {
      return;
    }

    if (this.ordenId) {
      this.cargarOrden(this.ordenId);
      return;
    }

    this.inicializarNuevaOrden();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ordenForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.ordenForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }

    return '';
  }
}
