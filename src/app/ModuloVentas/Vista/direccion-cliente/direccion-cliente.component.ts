import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DireccionClienteService } from '../../Service/direccion-cliente.service';
import { ClienteService } from '../../Service/cliente.service';
import { DireccionClienteResponse, DireccionClienteRequest } from '../../Entidad/direccion-cliente.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PaisService } from '../../../ModuloEmpresa/Service/pais.service';
import { ProvinciaService } from '../../../ModuloEmpresa/Service/provincia.service';
import { CiudadService } from '../../../ModuloEmpresa/Service/ciudad.service';
import { PaisResponse } from '../../../ModuloEmpresa/Entidad/pais.model';
import { ProvinciaResponse } from '../../../ModuloEmpresa/Entidad/provincia.model';
import { CiudadResponse } from '../../../ModuloEmpresa/Entidad/ciudad.model';

@Component({
  selector: 'app-direccion-cliente',
  standalone: false,
  templateUrl: './direccion-cliente.component.html',
  styleUrl: './direccion-cliente.component.css'
})
export class DireccionClienteComponent implements OnInit {
  direcciones: DireccionClienteResponse[] = [];
  clientes: ClienteResponse[] = [];
  direccionForm: FormGroup;
  showForm: boolean = false;
  isEditing: boolean = false;
  editingDireccionId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';
  clienteIdFiltro: number | null = null;
  paises: PaisResponse[] = [];
  provincias: ProvinciaResponse[] = [];
  ciudades: CiudadResponse[] = [];

  tiposDireccion = [
    { value: 'FACTURACION', label: 'Facturación' },
    { value: 'ENVIO', label: 'Envío' },
    { value: 'AMBAS', label: 'Ambas' }
  ];

