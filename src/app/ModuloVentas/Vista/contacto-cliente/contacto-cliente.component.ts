import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactoClienteService } from '../../Service/contacto-cliente.service';
import { ClienteService } from '../../Service/cliente.service';
import { ContactoClienteResponse, ContactoClienteRequest } from '../../Entidad/contacto-cliente.model';
import { ClienteResponse } from '../../Entidad/cliente.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-contacto-cliente',
  standalone: false,
  templateUrl: './contacto-cliente.component.html',
  styleUrl: './contacto-cliente.component.css'
})
export class ContactoClienteComponent implements OnInit {
  contactos: ContactoClienteResponse[] = [];
  clientes: ClienteResponse[] = [];
  contactoForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingContactoId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';
  clienteIdFiltro: number | null = null;

  constructor(
    private readonly contactoService: ContactoClienteService,
    private readonly clienteService: ClienteService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.contactoForm = this.formBuilder.group({
      clienteId: [null, Validators.required],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      area: [''],
      cargo: [''],
      telefono: [''],
      celular: [''],
      email: ['', Validators.email],
      esPrincipal: [false],
      recibeFacturas: [false],
      recibeCotizaciones: [false],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarContactos();
    this.cargarClientes();
  }

  get contactosFiltrados(): ContactoClienteResponse[] {
    let resultado = this.contactos;

    if (this.clienteIdFiltro) {
      resultado = resultado.filter(c => c.clienteId === this.clienteIdFiltro);
    }

    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase();
      resultado = resultado.filter(contacto =>
        contacto.nombres?.toLowerCase().includes(termino) ||
        contacto.apellidos?.toLowerCase().includes(termino) ||
        contacto.email?.toLowerCase().includes(termino) ||
        contacto.cargo?.toLowerCase().includes(termino) ||
        contacto.area?.toLowerCase().includes(termino) ||
        contacto.clienteNombre?.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }

  cargarContactos(): void {
    this.loading = true;
    this.contactoService.findAll().subscribe({
      next: (data: ContactoClienteResponse[]) => {
        this.contactos = data;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error al cargar contactos:', error);
        this.notificationService.error(error.message, 'Error al cargar contactos');
        this.loading = false;
      }
    });
  }

  cargarClientes(): void {
    this.clienteService.findAll().subscribe({
      next: (data: ClienteResponse[]) => {
        this.clientes = data;
      },
      error: (error: Error) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingContactoId = null;
    this.contactoForm.reset({
      esPrincipal: false,
      recibeFacturas: false,
      recibeCotizaciones: false
    });
    this.showModal = true;
  }

  abrirModalEditar(contacto: ContactoClienteResponse): void {
    this.isEditing = true;
    this.editingContactoId = contacto.id;
    this.contactoForm.patchValue({
      clienteId: contacto.clienteId,
      nombres: contacto.nombres,
      apellidos: contacto.apellidos,
      area: contacto.area,
      cargo: contacto.cargo,
      telefono: contacto.telefono,
      celular: contacto.celular,
      email: contacto.email,
      esPrincipal: contacto.esPrincipal,
      recibeFacturas: contacto.recibeFacturas,
      recibeCotizaciones: contacto.recibeCotizaciones,
      observaciones: contacto.observaciones
    });
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.contactoForm.reset();
    this.isEditing = false;
    this.editingContactoId = null;
  }

  guardarContacto(): void {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const contactoData: ContactoClienteRequest = this.contactoForm.value;

    if (this.isEditing && this.editingContactoId !== null) {
      this.contactoService.update(this.editingContactoId, contactoData).subscribe({
        next: () => {
          this.notificationService.success('Contacto actualizado exitosamente');
          this.cargarContactos();
          this.cerrarModal();
        },
        error: (error: Error) => {
          console.error('Error al actualizar contacto:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.contactoService.save(contactoData).subscribe({
        next: () => {
          this.notificationService.success('Contacto creado exitosamente');
          this.cargarContactos();
          this.cerrarModal();
        },
        error: (error: Error) => {
          console.error('Error al crear contacto:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarContacto(contacto: ContactoClienteResponse): Promise<void> {
    const nombre = `${contacto.nombres} ${contacto.apellidos}`;
    const confirmed = await this.notificationService.confirmDelete(nombre);

    if (!confirmed) {
      return;
    }

    this.contactoService.delete(contacto.id).subscribe({
      next: () => {
        this.notificationService.toast('Contacto eliminado exitosamente', 'success');
        this.cargarContactos();
      },
      error: (error: Error) => {
        console.error('Error al eliminar contacto:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactoForm.get(fieldName);

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

  getNombreCliente(clienteId: number): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    if (!cliente) return '';
    return cliente.razonSocial || cliente.nombreComercial || `${cliente.nombres} ${cliente.apellidos}`;
  }
}
