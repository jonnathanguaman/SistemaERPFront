import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecepcionInventarioService } from '../../Service/recepcion-inventario.service';
import { RecepcionInventarioRequest, RecepcionInventarioResponse, EstadoRecepcion } from '../../Entidades/recepcion-inventario.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { OrdenCompraService } from '../../Service/orden-compra.service';
import { ProveedorService } from '../../Service/proveedor.service';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { PersonaService } from '../../../ModuloEmpleados/Service/persona.service';
import { OrdenCompraResponse } from '../../Entidades/orden-compra.model';
import { ProveedorResponse } from '../../Entidades/proveedor.model';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { PersonaResponse } from '../../../ModuloEmpleados/Entidades/persona.model';

@Component({
  selector: 'app-recepcion-inventario',
  standalone: false,
  templateUrl: './recepcion-inventario.component.html',
  styleUrl: './recepcion-inventario.component.css'
})
export class RecepcionInventarioComponent implements OnInit {
  
  recepciones: RecepcionInventarioResponse[] = [];
  recepcionSeleccionada: RecepcionInventarioResponse | null = null;
  recepcionForm: FormGroup;
  
  // Listas para los dropdowns
  ordenes: OrdenCompraResponse[] = [];
  proveedores: ProveedorResponse[] = [];
  bodegas: BodegaResponse[] = [];
  responsables: PersonaResponse[] = [];
  
  isLoading: boolean = false;
  showModal: boolean = false;
  showDetalleModal: boolean = false;
  isEditMode: boolean = false;
  
  searchTerm: string = '';
  
  // Estados de recepción
  estadosRecepcion = Object.values(EstadoRecepcion);
  
  constructor(
    private readonly recepcionService: RecepcionInventarioService,
    private readonly ordenCompraService: OrdenCompraService,
    private readonly proveedorService: ProveedorService,
    private readonly bodegaService: BodegaService,
    private readonly personaService: PersonaService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.recepcionForm = this.formBuilder.group({
      numeroRecepcion: ['', [Validators.required, Validators.minLength(3)]],
      ordenCompraId: [null, [Validators.required]],
      proveedorId: [null, [Validators.required]],
      fechaRecepcion: ['', [Validators.required]],
      bodegaId: [null, [Validators.required]],
      responsableRecepcionId: [null],
      numeroFacturaProveedor: [''],
      numeroGuiaRemision: [''],
      estado: [EstadoRecepcion.PENDIENTE],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarRecepciones();
    this.cargarDatosFormulario();
  }

  cargarDatosFormulario(): void {
    // Cargar órdenes de compra activas
    this.ordenCompraService.findActive().subscribe({
      next: (data) => {
        this.ordenes = data;
      },
      error: (error) => {
        console.error('Error al cargar órdenes de compra:', error);
      }
    });

    // Cargar proveedores activos
    this.proveedorService.findActive().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
      }
    });

    // Cargar bodegas
    this.bodegaService.findAll().subscribe({
      next: (data) => {
        this.bodegas = data.filter(b => b.activo);
      },
      error: (error) => {
        console.error('Error al cargar bodegas:', error);
      }
    });

