import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonaService } from '../../Service/persona.service';
import { RolAccesoService } from '../../Service/rol.service';
import { PersonaRequest, PersonaResponse } from '../../Entidades/persona.model';
import { PersonaConCredencialesRequest } from '../../Entidades/persona-con-credenciales.model';
import { RolAccesoResponse } from '../../Entidades/rol.model';
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
  crearUsuario: boolean = false;
  
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  searchTerm: string = '';
  
  constructor(
    private readonly personaService: PersonaService,
    private readonly rolService: RolAccesoService,
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
      rolId: [null]
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarRoles();
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

  abrirModalCrear(): void {
    this.isEditMode = false;
    this.empleadoSeleccionado = null;
    this.crearUsuario = false;
    this.empleadoForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(empleado: PersonaResponse): void {
    this.isEditMode = true;
    this.empleadoSeleccionado = empleado;
    this.crearUsuario = false;
    
    this.empleadoForm.patchValue({
      nombre: empleado.nombre,
      cedula: empleado.cedula,
      direccion: empleado.direccion,
      telefono: empleado.telefono,
      email: empleado.email
    });
    
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.empleadoForm.reset();
    this.empleadoSeleccionado = null;
    this.crearUsuario = false;
  }
  
  onCrearUsuarioChange(): void {
    const usernameControl = this.empleadoForm.get('username');
    const passwordControl = this.empleadoForm.get('password');
    const rolControl = this.empleadoForm.get('rolId');
    
    if (this.crearUsuario) {
      usernameControl?.setValidators([Validators.required, Validators.minLength(4)]);
      passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      rolControl?.setValidators([Validators.required]);
    } else {
      usernameControl?.clearValidators();
      passwordControl?.clearValidators();
      rolControl?.clearValidators();
    }
    
    usernameControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
    rolControl?.updateValueAndValidity();
  }

  guardarEmpleado(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.empleadoSeleccionado) {
      // Modo edición - solo actualiza datos de persona
      const personaData: PersonaRequest = {
        nombre: this.empleadoForm.value.nombre,
        cedula: this.empleadoForm.value.cedula,
        direccion: this.empleadoForm.value.direccion,
        telefono: this.empleadoForm.value.telefono,
        email: this.empleadoForm.value.email
      };
      
      this.personaService.update(this.empleadoSeleccionado.id, personaData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Empleado actualizado exitosamente');
          this.cargarEmpleados();
          this.cerrarModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      // Modo creación
      if (this.crearUsuario) {
        // Crear persona con credenciales y roles
        const personaConCredenciales: PersonaConCredencialesRequest = {
          nombre: this.empleadoForm.value.nombre,
          cedula: this.empleadoForm.value.cedula,
          direccion: this.empleadoForm.value.direccion,
          telefono: this.empleadoForm.value.telefono,
          email: this.empleadoForm.value.email,
          username: this.empleadoForm.value.username,
          password: this.empleadoForm.value.password,
          rolesIds: this.empleadoForm.value.rolId ? [this.empleadoForm.value.rolId] : []
        };
        
        this.personaService.saveConCredenciales(personaConCredenciales).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.notificationService.success('Empleado y usuario creados exitosamente');
            this.cargarEmpleados();
            this.cerrarModal();
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
            this.cerrarModal();
          },
          error: (error) => {
            this.isLoading = false;
            this.notificationService.error(error.message, 'Error al crear');
          }
        });
      }
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
