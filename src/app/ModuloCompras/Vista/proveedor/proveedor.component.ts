import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedorService } from '../../Service/proveedor.service';
import { ProveedorRequest, ProveedorResponse } from '../../Entidades/proveedor.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-proveedor',
  standalone: false,
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.css'
})
export class ProveedorComponent implements OnInit {
  
  proveedores: ProveedorResponse[] = [];
  proveedorSeleccionado: ProveedorResponse | null = null;
  proveedorForm: FormGroup;
  
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  searchTerm: string = '';
  
  // Listas para los selects
  tiposIdentificacion = ['RUC', 'CEDULA', 'PASAPORTE'];
  tiposProveedor = ['MATERIA_PRIMA', 'PRODUCTO_TERMINADO', 'SERVICIOS'];
  categorias = ['A', 'B', 'C'];
  tiposCuenta = ['AHORROS', 'CORRIENTE'];
  estados = ['ACTIVO', 'INACTIVO', 'BLOQUEADO'];
  
  constructor(
    private readonly proveedorService: ProveedorService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.proveedorForm = this.formBuilder.group({
      // Identificación
      tipoIdentificacion: ['RUC', [Validators.required]],
      numeroIdentificacion: ['', [Validators.required, Validators.minLength(10)]],
      
      // Datos básicos
      razonSocial: ['', [Validators.required, Validators.minLength(3)]],
      nombreComercial: [''],
      
      // Clasificación
      tipoProveedor: [''],
      categoria: [''],
      
      // Contacto
      telefono: [''],
      celular: [''],
      email: ['', [Validators.email]],
      sitioWeb: [''],
      contactoPrincipal: [''],
      
      // Dirección
      direccion: [''],
      ciudad: [''],
      provincia: [''],
      pais: ['Ecuador'],
      
      // Condiciones comerciales
      diasCredito: [0, [Validators.min(0)]],
      descuentoComercial: [0, [Validators.min(0), Validators.max(100)]],
      
      // Datos bancarios
      banco: [''],
      tipoCuenta: [''],
      numeroCuenta: [''],
      
      // Control
      estado: ['ACTIVO'],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.isLoading = true;
    
    this.proveedorService.findAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar proveedores');
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.proveedorSeleccionado = null;
    this.proveedorForm.reset({
      tipoIdentificacion: 'RUC',
      pais: 'Ecuador',
      diasCredito: 0,
      descuentoComercial: 0,
      estado: 'ACTIVO'
    });
    this.showModal = true;
  }

  abrirModalEditar(proveedor: ProveedorResponse): void {
    this.isEditMode = true;
    this.proveedorSeleccionado = proveedor;
    
    this.proveedorForm.patchValue({
      tipoIdentificacion: proveedor.tipoIdentificacion,
      numeroIdentificacion: proveedor.numeroIdentificacion,
      razonSocial: proveedor.razonSocial,
      nombreComercial: proveedor.nombreComercial,
      tipoProveedor: proveedor.tipoProveedor,
      categoria: proveedor.categoria,
      telefono: proveedor.telefono,
      celular: proveedor.celular,
      email: proveedor.email,
      sitioWeb: proveedor.sitioWeb,
      contactoPrincipal: proveedor.contactoPrincipal,
      direccion: proveedor.direccion,
      ciudad: proveedor.ciudad,
      provincia: proveedor.provincia,
      pais: proveedor.pais,
      diasCredito: proveedor.diasCredito,
      descuentoComercial: proveedor.descuentoComercial,
      banco: proveedor.banco,
      tipoCuenta: proveedor.tipoCuenta,
      numeroCuenta: proveedor.numeroCuenta,
      estado: proveedor.estado,
      observaciones: proveedor.observaciones
    });
    
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.proveedorForm.reset();
    this.proveedorSeleccionado = null;
  }

  guardarProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;
    
    const proveedorData: ProveedorRequest = this.proveedorForm.value;

    if (this.isEditMode && this.proveedorSeleccionado) {
      this.proveedorService.update(this.proveedorSeleccionado.id, proveedorData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Proveedor actualizado exitosamente');
          this.cargarProveedores();
          this.cerrarModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      this.proveedorService.save(proveedorData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Proveedor creado exitosamente');
          this.cargarProveedores();
          this.cerrarModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  async eliminarProveedor(proveedor: ProveedorResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(proveedor.razonSocial);
    
    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.proveedorService.delete(proveedor.id).subscribe({
      next: () => {
        this.notificationService.toast('Proveedor eliminado exitosamente', 'success');
        this.cargarProveedores();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  async cambiarEstadoProveedor(proveedor: ProveedorResponse, nuevoEstado: string): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Cambiar estado de ${proveedor.razonSocial} a ${nuevoEstado}?`,
      `Esta acción cambiará el estado del proveedor.`
    );
    
    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.proveedorService.cambiarEstado(proveedor.id, nuevoEstado).subscribe({
      next: () => {
        this.notificationService.toast(`Estado cambiado a ${nuevoEstado}`, 'success');
        this.cargarProveedores();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cambiar estado');
      }
    });
  }

  get proveedoresFiltrados(): ProveedorResponse[] {
    if (!this.searchTerm) {
      return this.proveedores;
    }

    const term = this.searchTerm.toLowerCase();
    return this.proveedores.filter(prov => 
      prov.razonSocial.toLowerCase().includes(term) ||
      (prov.nombreComercial && prov.nombreComercial.toLowerCase().includes(term)) ||
      prov.numeroIdentificacion.includes(term) ||
      (prov.email && prov.email.toLowerCase().includes(term)) ||
      (prov.telefono && prov.telefono.includes(term)) ||
      (prov.celular && prov.celular.includes(term))
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.proveedorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.proveedorForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (field?.hasError('email')) {
      return 'Email inválido';
    }

    if (field?.hasError('min')) {
      return `Valor mínimo: ${field.errors?.['min'].min}`;
    }

    if (field?.hasError('max')) {
      return `Valor máximo: ${field.errors?.['max'].max}`;
    }
    
    return '';
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACTIVO':
        return 'badge-success';
      case 'INACTIVO':
        return 'badge-warning';
      case 'BLOQUEADO':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }
}

