import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../Compartido/services/auth.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { ProductoResponse } from '../../Entidad/producto.model';
import { ProductoService } from '../../Service/producto.service';
import { SolicitudTransferenciaRequest, SolicitudTransferenciaResponse, DetalleSolicitudTransferenciaRequest } from '../../Entidad/solicitud-transferencia.model';
import { SolicitudTransferenciaService } from '../../Service/solicitud-transferencia.service';

interface DetalleLinea {
  productoId: number | null;
  cantidadSolicitada: number;
  cantidadAprobada: number | null;
  observaciones: string;
}

@Component({
  selector: 'app-solicitud-transferencia',
  standalone: false,
  templateUrl: './solicitud-transferencia.component.html',
  styleUrl: './solicitud-transferencia.component.css'
})
export class SolicitudTransferenciaComponent implements OnInit {
  solicitudes: SolicitudTransferenciaResponse[] = [];
  solicitudesFiltradas: SolicitudTransferenciaResponse[] = [];
  bodegasVenta: BodegaResponse[] = [];
  bodegasContable: BodegaResponse[] = [];
  productos: ProductoResponse[] = [];

  solicitudForm: FormGroup;
  detalles: DetalleLinea[] = [];
  showModal = false;
  showRechazarModal = false;
  isEditMode = false;
  isViewMode = false;
  selectedSolicitudId?: number;
  motivoRechazo = '';
  loading = false;
  searchTerm = '';
  filtroEstado = '';

  estadosDisponibles = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'COMPLETADA', 'ANULADA'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly solicitudService: SolicitudTransferenciaService,
    private readonly bodegaService: BodegaService,
    private readonly productoService: ProductoService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {
    this.solicitudForm = this.fb.group({
      numeroSolicitud: ['', Validators.required],
      bodegaOrigenId: [null, Validators.required],
      bodegaDestinoId: [null, Validators.required],
      fechaSolicitud: [this.getFechaHoy(), Validators.required],
      fechaRequerida: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      solicitudes: this.solicitudService.findAll(),
      bodegas: this.bodegaService.findAll(),
      productos: this.productoService.findAll()
    }).subscribe({
      next: (data) => {
        this.solicitudes = data.solicitudes;
        this.solicitudesFiltradas = data.solicitudes;
        this.bodegasVenta = data.bodegas.filter(b => b.activo && b.bodegaTipo === 'VENTA');
        this.bodegasContable = data.bodegas.filter(b => b.activo && b.bodegaTipo === 'CONTABLE');
        this.productos = data.productos.filter(p => p.activo);
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.error('Error al cargar datos', err.message);
        this.loading = false;
      }
    });
  }

  filtrar(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.solicitudesFiltradas = this.solicitudes.filter(s => {
      const matchTerm = !term ||
        s.numeroSolicitud.toLowerCase().includes(term) ||
        s.bodegaOrigenNombre.toLowerCase().includes(term) ||
        s.bodegaDestinoNombre.toLowerCase().includes(term);
      const matchEstado = !this.filtroEstado || s.estado === this.filtroEstado;
      return matchTerm && matchEstado;
    });
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.isViewMode = false;
    this.solicitudForm.reset({ fechaSolicitud: this.getFechaHoy() });
    this.solicitudForm.patchValue({ numeroSolicitud: `ST-${Date.now()}` });
    this.detalles = [];
    this.agregarLinea();
    this.showModal = true;
  }

  abrirModalVer(solicitud: SolicitudTransferenciaResponse): void {
    this.isViewMode = true;
    this.isEditMode = false;
    this.selectedSolicitudId = solicitud.id;
    this.solicitudForm.patchValue({
      numeroSolicitud: solicitud.numeroSolicitud,
      bodegaOrigenId: solicitud.bodegaOrigenId,
      bodegaDestinoId: solicitud.bodegaDestinoId,
      fechaSolicitud: solicitud.fechaSolicitud,
      fechaRequerida: solicitud.fechaRequerida || '',
      observaciones: solicitud.observaciones || ''
    });
    this.detalles = (solicitud.detalles || []).map(d => ({
      productoId: d.productoId,
      cantidadSolicitada: d.cantidadSolicitada,
      cantidadAprobada: d.cantidadAprobada ?? null,
      observaciones: d.observaciones || ''
    }));
    this.solicitudForm.disable();
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.solicitudForm.enable();
    this.solicitudForm.reset();
    this.detalles = [];
    this.isEditMode = false;
    this.isViewMode = false;
    this.selectedSolicitudId = undefined;
  }

  agregarLinea(): void {
    this.detalles.push({ productoId: null, cantidadSolicitada: 1, cantidadAprobada: null, observaciones: '' });
  }

  eliminarLinea(index: number): void {
    this.detalles.splice(index, 1);
  }

