import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonaService } from '../../Service/persona.service';
import { RolAccesoService } from '../../Service/rol.service';
import { EmpresaService } from '../../../ModuloEmpresa/Service/empresa.service';
import { RolEmpresaService } from '../../../ModuloEmpresa/Service/rol-empresa.service';
import { PersonaRequest, PersonaResponse } from '../../Entidades/persona.model';
import { PersonaConCredencialesRequest } from '../../Entidades/persona-con-credenciales.model';
import { RolAccesoResponse } from '../../Entidades/rol.model';
import { EmpresaResponse } from '../../../ModuloEmpresa/Entidad/empresa.model';
import { RolEmpresa } from '../../../ModuloEmpresa/Entidad/rol-empresa.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-empleados',
  standalone: false,
  templateUrl: './empleados.component.html',
  styleUrl: './empleados.component.css'
})
export class EmpleadosComponent implements OnInit {
  
  empleados: PersonaResponse[] = [];
  empleadoSeleccionado: PersonaResponse | null = null;
  empleadoForm: FormGroup;
  
  roles: RolAccesoResponse[] = [];
  empresas: EmpresaResponse[] = [];
  rolesEmpresaDisponibles: RolEmpresa[] = [];
  crearUsuario: boolean = false;
  
  isLoading: boolean = false;
  showForm: boolean = false;
  isEditMode: boolean = false;
  
  searchTerm: string = '';
  
