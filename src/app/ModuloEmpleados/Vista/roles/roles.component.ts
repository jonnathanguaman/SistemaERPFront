import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RolAccesoService } from '../../Service/rol.service';
import { RolAccesoResponse, RolAccesoRequest } from '../../Entidades/rol.model';
import { NotificationService } from '../../../Compartido/services/notification.service';

@Component({
  selector: 'app-roles',
  standalone: false,
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  roles: RolAccesoResponse[] = [];
  rolForm: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingRolId: number | null = null;
  loading: boolean = false;
  searchTerm: string = '';

  constructor(
    private readonly rolService: RolAccesoService,
    private readonly formBuilder: FormBuilder,
    private readonly notificationService: NotificationService
  ) {
    this.rolForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
  }

  /**
   * Obtiene la lista filtrada de roles según el término de búsqueda
   */
  get rolesFiltrados(): RolAccesoResponse[] {
    if (!this.searchTerm.trim()) {
      return this.roles;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.roles.filter(rol =>
      rol.nombre.toLowerCase().includes(termino) ||
      rol.id.toString().includes(termino)
    );
  }

  /**
   * Carga todos los roles desde el backend
   */
  cargarRoles(): void {
    this.loading = true;
    this.rolService.findAll().subscribe({
      next: (data) => {
        this.roles = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.notificationService.error(error.message, 'Error al cargar roles');
        this.loading = false;
      }
    });
  }

  /**
   * Abre el modal para crear un nuevo rol
   */
  abrirModalCrear(): void {
    this.isEditing = false;
    this.editingRolId = null;
    this.rolForm.reset();
    this.showModal = true;
  }

  /**
   * Abre el modal para editar un rol existente
   */
  abrirModalEditar(rol: RolAccesoResponse): void {
    this.isEditing = true;
    this.editingRolId = rol.id;
    this.rolForm.patchValue({
      nombre: rol.nombre
    });
    this.showModal = true;
  }

  /**
   * Cierra el modal y resetea el formulario
   */
  cerrarModal(): void {
    this.showModal = false;
    this.rolForm.reset();
    this.isEditing = false;
    this.editingRolId = null;
  }

  /**
   * Guarda un rol (crear o actualizar)
   */
  guardarRol(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      this.notificationService.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    const rolData: RolAccesoRequest = {
      nombre: this.rolForm.value.nombre
    };

    if (this.isEditing && this.editingRolId !== null) {
      // Actualizar rol existente
      this.rolService.update(this.editingRolId, rolData).subscribe({
        next: (response) => {
          this.notificationService.success('Rol actualizado exitosamente');
          this.cargarRoles();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar rol:', error);
          this.notificationService.error(error.message, 'Error al actualizar');
        }
      });
    } else {
      // Crear nuevo rol
      this.rolService.save(rolData).subscribe({
        next: (response) => {
          this.notificationService.success('Rol creado exitosamente');
          this.cargarRoles();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear rol:', error);
          this.notificationService.error(error.message, 'Error al crear');
        }
      });
    }
  }

  /**
   * Elimina un rol
   */
  async eliminarRol(rol: RolAccesoResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(rol.nombre);
    
    if (!confirmed) {
      return;
    }

    this.rolService.delete(rol.id).subscribe({
      next: () => {
        this.notificationService.toast('Rol eliminado exitosamente', 'success');
        this.cargarRoles();
      },
      error: (error) => {
        console.error('Error al eliminar rol:', error);
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  /**
   * Verifica si un campo del formulario es inválido
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.rolForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.rolForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }
    
    return '';
  }
}
