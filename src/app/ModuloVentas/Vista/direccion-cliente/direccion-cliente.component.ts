import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DireccionClienteService } from '../../Service/direccion-cliente.service';
import { ClienteService } from '../../Service/cliente.service';
import { DireccionClienteResponse, DireccionClienteRequest } from '../../Entidad/direccion-cliente.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

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
  showModal: boolean = false;
  isEditing: boolean = false;
  editingDireccionId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';
  clienteIdFiltro: number | null = null;

  tiposDireccion = [
    { value: 'FACTURACION', label: 'Facturación' },
    { value: 'ENVIO', label: 'Envío' },
    { value: 'AMBAS', label: 'Ambas' }
  ];

  constructor(
    private readonly direccionService: DireccionClienteService,
    private readonly clienteService: ClienteService,
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

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingDireccionId = null;
    this.direccionForm.reset({
      tipoDireccion: 'AMBAS',
      esPrincipal: false,
      activo: true
    });
    this.showModal = true;
  }

  abrirModalEditar(direccion: DireccionClienteResponse): void {
    this.isEditing = true;
    this.editingDireccionId = direccion.id;
    this.direccionForm.patchValue({
      clienteId: direccion.clienteId,
      tipoDireccion: direccion.tipoDireccion,
      nombreDireccion: direccion.nombreDireccion,
      direccion: direccion.direccion,
      ciudad: direccion.ciudad,
      provincia: direccion.provincia,
      codigoPostal: direccion.codigoPostal,
      referencia: direccion.referencia,
      contacto: direccion.contacto,
      telefono: direccion.telefono,
      esPrincipal: direccion.esPrincipal,
      activo: direccion.activo
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.direccionForm.reset();
    this.isEditing = false;
    this.editingDireccionId = null;
  }

  guardarDireccion(): void {
    if (this.direccionForm.invalid) {
      this.direccionForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const direccionData: DireccionClienteRequest = this.direccionForm.value;

    if (this.isEditing && this.editingDireccionId !== null) {
      this.direccionService.update(this.editingDireccionId, direccionData).subscribe({
        next: () => {
          this.notificationService.success('Dirección actualizada exitosamente');
          this.cargarDirecciones();
          this.cerrarModal();
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
          this.cerrarModal();
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