  constructor(
    private readonly personaService: PersonaService,
    private readonly rolService: RolAccesoService,
    private readonly empresaService: EmpresaService,
    private readonly rolEmpresaService: RolEmpresaService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.empleadoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required, Validators.minLength(10)]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      username: [''],
      password: [''],
      rolId: [null],
      empresaId: [null],
      rolEmpresaId: [null]
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarRoles();
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.empresaService.findAll().subscribe({
      next: (data) => {
        this.empresas = data.filter(empresa => empresa.activo);
      },
      error: (error) => {
        console.error('Error al cargar empresas:', error);
        this.notificationService.error('Error al cargar la lista de empresas');
      }
    });
  }
  
  cargarRoles(): void {
    this.rolService.findAll().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.notificationService.error('Error al cargar la lista de roles');
      }
    });
  }

  cargarEmpleados(): void {
    this.isLoading = true;
    
    this.personaService.findAll().subscribe({
      next: (data) => {
        this.empleados = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar empleados');
        console.error('Error al cargar empleados:', error);
      }
    });
  }

  abrirFormCrear(): void {
    this.isEditMode = false;
    this.empleadoSeleccionado = null;
    this.crearUsuario = false;
    this.empleadoForm.reset();
    this.rolesEmpresaDisponibles = [];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  abrirFormEditar(empleado: PersonaResponse): void {
    this.isEditMode = true;
    this.empleadoSeleccionado = empleado;
    this.crearUsuario = true;
    this.rolesEmpresaDisponibles = [];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    this.empleadoForm.patchValue({
      nombre: empleado.nombre,
      cedula: empleado.cedula,
      direccion: empleado.direccion,
      telefono: empleado.telefono,
      email: empleado.email,
      username: '',
      password: '',
      rolId: null,
      empresaId: null,
      rolEmpresaId: null
    });

    this.personaService.getConfiguracionEdicion(empleado.id).subscribe({
      next: (configuracion) => {
        this.empleadoForm.patchValue({
          username: configuracion.username ?? '',
          rolId: configuracion.rolId ?? null,
          empresaId: configuracion.empresaId ?? null,
          rolEmpresaId: null,
          password: ''
        });

        if (configuracion.empresaId) {
          this.onEmpresaChange(configuracion.rolEmpresaId ?? null);
        }
      },
      error: (error) => {
        console.error('Error al cargar configuración de edición:', error);
        this.notificationService.warning('No se pudo cargar configuración de usuario. Puedes editar datos personales.');
      }
    });
  }

  cerrarForm(): void {
    this.showForm = false;
    this.empleadoForm.reset();
    this.empleadoSeleccionado = null;
    this.crearUsuario = false;
    this.rolesEmpresaDisponibles = [];
  }
  
  onCrearUsuarioChange(): void {
    const usernameControl = this.empleadoForm.get('username');
    const passwordControl = this.empleadoForm.get('password');
    const rolControl = this.empleadoForm.get('rolId');
    const empresaControl = this.empleadoForm.get('empresaId');
    const rolEmpresaControl = this.empleadoForm.get('rolEmpresaId');
    
    if (this.crearUsuario) {
      usernameControl?.setValidators([Validators.required, Validators.minLength(4)]);
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      rolControl?.setValidators([Validators.required]);
      empresaControl?.setValidators([Validators.required]);
    } else {
      usernameControl?.clearValidators();
      passwordControl?.clearValidators();
      rolControl?.clearValidators();
      empresaControl?.clearValidators();
      rolEmpresaControl?.clearValidators();
      empresaControl?.setValue(null);
      rolEmpresaControl?.setValue(null);
      this.rolesEmpresaDisponibles = [];
    }
    
    usernameControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
    rolControl?.updateValueAndValidity();
    empresaControl?.updateValueAndValidity();
    rolEmpresaControl?.updateValueAndValidity();
  }

  onEmpresaChange(rolEmpresaIdAConservar?: number | null): void {
    const empresaId = this.empleadoForm.get('empresaId')?.value;
    const rolEmpresaControl = this.empleadoForm.get('rolEmpresaId');

    rolEmpresaControl?.setValue(null);

    if (!empresaId) {
      this.rolesEmpresaDisponibles = [];
      return;
    }

    this.rolEmpresaService.findByEmpresaId(Number(empresaId)).subscribe({
      next: (roles) => {
        this.rolesEmpresaDisponibles = roles;
        if (rolEmpresaIdAConservar) {
          const existe = roles.some((rol) => rol.id === rolEmpresaIdAConservar);
          if (existe) {
            rolEmpresaControl?.setValue(rolEmpresaIdAConservar);
          }
        }
      },
      error: (error) => {
        this.rolesEmpresaDisponibles = [];
        console.error('Error al cargar roles de empresa:', error);
        this.notificationService.error('Error al cargar roles de empresa');
      }
    });
  }

  guardarEmpleado(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.empleadoSeleccionado) {
      const personaConCredenciales: PersonaConCredencialesRequest = {
        nombre: this.empleadoForm.value.nombre,
        cedula: this.empleadoForm.value.cedula,
        direccion: this.empleadoForm.value.direccion,
        telefono: this.empleadoForm.value.telefono,
        email: this.empleadoForm.value.email,
        username: this.empleadoForm.value.username ? String(this.empleadoForm.value.username).trim() : undefined,
        password: this.empleadoForm.value.password ? String(this.empleadoForm.value.password).trim() : undefined,
        rolesIds: this.empleadoForm.value.rolId ? [Number(this.empleadoForm.value.rolId)] : undefined,
        empresaId: this.empleadoForm.value.empresaId ? Number(this.empleadoForm.value.empresaId) : undefined,
        rolEmpresaId: this.empleadoForm.value.rolEmpresaId ? Number(this.empleadoForm.value.rolEmpresaId) : undefined
      };
      
      this.personaService.updateConCredenciales(this.empleadoSeleccionado.id, personaConCredenciales).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Empleado actualizado exitosamente');
          this.cargarEmpleados();
          this.cerrarForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else if (this.crearUsuario) {
        // Crear persona con credenciales y roles
        const personaConCredenciales: PersonaConCredencialesRequest = {
          nombre: this.empleadoForm.value.nombre,
          cedula: this.empleadoForm.value.cedula,
          direccion: this.empleadoForm.value.direccion,
          telefono: this.empleadoForm.value.telefono,
          email: this.empleadoForm.value.email,
          username: this.empleadoForm.value.username,
          password: this.empleadoForm.value.password,
          rolesIds: this.empleadoForm.value.rolId ? [this.empleadoForm.value.rolId] : [],
          empresaId: this.empleadoForm.value.empresaId ? Number(this.empleadoForm.value.empresaId) : undefined,
          rolEmpresaId: this.empleadoForm.value.rolEmpresaId ? Number(this.empleadoForm.value.rolEmpresaId) : undefined
        };
        
        this.personaService.saveConCredenciales(personaConCredenciales).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.notificationService.success('Empleado y usuario creados exitosamente');
            this.cargarEmpleados();
            this.cerrarForm();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.error(error.message, 'Error al crear');
          }
        });
    } else {
        // Crear solo persona sin credenciales
        const personaData: PersonaRequest = {
          nombre: this.empleadoForm.value.nombre,
          cedula: this.empleadoForm.value.cedula,
          direccion: this.empleadoForm.value.direccion,
          telefono: this.empleadoForm.value.telefono,
          email: this.empleadoForm.value.email
        };
        
        this.personaService.save(personaData).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.notificationService.success('Empleado creado exitosamente');
            this.cargarEmpleados();
            this.cerrarForm();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.error(error.message, 'Error al crear');
          }
        });
    }
  }

  async eliminarEmpleado(empleado: PersonaResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(empleado.nombre);
    
    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.personaService.delete(empleado.id).subscribe({
      next: () => {
        this.notificationService.toast('Empleado eliminado exitosamente', 'success');
        this.cargarEmpleados();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  get empleadosFiltrados(): PersonaResponse[] {
    if (!this.searchTerm) {
      return this.empleados;
    }

    const term = this.searchTerm.toLowerCase();
    return this.empleados.filter(emp => 
      emp.nombre.toLowerCase().includes(term) ||
      emp.cedula.includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.telefono.includes(term)
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.empleadoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.empleadoForm.get(fieldName);
    
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
    
    return '';
  }
}
