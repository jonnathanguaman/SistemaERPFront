import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../Compartido/services/notification.service';

interface ModulePermission {
  module: string;
  label: string;
  icon: string;
}

interface RolePermissions {
  roleName: string;
  modules: Record<string, boolean>;
}

@Component({
  selector: 'app-permisos-rol',
  standalone: false,
  templateUrl: './permisos-rol.component.html',
  styleUrl: './permisos-rol.component.css'
})
export class PermisosRolComponent implements OnInit {

  modules: ModulePermission[] = [
    { module: 'ventas', label: 'Ventas', icon: '🛒' },
    { module: 'compras', label: 'Compras', icon: '🛍️' },
    { module: 'inventario', label: 'Inventario', icon: '📦' },
    { module: 'empleados', label: 'Empleados', icon: '👥' },
    { module: 'empresa', label: 'Empresa', icon: '🏢' }
  ];

  roles: RolePermissions[] = [];

  private readonly STORAGE_KEY = 'role_permissions';

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  private getDefaultPermissions(): RolePermissions[] {
    return [
      {
        roleName: 'Administrador',
        modules: { ventas: true, compras: true, inventario: true, empleados: true, empresa: true }
      },
      {
        roleName: 'Vendedor',
        modules: { ventas: true, compras: false, inventario: true, empleados: false, empresa: false }
      },
      {
        roleName: 'Bodeguero',
        modules: { ventas: false, compras: false, inventario: true, empleados: false, empresa: false }
      },
      {
        roleName: 'Contador',
        modules: { ventas: true, compras: false, inventario: false, empleados: false, empresa: false }
      },
      {
        roleName: 'Gerente',
        modules: { ventas: true, compras: true, inventario: true, empleados: true, empresa: true }
      },
      {
        roleName: 'Compras',
        modules: { ventas: false, compras: true, inventario: false, empleados: false, empresa: false }
      }
    ];
  }

  private loadPermissions(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.roles = JSON.parse(saved);
    } else {
      this.roles = this.getDefaultPermissions();
    }
  }

  togglePermission(roleIndex: number, module: string): void {
    // Administrador y Gerente no se pueden modificar
    const roleName = this.roles[roleIndex].roleName;
    if (roleName === 'Administrador' || roleName === 'Gerente') {
      this.notificationService.warning(`El rol ${roleName} siempre tiene acceso a todos los módulos.`);
      return;
    }
    this.roles[roleIndex].modules[module] = !this.roles[roleIndex].modules[module];
  }

  guardarPermisos(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.roles));
    this.notificationService.success('Permisos actualizados correctamente');
  }

  restaurarDefecto(): void {
    this.roles = this.getDefaultPermissions();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.roles));
    this.notificationService.success('Permisos restaurados a valores por defecto');
  }

  isProtectedRole(roleName: string): boolean {
    return roleName === 'Administrador' || roleName === 'Gerente';
  }

  getActiveModulesCount(role: RolePermissions): number {
    return Object.values(role.modules).filter(Boolean).length;
  }
}
