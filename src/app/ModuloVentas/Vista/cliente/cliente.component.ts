import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../Service/cliente.service';
import { ClienteResponse, ClienteRequest } from '../../Entidad/cliente.model';
import { CondicionPagoService } from '../../Service/condicion-pago.service';
import { CondicionPagoResponse } from '../../Entidad/condicion-pago.model';
import { ListaPreciosService } from '../../Service/lista-precios.service';
import { ListaPreciosResponse } from '../../Entidad/lista-precios.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PaisService } from '../../../ModuloEmpresa/Service/pais.service';
import { ProvinciaService } from '../../../ModuloEmpresa/Service/provincia.service';
import { CiudadService } from '../../../ModuloEmpresa/Service/ciudad.service';
import { PaisResponse } from '../../../ModuloEmpresa/Entidad/pais.model';
import { ProvinciaResponse } from '../../../ModuloEmpresa/Entidad/provincia.model';
import { CiudadResponse } from '../../../ModuloEmpresa/Entidad/ciudad.model';

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
  paises: PaisResponse[] = [];
  provincias: ProvinciaResponse[] = [];
  ciudades: CiudadResponse[] = [];
  clienteForm: FormGroup;
  showForm: boolean = false;
  isEditing: boolean = false;
  editingClienteId: number | null = null;
  loading: boolean = false;
  busqueda: string = '';

  constructor(
    private readonly clienteService: ClienteService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly listaPreciosService: ListaPreciosService,
    private readonly paisService: PaisService,
    private readonly provinciaService: ProvinciaService,
    private readonly ciudadService: CiudadService,
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
      pais: [''],
      paisId: [null, Validators.required],
      provinciaId: [null, Validators.required],
      ciudadId: [null, Validators.required],
      codigoPostal: [''],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarCondicionesPago();
    this.cargarListasPrecios();
    this.cargarPaises();

    this.clienteForm.get('paisId')?.valueChanges.subscribe((paisId: number | null) => {
      this.onPaisChange(paisId);
    });

    this.clienteForm.get('provinciaId')?.valueChanges.subscribe((provinciaId: number | null) => {
      this.onProvinciaChange(provinciaId);
    });

    this.clienteForm.get('ciudadId')?.valueChanges.subscribe((ciudadId: number | null) => {
      this.actualizarCiudadTexto(ciudadId);
    });
  }

  cargarPaises(): void {
    this.paisService.findActivos().subscribe({
      next: (data) => {
        this.paises = data;
      },
      error: (error) => {
        console.error('Error al cargar países:', error);
        this.notificationService.error('Error al cargar países');
      }
    });
  }

  cargarProvinciasPorPais(paisId: number): void {
    this.provinciaService.findByPais(paisId).subscribe({
      next: (data) => {
        this.provincias = data;
      },
      error: (error) => {
        console.error('Error al cargar provincias:', error);
        this.notificationService.error('Error al cargar provincias');
      }
    });
  }

  cargarCiudadesPorProvincia(provinciaId: number): void {
    this.ciudadService.findByProvincia(provinciaId).subscribe({
      next: (data) => {
        this.ciudades = data;
      },
      error: (error) => {
        console.error('Error al cargar ciudades:', error);
        this.notificationService.error('Error al cargar ciudades');
      }
    });
  }

  onPaisChange(paisId: number | null): void {
    this.provincias = [];
    this.ciudades = [];
    this.clienteForm.patchValue({ provinciaId: null, ciudadId: null, provincia: '', ciudad: '' }, { emitEvent: false });

    if (paisId) {
      this.cargarProvinciasPorPais(paisId);
      const pais = this.paises.find((p) => p.id === paisId);
      this.clienteForm.patchValue({ pais: pais?.nombre || '' }, { emitEvent: false });
    } else {
      this.clienteForm.patchValue({ pais: '' }, { emitEvent: false });
    }
  }

  onProvinciaChange(provinciaId: number | null): void {
    this.ciudades = [];
    this.clienteForm.patchValue({ ciudadId: null, ciudad: '' }, { emitEvent: false });

    if (provinciaId) {
      this.cargarCiudadesPorProvincia(provinciaId);
      const provincia = this.provincias.find((p) => p.id === provinciaId);
      this.clienteForm.patchValue({ provincia: provincia?.nombre || '' }, { emitEvent: false });
    } else {
      this.clienteForm.patchValue({ provincia: '' }, { emitEvent: false });
    }
  }

  actualizarCiudadTexto(ciudadId: number | null): void {
    if (!ciudadId) {
      this.clienteForm.patchValue({ ciudad: '' }, { emitEvent: false });
      return;
    }

    const ciudad = this.ciudades.find((c) => c.id === ciudadId);
    this.clienteForm.patchValue({ ciudad: ciudad?.nombre || '' }, { emitEvent: false });
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

  abrirFormCrear(): void {
    this.isEditing = false;
    this.editingClienteId = null;
    this.clienteForm.reset({
      tipoIdentificacion: 'RUC',
      pais: '',
      paisId: null,
      provinciaId: null,
      ciudadId: null,
      listaPreciosId: null,
      condicionPagoId: null,
      limiteCredito: 0,
      descuentoGeneral: 0
    });
    this.provincias = [];
    this.ciudades = [];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirFormEditar(cliente: ClienteResponse): void {
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
      paisId: cliente.paisId,
      provinciaId: cliente.provinciaId,
      ciudadId: cliente.ciudadId,
      codigoPostal: cliente.codigoPostal,
      observaciones: cliente.observaciones
    });

    if (cliente.paisId) {
      this.cargarProvinciasPorPais(cliente.paisId);
    } else {
      this.provincias = [];
    }

    if (cliente.provinciaId) {
      this.cargarCiudadesPorProvincia(cliente.provinciaId);
    } else {
      this.ciudades = [];
    }

    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cerrarForm(): void {
    this.showForm = false;
    this.clienteForm.reset();
    this.provincias = [];
    this.ciudades = [];
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
    const pais = this.paises.find((p) => p.id === formValue.paisId);
    const provincia = this.provincias.find((p) => p.id === formValue.provinciaId);
    const ciudad = this.ciudades.find((c) => c.id === formValue.ciudadId);

    const clienteData: ClienteRequest = {
      ...formValue,
      pais: pais?.nombre || formValue.pais || '',
      provincia: provincia?.nombre || formValue.provincia || '',
      ciudad: ciudad?.nombre || formValue.ciudad || '',
      limiteCredito: formValue.limiteCredito || 0,
      descuentoGeneral: formValue.descuentoGeneral || 0
    };

    if (this.isEditing && this.editingClienteId !== null) {
      this.clienteService.update(this.editingClienteId, clienteData).subscribe({
        next: () => {
          this.notificationService.success('Cliente actualizado exitosamente');
          this.cargarClientes();
          this.cerrarForm();
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
          this.cerrarForm();
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

