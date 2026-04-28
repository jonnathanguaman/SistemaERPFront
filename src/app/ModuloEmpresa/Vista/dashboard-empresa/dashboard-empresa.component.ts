import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { BodegaService } from '../../Service/bodega.service';
import { UnidadOrganizacionalService } from '../../Service/unidad-organizacional.service';
import { ProcesoService } from '../../Service/proceso.service';
import { RolEmpresaService } from '../../Service/rol-empresa.service';
import { PersonaEmpresaService } from '../../Service/persona-empresa.service';

import { BodegaResponse } from '../../Entidad/bodega.model';
import { UnidadOrganizacional } from '../../Entidad/unidad-organizacional.model';
import { Proceso } from '../../Entidad/proceso.model';
import { RolEmpresa } from '../../Entidad/rol-empresa.model';
import { PersonaEmpresa } from '../../Entidad/persona-empresa.model';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: false,
  templateUrl: './dashboard-empresa.component.html',
  styleUrl: './dashboard-empresa.component.css'
})
export class DashboardEmpresaComponent implements OnInit {

  loading = true;

  bodegas: BodegaResponse[] = [];
  unidades: UnidadOrganizacional[] = [];
  procesos: Proceso[] = [];
  rolesEmpresa: RolEmpresa[] = [];
  personasEmpresa: PersonaEmpresa[] = [];

  // KPIs Bodegas
  bodegasActivas = 0;
  bodegasInactivas = 0;
  bodegasContables = 0;
  bodegasVenta = 0;

  // KPIs Unidades Organizacionales
  totalUnidades = 0;

  // KPIs Procesos
  totalProcesos = 0;

  // KPIs Roles Empresa
  totalRolesEmpresa = 0;

  // KPIs Personal
  personasActivas = 0;
  personasInactivas = 0;

  // Bodegas recientes
  ultimasBodegas: BodegaResponse[] = [];

  constructor(
    private readonly bodegaService: BodegaService,
    private readonly unidadService: UnidadOrganizacionalService,
    private readonly procesoService: ProcesoService,
    private readonly rolEmpresaService: RolEmpresaService,
    private readonly personaEmpresaService: PersonaEmpresaService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.cargarDatos(); }

  cargarDatos(): void {
    this.loading = true;
    forkJoin({
      bodegas: this.bodegaService.findAll(),
      unidades: this.unidadService.findAll(),
      procesos: this.procesoService.findAll(),
      rolesEmpresa: this.rolEmpresaService.findAll(),
      personasEmpresa: this.personaEmpresaService.findAll()
    }).subscribe({
      next: ({ bodegas, unidades, procesos, rolesEmpresa, personasEmpresa }) => {
        this.bodegas = bodegas;
        this.unidades = unidades;
        this.procesos = procesos;
        this.rolesEmpresa = rolesEmpresa;
        this.personasEmpresa = personasEmpresa;
        this.calcularKpis();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private calcularKpis(): void {
    // Bodegas
    this.bodegasActivas = this.bodegas.filter(b => b.activo).length;
    this.bodegasInactivas = this.bodegas.filter(b => !b.activo).length;
    this.bodegasContables = this.bodegas.filter(b => b.bodegaTipo === 'CONTABLE').length;
    this.bodegasVenta = this.bodegas.filter(b => b.bodegaTipo === 'VENTA').length;

    // Unidades
    this.totalUnidades = this.unidades.length;

    // Procesos
    this.totalProcesos = this.procesos.length;

    // Roles
    this.totalRolesEmpresa = this.rolesEmpresa.length;

    // Personal
    this.personasActivas = this.personasEmpresa.filter(p => p.activo).length;
    this.personasInactivas = this.personasEmpresa.filter(p => !p.activo).length;

    // Bodegas para tabla
    this.ultimasBodegas = this.bodegas.slice(0, 8);
  }

  irA(ruta: string): void { this.router.navigate([ruta]); }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