  constructor(
    private readonly direccionService: DireccionClienteService,
    private readonly clienteService: ClienteService,
    private readonly paisService: PaisService,
    private readonly provinciaService: ProvinciaService,
    private readonly ciudadService: CiudadService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.direccionForm = this.formBuilder.group({
      clienteId: [null, Validators.required],
      tipoDireccion: ['AMBAS'],
      nombreDireccion: [''],
      direccion: ['', Validators.required],
      ciudad: [''],
      provincia: [''],
      paisId: [null, Validators.required],
      provinciaId: [null, Validators.required],
      ciudadId: [null, Validators.required],
      codigoPostal: [''],
      referencia: [''],
      contacto: [''],
      telefono: [''],
      esPrincipal: [false],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarDirecciones();
    this.cargarClientes();
    this.cargarPaises();

    this.direccionForm.get('paisId')?.valueChanges.subscribe((paisId: number | null) => {
      this.onPaisChange(paisId);
    });

    this.direccionForm.get('provinciaId')?.valueChanges.subscribe((provinciaId: number | null) => {
      this.onProvinciaChange(provinciaId);
    });

    this.direccionForm.get('ciudadId')?.valueChanges.subscribe((ciudadId: number | null) => {
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
    this.direccionForm.patchValue({ provinciaId: null, ciudadId: null, provincia: '', ciudad: '' }, { emitEvent: false });

    if (paisId) {
      this.cargarProvinciasPorPais(paisId);
    }
  }

  onProvinciaChange(provinciaId: number | null): void {
    this.ciudades = [];
    this.direccionForm.patchValue({ ciudadId: null, ciudad: '' }, { emitEvent: false });

    if (provinciaId) {
      this.cargarCiudadesPorProvincia(provinciaId);
      const provincia = this.provincias.find((p) => p.id === provinciaId);
      this.direccionForm.patchValue({ provincia: provincia?.nombre || '' }, { emitEvent: false });
    } else {
      this.direccionForm.patchValue({ provincia: '' }, { emitEvent: false });
    }
  }

  actualizarCiudadTexto(ciudadId: number | null): void {
    if (!ciudadId) {
      this.direccionForm.patchValue({ ciudad: '' }, { emitEvent: false });
      return;
    }

    const ciudad = this.ciudades.find((c) => c.id === ciudadId);
    this.direccionForm.patchValue({ ciudad: ciudad?.nombre || '' }, { emitEvent: false });
  }

  get direccionesFiltradas(): DireccionClienteResponse[] {
    let resultado = this.direcciones;

    if (this.clienteIdFiltro) {
      resultado = resultado.filter(d => d.clienteId === this.clienteIdFiltro);
    }

    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase();
      resultado = resultado.filter(direccion =>
        direccion.direccion?.toLowerCase().includes(termino) ||
        direccion.ciudad?.toLowerCase().includes(termino) ||
        direccion.provincia?.toLowerCase().includes(termino) ||
        direccion.nombreDireccion?.toLowerCase().includes(termino) ||
        direccion.clienteNombre?.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }

  cargarDirecciones(): void {
    this.loading = true;
    this.direccionService.findAll().subscribe({
      next: (data) => {
        this.direcciones = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar direcciones:', error);
        this.notificationService.error(error.message, 'Error al cargar direcciones');
        this.loading = false;
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.findAll().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  abrirFormCrear(): void {
    this.isEditing = false;
    this.editingDireccionId = null;
    this.direccionForm.reset({
      tipoDireccion: 'AMBAS',
      paisId: null,
      provinciaId: null,
      ciudadId: null,
      esPrincipal: false,
      activo: true
    });
    this.provincias = [];
    this.ciudades = [];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirFormEditar(direccion: DireccionClienteResponse): void {
    this.isEditing = true;
    this.editingDireccionId = direccion.id;
    this.direccionForm.patchValue({
      clienteId: direccion.clienteId,
      tipoDireccion: direccion.tipoDireccion,
      nombreDireccion: direccion.nombreDireccion,
      direccion: direccion.direccion,
      ciudad: direccion.ciudad,
      provincia: direccion.provincia,
      paisId: direccion.paisId,
      provinciaId: direccion.provinciaId,
      ciudadId: direccion.ciudadId,
      codigoPostal: direccion.codigoPostal,
      referencia: direccion.referencia,
      contacto: direccion.contacto,
      telefono: direccion.telefono,
      esPrincipal: direccion.esPrincipal,
      activo: direccion.activo
    });

    if (direccion.paisId) {
      this.cargarProvinciasPorPais(direccion.paisId);
    } else {
      this.provincias = [];
    }

    if (direccion.provinciaId) {
      this.cargarCiudadesPorProvincia(direccion.provinciaId);
    } else {
      this.ciudades = [];
    }

    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cerrarForm(): void {
    this.showForm = false;
    this.direccionForm.reset();
    this.provincias = [];
    this.ciudades = [];
    this.isEditing = false;
    this.editingDireccionId = null;
  }

  guardarDireccion(): void {
    if (this.direccionForm.invalid) {
      this.direccionForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const formValue = this.direccionForm.value;
    const provincia = this.provincias.find((p) => p.id === formValue.provinciaId);
    const ciudad = this.ciudades.find((c) => c.id === formValue.ciudadId);
    const direccionData: DireccionClienteRequest = {
      ...formValue,
      provincia: provincia?.nombre || formValue.provincia || '',
      ciudad: ciudad?.nombre || formValue.ciudad || ''
    };

    if (this.isEditing && this.editingDireccionId !== null) {
      this.direccionService.update(this.editingDireccionId, direccionData).subscribe({
        next: () => {
          this.notificationService.success('Dirección actualizada exitosamente');
          this.cargarDirecciones();
          this.cerrarForm();
        },
        error: (error) => {
          console.error('Error al actualizar dirección:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.direccionService.save(direccionData).subscribe({
        next: () => {
          this.notificationService.success('Dirección creada exitosamente');
          this.cargarDirecciones();
          this.cerrarForm();
        },
        error: (error) => {
          console.error('Error al crear dirección:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarDireccion(direccion: DireccionClienteResponse): Promise<void> {
    const nombre = direccion.nombreDireccion || direccion.direccion;
    const confirmed = await this.notificationService.confirmDelete(nombre);

    if (!confirmed) {
      return;
    }

    this.direccionService.delete(direccion.id).subscribe({
      next: () => {
        this.notificationService.toast('Dirección eliminada exitosamente', 'success');
        this.cargarDirecciones();
      },
      error: (error) => {
        console.error('Error al eliminar dirección:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.direccionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.direccionForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }

    return '';
  }

  getNombreCliente(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (!cliente) return '';
    return cliente.razonSocial || cliente.nombreComercial || `${cliente.nombres} ${cliente.apellidos}`;
  }
}
