import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PersonaService } from '../../Service/persona.service';
import { PersonaRequest, PersonaResponse } from '../../Entidades/persona.model';
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
  
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditMode: boolean = false;
  
  searchTerm: string = '';
  
  constructor(
    private readonly personaService: PersonaService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.empleadoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required, Validators.minLength(10)]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
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
    this.empleadoForm.reset();
    this.showModal = true;
  }

  abrirModalEditar(empleado: PersonaResponse): void {
    this.isEditMode = true;
    this.empleadoSeleccionado = empleado;
    
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
  }

  guardarEmpleado(): void {
    if (this.empleadoForm.invalid) {
      this.empleadoForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading = true;
    
    const personaData: PersonaRequest = this.empleadoForm.value;

    if (this.isEditMode && this.empleadoSeleccionado) {
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
