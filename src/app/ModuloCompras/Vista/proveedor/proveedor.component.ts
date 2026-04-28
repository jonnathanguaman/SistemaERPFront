import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedorService } from '../../Service/proveedor.service';
import { ProveedorRequest, ProveedorResponse } from '../../Entidades/proveedor.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { PaisService } from '../../../ModuloEmpresa/Service/pais.service';
import { ProvinciaService } from '../../../ModuloEmpresa/Service/provincia.service';
import { CiudadService } from '../../../ModuloEmpresa/Service/ciudad.service';
import { PaisResponse } from '../../../ModuloEmpresa/Entidad/pais.model';
import { ProvinciaResponse } from '../../../ModuloEmpresa/Entidad/provincia.model';
import { CiudadResponse } from '../../../ModuloEmpresa/Entidad/ciudad.model';

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
  showForm: boolean = false;
  isEditMode: boolean = false;
  
  searchTerm: string = '';
  
  // Listas para los selects
  tiposIdentificacion = ['RUC', 'CEDULA', 'PASAPORTE'];
  tiposProveedor = ['MATERIA_PRIMA', 'PRODUCTO_TERMINADO', 'SERVICIOS'];
  categorias = ['A', 'B', 'C'];
  tiposCuenta = ['AHORROS', 'CORRIENTE'];
  estados = ['ACTIVO', 'INACTIVO', 'BLOQUEADO'];
  paises: PaisResponse[] = [];
  provincias: ProvinciaResponse[] = [];
  ciudades: CiudadResponse[] = [];
  
  constructor(
    private readonly proveedorService: ProveedorService,
    private readonly paisService: PaisService,
    private readonly provinciaService: ProvinciaService,
    private readonly ciudadService: CiudadService,
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
      pais: [''],
      paisId: [null, Validators.required],
      provinciaId: [null, Validators.required],
      ciudadId: [null, Validators.required],
      
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
    this.cargarPaises();

    this.proveedorForm.get('paisId')?.valueChanges.subscribe((paisId: number | null) => {
      this.onPaisChange(paisId);
    });

    this.proveedorForm.get('provinciaId')?.valueChanges.subscribe((provinciaId: number | null) => {
      this.onProvinciaChange(provinciaId);
    });

    this.proveedorForm.get('ciudadId')?.valueChanges.subscribe((ciudadId: number | null) => {
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
    this.proveedorForm.patchValue({ provinciaId: null, ciudadId: null, provincia: '', ciudad: '' }, { emitEvent: false });

    if (paisId) {
      this.cargarProvinciasPorPais(paisId);
      const pais = this.paises.find((p) => p.id === paisId);
      this.proveedorForm.patchValue({ pais: pais?.nombre || '' }, { emitEvent: false });
    } else {
      this.proveedorForm.patchValue({ pais: '' }, { emitEvent: false });
    }
  }

  onProvinciaChange(provinciaId: number | null): void {
    this.ciudades = [];
    this.proveedorForm.patchValue({ ciudadId: null, ciudad: '' }, { emitEvent: false });

    if (provinciaId) {
      this.cargarCiudadesPorProvincia(provinciaId);
      const provincia = this.provincias.find((p) => p.id === provinciaId);
      this.proveedorForm.patchValue({ provincia: provincia?.nombre || '' }, { emitEvent: false });
    } else {
      this.proveedorForm.patchValue({ provincia: '' }, { emitEvent: false });
    }
  }

  actualizarCiudadTexto(ciudadId: number | null): void {
    if (!ciudadId) {
      this.proveedorForm.patchValue({ ciudad: '' }, { emitEvent: false });
      return;
    }

    const ciudad = this.ciudades.find((c) => c.id === ciudadId);
    this.proveedorForm.patchValue({ ciudad: ciudad?.nombre || '' }, { emitEvent: false });
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

  abrirFormCrear(): void {
    this.isEditMode = false;
    this.proveedorSeleccionado = null;
    this.proveedorForm.reset({
      tipoIdentificacion: 'RUC',
      pais: '',
      paisId: null,
      provinciaId: null,
      ciudadId: null,
      diasCredito: 0,
      descuentoComercial: 0,
      estado: 'ACTIVO'
    });
    this.provincias = [];
    this.ciudades = [];
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  abrirFormEditar(proveedor: ProveedorResponse): void {
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
      paisId: proveedor.paisId,
      provinciaId: proveedor.provinciaId,
      ciudadId: proveedor.ciudadId,
      diasCredito: proveedor.diasCredito,
      descuentoComercial: proveedor.descuentoComercial,
      banco: proveedor.banco,
      tipoCuenta: proveedor.tipoCuenta,
      numeroCuenta: proveedor.numeroCuenta,
      estado: proveedor.estado,
      observaciones: proveedor.observaciones
    });

    if (proveedor.paisId) {
      this.cargarProvinciasPorPais(proveedor.paisId);
    } else {
      this.provincias = [];
    }

    if (proveedor.provinciaId) {
      this.cargarCiudadesPorProvincia(proveedor.provinciaId);
    } else {
      this.ciudades = [];
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showForm = true;
  }

  cerrarForm(): void {
    this.showForm = false;
    this.proveedorForm.reset();
    this.provincias = [];
    this.ciudades = [];
    this.proveedorSeleccionado = null;
  }

  guardarProveedor(): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;
    
    const formValue = this.proveedorForm.value;
    const pais = this.paises.find((p) => p.id === formValue.paisId);
    const provincia = this.provincias.find((p) => p.id === formValue.provinciaId);
    const ciudad = this.ciudades.find((c) => c.id === formValue.ciudadId);
    const proveedorData: ProveedorRequest = {
      ...formValue,
      pais: pais?.nombre || formValue.pais || '',
      provincia: provincia?.nombre || formValue.provincia || '',
      ciudad: ciudad?.nombre || formValue.ciudad || ''
    };

    if (this.isEditMode && this.proveedorSeleccionado) {
      this.proveedorService.update(this.proveedorSeleccionado.id, proveedorData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Proveedor actualizado exitosamente');
          this.cargarProveedores();
          this.cerrarForm();
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
          this.cerrarForm();
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

  getEstadoBadgeClass(estado?: string): string {
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