  async guardar(): Promise<void> {
    if (this.solicitudForm.invalid) {
      this.notificationService.warning('Formulario incompleto', 'Complete todos los campos requeridos');
      return;
    }
    if (this.detalles.length === 0 || this.detalles.some(d => !d.productoId)) {
      this.notificationService.warning('Detalles incompletos', 'Agregue al menos un producto');
      return;
    }

    const usuarioId = this.authService.userId || 1;
    const formValue = this.solicitudForm.value;
    const dto: SolicitudTransferenciaRequest = {
      numeroSolicitud: formValue.numeroSolicitud,
      bodegaOrigenId: Number(formValue.bodegaOrigenId),
      bodegaDestinoId: Number(formValue.bodegaDestinoId),
      fechaSolicitud: formValue.fechaSolicitud,
      fechaRequerida: formValue.fechaRequerida || undefined,
      observaciones: formValue.observaciones || undefined,
      usuarioCreacionId: usuarioId,
      detalles: this.detalles.map(d => ({
        productoId: d.productoId!,
        cantidadSolicitada: d.cantidadSolicitada,
        observaciones: d.observaciones || undefined
      } as DetalleSolicitudTransferenciaRequest))
    };

    this.solicitudService.save(dto).subscribe({
      next: () => {
        this.notificationService.success('Solicitud creada', 'La solicitud se creó correctamente');
        this.cargarDatos();
        this.cerrarModal();
      },
      error: (err) => {
        this.notificationService.error('Error al crear solicitud', err.message);
      }
    });
  }

  async enviar(solicitud: SolicitudTransferenciaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Enviar la solicitud "${solicitud.numeroSolicitud}" a la bodega contable?`
    );
    if (!confirmed) return;
    this.solicitudService.enviar(solicitud.id).subscribe({
      next: () => {
        this.notificationService.success('Solicitud enviada', 'La solicitud fue enviada para aprobación');
        this.cargarDatos();
      },
      error: (err) => this.notificationService.error('Error', err.message)
    });
  }

  async aprobar(solicitud: SolicitudTransferenciaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Aprobar la solicitud "${solicitud.numeroSolicitud}"?`
    );
    if (!confirmed) return;
    const usuarioId = this.authService.userId || 1;
    this.solicitudService.aprobar(solicitud.id, usuarioId).subscribe({
      next: () => {
        this.notificationService.success('Solicitud aprobada', 'La solicitud fue aprobada');
        this.cargarDatos();
      },
      error: (err) => this.notificationService.error('Error', err.message)
    });
  }

  abrirRechazar(solicitud: SolicitudTransferenciaResponse): void {
    this.selectedSolicitudId = solicitud.id;
    this.motivoRechazo = '';
    this.showRechazarModal = true;
  }

  confirmarRechazar(): void {
    if (!this.motivoRechazo.trim()) {
      this.notificationService.warning('Motivo requerido', 'Debe ingresar un motivo de rechazo');
      return;
    }
    this.solicitudService.rechazar(this.selectedSolicitudId!, this.motivoRechazo).subscribe({
      next: () => {
        this.notificationService.success('Solicitud rechazada', 'La solicitud fue rechazada');
        this.showRechazarModal = false;
        this.cargarDatos();
      },
      error: (err) => this.notificationService.error('Error', err.message)
    });
  }

  async completar(solicitud: SolicitudTransferenciaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Completar la solicitud "${solicitud.numeroSolicitud}"? Esto generará un movimiento de inventario.`
    );
    if (!confirmed) return;
    const usuarioId = this.authService.userId || 1;
    this.solicitudService.completar(solicitud.id, usuarioId).subscribe({
      next: () => {
        this.notificationService.success('Solicitud completada', 'Se generó el movimiento de transferencia');
        this.cargarDatos();
      },
      error: (err) => this.notificationService.error('Error', err.message)
    });
  }

  async anular(solicitud: SolicitudTransferenciaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(
      `¿Anular la solicitud "${solicitud.numeroSolicitud}"?`
    );
    if (!confirmed) return;
    this.solicitudService.anular(solicitud.id).subscribe({
      next: () => {
        this.notificationService.success('Solicitud anulada', 'La solicitud fue anulada');
        this.cargarDatos();
      },
      error: (err) => this.notificationService.error('Error', err.message)
    });
  }

  getNombreProducto(productoId: number | null): string {
    if (!productoId) return '-';
    const p = this.productos.find(x => x.id === productoId);
    return p ? p.productoNombre : `Producto #${productoId}`;
  }

  getEstadoBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      BORRADOR: 'badge-secondary',
      ENVIADA: 'badge-warning',
      APROBADA: 'badge-info',
      RECHAZADA: 'badge-danger',
      COMPLETADA: 'badge-success',
      ANULADA: 'badge-dark'
    };
    return map[estado] || 'badge-secondary';
  }

  puedeEnviar(s: SolicitudTransferenciaResponse): boolean { return s.estado === 'BORRADOR'; }
  puedeAprobar(s: SolicitudTransferenciaResponse): boolean { return s.estado === 'ENVIADA'; }
  puedeRechazar(s: SolicitudTransferenciaResponse): boolean { return s.estado === 'ENVIADA'; }
  puedeCompletar(s: SolicitudTransferenciaResponse): boolean { return s.estado === 'APROBADA'; }
  puedeAnular(s: SolicitudTransferenciaResponse): boolean { return s.estado === 'BORRADOR' || s.estado === 'ENVIADA'; }

  isFieldInvalid(field: string): boolean {
    const f = this.solicitudForm.get(field);
    return !!(f && f.invalid && (f.dirty || f.touched));
  }

  private getFechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }
}