    // Cargar personas (responsables)
    this.personaService.findAll().subscribe({
      next: (data) => {
        this.responsables = data.filter(p => p.activo);
      },
      error: (error) => {
        console.error('Error al cargar responsables:', error);
      }
    });
  }

  cargarRecepciones(): void {
    this.isLoading = true;
    
    this.recepcionService.findAll().subscribe({
      next: (data) => {
        this.recepciones = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar recepciones');
        console.error('Error al cargar recepciones:', error);
      }
    });
  }

  get recepcionesFiltradas(): RecepcionInventarioResponse[] {
    if (!this.searchTerm) {
      return this.recepciones;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.recepciones.filter(recepcion =>
      recepcion.numeroRecepcion?.toLowerCase().includes(term) ||
      recepcion.proveedorRazonSocial?.toLowerCase().includes(term) ||
      recepcion.numeroFacturaProveedor?.toLowerCase().includes(term) ||
      recepcion.numeroGuiaRemision?.toLowerCase().includes(term) ||
      recepcion.estado?.toLowerCase().includes(term)
    );
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.recepcionSeleccionada = null;
    this.recepcionForm.reset({
      numeroRecepcion: this.generarNumeroRecepcion(),
      fechaRecepcion: new Date().toISOString().split('T')[0],
      estado: EstadoRecepcion.PENDIENTE
    });
    this.showModal = true;
  }

  abrirModalEditar(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado !== EstadoRecepcion.PENDIENTE) {
      this.notificationService.warning(
        'Solo se pueden editar recepciones en estado PENDIENTE',
        'Operación no permitida'
      );
      return;
    }
    
    this.isEditMode = true;
    this.recepcionSeleccionada = recepcion;
    
    this.recepcionForm.patchValue({
      numeroRecepcion: recepcion.numeroRecepcion,
      ordenCompraId: recepcion.ordenCompraId,
      proveedorId: recepcion.proveedorId,
      fechaRecepcion: recepcion.fechaRecepcion,
      bodegaId: recepcion.bodegaId,
      responsableRecepcionId: recepcion.responsableRecepcionId,
      numeroFacturaProveedor: recepcion.numeroFacturaProveedor,
      numeroGuiaRemision: recepcion.numeroGuiaRemision,
      estado: recepcion.estado,
      observaciones: recepcion.observaciones
    });
    
    this.showModal = true;
  }

  verDetalle(recepcion: RecepcionInventarioResponse): void {
    this.recepcionSeleccionada = recepcion;
    this.showDetalleModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.recepcionForm.reset();
    this.recepcionSeleccionada = null;
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.recepcionSeleccionada = null;
  }

  guardarRecepcion(): void {
    if (this.recepcionForm.invalid) {
      this.notificationService.warning(
        'Por favor, completa todos los campos obligatorios',
        'Formulario incompleto'
      );
      this.recepcionForm.markAllAsTouched();
      return;
    }

    const formValue = this.recepcionForm.value;
    
    // Construir el request asegurando los tipos correctos
    const recepcionRequest: RecepcionInventarioRequest = {
      numeroRecepcion: formValue.numeroRecepcion,
      ordenCompraId: formValue.ordenCompraId,
      proveedorId: formValue.proveedorId,
      fechaRecepcion: formValue.fechaRecepcion,
      bodegaId: formValue.bodegaId,
      responsableRecepcionId: formValue.responsableRecepcionId || undefined,
      numeroFacturaProveedor: formValue.numeroFacturaProveedor || undefined,
      numeroGuiaRemision: formValue.numeroGuiaRemision || undefined,
      estado: formValue.estado,
      observaciones: formValue.observaciones || undefined,
      detalles: [] // El backend requiere detalles, enviamos array vacío inicialmente
    };

    if (this.isEditMode && this.recepcionSeleccionada) {
      this.actualizarRecepcion(this.recepcionSeleccionada.id, recepcionRequest);
    } else {
      this.crearRecepcion(recepcionRequest);
    }
  }

  private crearRecepcion(recepcion: RecepcionInventarioRequest): void {
    console.log('Datos a enviar:', recepcion); // Debug
    
    this.recepcionService.create(recepcion).subscribe({
      next: (data) => {
        this.notificationService.success(
          `Recepción ${data.numeroRecepcion} creada exitosamente`,
          'Operación exitosa'
        );
        this.cerrarModal();
        this.cargarRecepciones();
      },
      error: (error) => {
        console.error('Error completo:', error); // Debug detallado
        const mensaje = error.error?.message || error.message || 'Error al crear recepción';
        this.notificationService.error(mensaje, 'Error al crear recepción');
      }
    });
  }

  private actualizarRecepcion(id: number, recepcion: RecepcionInventarioRequest): void {
    this.recepcionService.update(id, recepcion).subscribe({
      next: (data) => {
        this.notificationService.success(
          `Recepción ${data.numeroRecepcion} actualizada exitosamente`,
          'Operación exitosa'
        );
        this.cerrarModal();
        this.cargarRecepciones();
      },
      error: (error) => {
        this.notificationService.error(error.message, 'Error al actualizar recepción');
        console.error('Error al actualizar recepción:', error);
      }
    });
  }

  confirmarRecepcion(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado !== EstadoRecepcion.PENDIENTE) {
      this.notificationService.warning(
        'Solo se pueden confirmar recepciones en estado PENDIENTE',
        'Operación no permitida'
      );
      return;
    }

    this.notificationService.confirm(
      `¿Estás seguro de confirmar la recepción ${recepcion.numeroRecepcion}?`,
      'Confirmar recepción'
    ).then((confirmed) => {
      if (confirmed) {
        this.recepcionService.confirmar(recepcion.id).subscribe({
          next: (data) => {
            this.notificationService.success(
              `Recepción ${data.numeroRecepcion} confirmada exitosamente`,
              'Operación exitosa'
            );
            this.cargarRecepciones();
          },
          error: (error) => {
            this.notificationService.error(error.message, 'Error al confirmar recepción');
            console.error('Error al confirmar recepción:', error);
          }
        });
      }
    });
  }

  cancelarRecepcion(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado === EstadoRecepcion.CANCELADA) {
      this.notificationService.warning(
        'La recepción ya está cancelada',
        'Operación no permitida'
      );
      return;
    }

    this.notificationService.confirmWithInput(
      '¿Estás seguro de cancelar esta recepción?',
      'Motivo de cancelación',
      'Cancelar recepción'
    ).then((result: any) => {
      if (result.isConfirmed && result.value) {
        this.recepcionService.cancelar(recepcion.id, result.value).subscribe({
          next: (data) => {
            this.notificationService.success(
              `Recepción ${data.numeroRecepcion} cancelada exitosamente`,
              'Operación exitosa'
            );
            this.cargarRecepciones();
          },
          error: (error) => {
            this.notificationService.error(error.message, 'Error al cancelar recepción');
            console.error('Error al cancelar recepción:', error);
          }
        });
      }
    });
  }

  eliminarRecepcion(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado === EstadoRecepcion.CONFIRMADA) {
      this.notificationService.warning(
        'No se puede eliminar una recepción confirmada',
        'Operación no permitida'
      );
      return;
    }

    this.notificationService.confirm(
      `¿Estás seguro de eliminar la recepción ${recepcion.numeroRecepcion}?`,
      'Eliminar recepción'
    ).then((confirmed) => {
      if (confirmed) {
        this.recepcionService.delete(recepcion.id).subscribe({
          next: () => {
            this.notificationService.success(
              `Recepción ${recepcion.numeroRecepcion} eliminada exitosamente`,
              'Operación exitosa'
            );
            this.cargarRecepciones();
          },
          error: (error) => {
            this.notificationService.error(error.message, 'Error al eliminar recepción');
            console.error('Error al eliminar recepción:', error);
          }
        });
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case EstadoRecepcion.PENDIENTE:
        return 'badge-warning';
      case EstadoRecepcion.CONFIRMADA:
        return 'badge-success';
      case EstadoRecepcion.CANCELADA:
        return 'badge-error';
      default:
        return 'badge-default';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recepcionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.recepcionForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return `El valor mínimo es ${field.errors?.['min'].min}`;
    }
    return '';
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
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
