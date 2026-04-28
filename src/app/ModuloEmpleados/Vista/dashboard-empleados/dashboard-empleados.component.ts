import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { PersonaService } from '../../Service/persona.service';
import { RolAccesoService } from '../../Service/rol.service';
import { PersonaRolService } from '../../Service/persona-rol.service';

import { PersonaResponse } from '../../Entidades/persona.model';
import { RolAccesoResponse } from '../../Entidades/rol.model';
import { PersonaRolResponse } from '../../Entidades/persona-rol.model';

@Component({
  selector: 'app-dashboard-empleados',
  standalone: false,
  templateUrl: './dashboard-empleados.component.html',
  styleUrl: './dashboard-empleados.component.css'
})
export class DashboardEmpleadosComponent implements OnInit {

  loading = true;

  personas: PersonaResponse[] = [];
  roles: RolAccesoResponse[] = [];
  asignaciones: PersonaRolResponse[] = [];

  // KPIs Empleados
  totalEmpleados = 0;
  empleadosActivos = 0;
  empleadosInactivos = 0;

  // KPIs Roles
  totalRoles = 0;

  // KPIs Asignaciones
  asignacionesActivas = 0;
  asignacionesInactivas = 0;

  // Empleados recientes
  ultimosEmpleados: PersonaResponse[] = [];

  constructor(
    private readonly personaService: PersonaService,
    private readonly rolService: RolAccesoService,
    private readonly personaRolService: PersonaRolService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      personas: this.personaService.findAll(),
      roles: this.rolService.findAll(),
      asignaciones: this.personaRolService.findAll()
    }).subscribe({
      next: ({ personas, roles, asignaciones }) => {
        this.personas = personas;
        this.roles = roles;
        this.asignaciones = asignaciones;
        this.calcularKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private calcularKpis(): void {
    // Empleados
    this.totalEmpleados = this.personas.length;
    this.empleadosActivos = this.personas.filter(p => p.activo).length;
    this.empleadosInactivos = this.personas.filter(p => !p.activo).length;

    // Roles
    this.totalRoles = this.roles.length;

    // Asignaciones
    this.asignacionesActivas = this.asignaciones.filter(a => a.activo).length;
    this.asignacionesInactivas = this.asignaciones.filter(a => !a.activo).length;

    // Últimos registrados (sin ordenación por fecha ya que el modelo no tiene)
    this.ultimosEmpleados = this.personas.slice(0, 8);
  }

  irA(ruta: string): void { this.router.navigate([ruta]); }

  get promedioRolesPorEmpleado(): string {
    if (this.empleadosActivos === 0) return '0';
    return (this.asignacionesActivas / this.empleadosActivos).toFixed(1);
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
