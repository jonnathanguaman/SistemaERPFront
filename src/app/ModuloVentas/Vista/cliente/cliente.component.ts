import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../Service/cliente.service';
import { ClienteResponse, ClienteRequest } from '../../Entidad/cliente.model';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { CondicionPagoResponse } from '../../Entidad/condicion-pago.model';
import { ListaPreciosService } from '../../Service/lista-precios.service';
import { ListaPreciosResponse } from '../../Entidad/lista-precios.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-cliente',
  standalone: false,
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
  clientes: ClienteResponse[] = [];
  clientesFiltrados: ClienteResponse[] = [];
  condicionesPago: CondicionPagoResponse[] = [];
  listasPrecios: ListaPreciosResponse[] = [];
  clienteForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingClienteId: number | null = null;
  loading: boolean = false;
  busqueda: string = '';

  constructor(
    private readonly clienteService: ClienteService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly listaPreciosService: ListaPreciosService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.clienteForm = this.formBuilder.group({
      tipoIdentificacion: ['RUC', Validators.required],
      numeroIdentificacion: ['', [Validators.required, Validators.minLength(8)]],
      razonSocial: [''],
      nombreComercial: [''],
      nombres: [''],
      apellidos: [''],
      tipoClienteId: [null],
      zonaVentaId: [null],
      vendedorId: [null],
      segmento: [''],
      categoria: [''],
      listaPreciosId: [null, Validators.required],
      condicionPagoId: [null, Validators.required],
      limiteCredito: [0],
      descuentoGeneral: [0],
      email: ['', Validators.email],
      telefono: [''],
      celular: [''],
      direccion: [''],
      ciudad: [''],
      provincia: [''],
      pais: ['Ecuador'],
      codigoPostal: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarCondicionesPago();
    this.cargarListasPrecios();
  }

  cargarCondicionesPago(): void {
    this.condicionPagoService.findActivas().subscribe({
      next: (data) => {
        this.condicionesPago = data;
      },
      error: (error) => {
        console.error('Error al cargar condiciones de pago:', error);
        this.notificationService.error('Error al cargar condiciones de pago');
      }
    });
  }

  cargarListasPrecios(): void {
    this.listaPreciosService.findActivos().subscribe({
      next: (data) => {
        this.listasPrecios = data;
      },
      error: (error) => {
        console.error('Error al cargar listas de precios:', error);
        this.notificationService.error('Error al cargar listas de precios');
      }
    });
  }

  filtrarClientes(): void {
    const busquedaLower = this.busqueda.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.numeroIdentificacion?.toLowerCase().includes(busquedaLower) ||
      cliente.razonSocial?.toLowerCase().includes(busquedaLower) ||
      cliente.nombreComercial?.toLowerCase().includes(busquedaLower) ||
      cliente.nombres?.toLowerCase().includes(busquedaLower) ||
      cliente.apellidos?.toLowerCase().includes(busquedaLower) ||
      cliente.email?.toLowerCase().includes(busquedaLower) ||
      cliente.id.toString().includes(busquedaLower)
    );
  }

  cargarClientes(): void {
    this.loading = true;
    this.clienteService.findAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesFiltrados = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.notificationService.error(error.message, 'Error al cargar clientes');
        this.loading = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingClienteId = null;
    this.clienteForm.reset({
      tipoIdentificacion: 'RUC',
      pais: 'Ecuador',
      listaPreciosId: null,
      condicionPagoId: null,
      limiteCredito: 0,
      descuentoGeneral: 0
    });
    this.showModal = true;
  }

  abrirModalEditar(cliente: ClienteResponse): void {
    this.isEditing = true;
    this.editingClienteId = cliente.id;
    this.clienteForm.patchValue({
      tipoIdentificacion: cliente.tipoIdentificacion,
      numeroIdentificacion: cliente.numeroIdentificacion,
      razonSocial: cliente.razonSocial,
      nombreComercial: cliente.nombreComercial,
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      tipoClienteId: cliente.tipoClienteId,
      zonaVentaId: cliente.zonaVentaId,
      vendedorId: cliente.vendedorId,
      segmento: cliente.segmento,
      categoria: cliente.categoria,
      listaPreciosId: cliente.listaPreciosId,
      condicionPagoId: cliente.condicionPagoId,
      limiteCredito: cliente.limiteCredito,
      descuentoGeneral: cliente.descuentoGeneral,
      email: cliente.email,
      telefono: cliente.telefono,
      celular: cliente.celular,
      direccion: cliente.direccion,
      ciudad: cliente.ciudad,
      provincia: cliente.provincia,
      pais: cliente.pais,
      codigoPostal: cliente.codigoPostal,
      observaciones: cliente.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.clienteForm.reset();
    this.isEditing = false;
    this.editingClienteId = null;
  }

  guardarCliente(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formValue = this.clienteForm.value;
    const clienteData: ClienteRequest = {
      ...formValue,
      limiteCredito: formValue.limiteCredito || 0,
      descuentoGeneral: formValue.descuentoGeneral || 0
    };

    if (this.isEditing && this.editingClienteId !== null) {
      this.clienteService.update(this.editingClienteId, clienteData).subscribe({
        next: () => {
          this.notificationService.success('Cliente actualizado exitosamente');
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar cliente:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.clienteService.save(clienteData).subscribe({
        next: () => {
          this.notificationService.success('Cliente creado exitosamente');
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear cliente:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarCliente(cliente: ClienteResponse): Promise<void> {
    const nombre = cliente.razonSocial || cliente.nombreComercial || `${cliente.nombres} ${cliente.apellidos}`;
    const confirmed = await this.notificationService.confirmDelete(nombre);

    if (!confirmed) {
      return;
    }

    this.clienteService.delete(cliente.id).subscribe({
      next: () => {
        this.notificationService.toast('Cliente eliminado exitosamente', 'success');
        this.cargarClientes();
      },
      error: (error) => {
        console.error('Error al eliminar cliente:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    if (field?.hasError('email')) {
      return 'Email inválido';
    }

    return '';
  }

  getNombreCliente(cliente: ClienteResponse): string {
    if (cliente.razonSocial) return cliente.razonSocial;
    if (cliente.nombreComercial) return cliente.nombreComercial;
    return `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim();
  }
}

