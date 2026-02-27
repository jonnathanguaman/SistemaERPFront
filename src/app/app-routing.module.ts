import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpleadosComponent } from './ModuloEmpleados/Vista/empleados/empleados.component';
import { RolesComponent } from './ModuloEmpleados/Vista/roles/roles.component';
import { AsignarRolesComponent } from './ModuloEmpleados/Vista/asignar-roles/asignar-roles.component';
import { EmpresaComponent } from './ModuloEmpresa/Vista/empresa/empresa.component';
import { BodegaComponent } from './ModuloEmpresa/Vista/bodega/bodega.component';
import { BodegaResponsableComponent } from './ModuloEmpresa/Vista/bodega-responsable/bodega-responsable.component';
import { PersonaEmpresaComponent } from './ModuloEmpresa/Vista/persona-empresa/persona-empresa.component';
import { ProcesoComponent } from './ModuloEmpresa/Vista/proceso/proceso.component';
import { AccionProcesoComponent } from './ModuloEmpresa/Vista/accion-proceso/accion-proceso.component';
import { RolEmpresaComponent } from './ModuloEmpresa/Vista/rol-empresa/rol-empresa.component';
import { PersonaEmpresaRolComponent } from './ModuloEmpresa/Vista/persona-empresa-rol/persona-empresa-rol.component';
import { PermisoDirectoPersonalComponent } from './ModuloEmpresa/Vista/permiso-directo-personal/permiso-directo-personal.component';
import { RolProcesoPermisoComponent } from './ModuloEmpresa/Vista/rol-proceso-permiso/rol-proceso-permiso.component';
import { ReporteJerarquicoComponent } from './ModuloEmpresa/Vista/reporte-jerarquico/reporte-jerarquico.component';
import { UnidadOrganizacionalComponent } from './ModuloEmpresa/Vista/unidad-organizacional/unidad-organizacional.component';
import { ProductoComponent } from './ModuloInventario/Vista/producto/producto.component';
import { ProductoLoteComponent } from './ModuloInventario/Vista/producto-lote/producto-lote.component';
import { ProductoTipoComponent } from './ModuloInventario/Vista/producto-tipo/producto-tipo.component';
import { ProductoExistenciasComponent } from './ModuloInventario/Vista/producto-existencias/producto-existencias.component';
import { ProductoConfiguracionContableComponent } from './ModuloInventario/Vista/producto-configuracion-contable/producto-configuracion-contable.component';
import { CategoriaComponent } from './ModuloInventario/Vista/categoria/categoria.component';
import { SubcategoriaComponent } from './ModuloInventario/Vista/subcategoria/subcategoria.component';
import { GrupoComponent } from './ModuloInventario/Vista/grupo/grupo.component';
import { SubgrupoComponent } from './ModuloInventario/Vista/subgrupo/subgrupo.component';
import { CentroCostosComponent } from './ModuloInventario/Vista/centro-costos/centro-costos.component';
import { CuentaContableComponent } from './ModuloInventario/Vista/cuenta-contable/cuenta-contable.component';
import { LineaNegocioComponent } from './ModuloInventario/Vista/linea-negocio/linea-negocio.component';
import { MetodoValuacionComponent } from './ModuloInventario/Vista/metodo-valuacion/metodo-valuacion.component';
import { TipoMovimientoComponent } from './ModuloInventario/Vista/tipo-movimiento/tipo-movimiento.component';
import { MoviminetoInventarioComponent } from './ModuloInventario/Vista/movimineto-inventario/movimineto-inventario.component';
import { DetalleMoviminetoComponent } from './ModuloInventario/Vista/detalle-movimineto/detalle-movimineto.component';
import { FacturaComponent } from './ModuloVentas/Vista/factura/factura.component';
import { DetalleFacturaComponent } from './ModuloVentas/Vista/detalle-factura/detalle-factura.component';
import { ClienteComponent } from './ModuloVentas/Vista/cliente/cliente.component';
import { ContactoClienteComponent } from './ModuloVentas/Vista/contacto-cliente/contacto-cliente.component';
import { DireccionClienteComponent } from './ModuloVentas/Vista/direccion-cliente/direccion-cliente.component';
import { ZonaVentaComponent } from './ModuloVentas/Vista/zona-venta/zona-venta.component';
import { TipoClienteComponent } from './ModuloVentas/Vista/tipo-cliente/tipo-cliente.component';
import { ListaPreciosComponent } from './ModuloVentas/Vista/lista-precios/lista-precios.component';
import { PrecioProductoComponent } from './ModuloVentas/Vista/precio-producto/precio-producto.component';
import { CobroComponent } from './ModuloVentas/Vista/cobro/cobro.component';
import { CondicionPagoComponent } from './ModuloVentas/Vista/condicion-pago/condicion-pago.component';
import { FormaPagoComponent } from './ModuloVentas/Vista/forma-pago/forma-pago.component';
import { CuentasCobrarComponent } from './ModuloVentas/Vista/cuentas-cobrar/cuentas-cobrar.component';

const routes: Routes = [
  { path: '', redirectTo: '/empleados', pathMatch: 'full' },
  // Rutas del módulo de empleados
  { path: 'empleados', component: EmpleadosComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'asignar-roles', component: AsignarRolesComponent },
  // Rutas del módulo de empresa
  { path: 'empresas', component: EmpresaComponent },
  { path: 'bodegas', component: BodegaComponent },
  { path: 'bodegas-responsables', component: BodegaResponsableComponent },
  { path: 'personas-empresa', component: PersonaEmpresaComponent },
  { path: 'procesos', component: ProcesoComponent },
  { path: 'acciones-proceso', component: AccionProcesoComponent },
  { path: 'roles-empresa', component: RolEmpresaComponent },
  { path: 'personas-empresa-roles', component: PersonaEmpresaRolComponent },
  { path: 'permisos-directos', component: PermisoDirectoPersonalComponent },
  { path: 'roles-procesos-permisos', component: RolProcesoPermisoComponent },
  { path: 'reportes-jerarquicos', component: ReporteJerarquicoComponent },
  { path: 'unidades-organizacionales', component: UnidadOrganizacionalComponent },
  // Rutas del módulo de inventario
  { path: 'productos', component: ProductoComponent },
  { path: 'producto-lotes', component: ProductoLoteComponent },
  { path: 'producto-tipos', component: ProductoTipoComponent },
  { path: 'producto-existencias', component: ProductoExistenciasComponent },
  { path: 'producto-configuracion-contable', component: ProductoConfiguracionContableComponent },
  { path: 'categorias', component: CategoriaComponent },
  { path: 'subcategorias', component: SubcategoriaComponent },
  { path: 'grupos', component: GrupoComponent },
  { path: 'subgrupos', component: SubgrupoComponent },
  { path: 'centros-costos', component: CentroCostosComponent },
  { path: 'cuentas-contables', component: CuentaContableComponent },
  { path: 'lineas-negocio', component: LineaNegocioComponent },
  { path: 'metodos-valuacion', component: MetodoValuacionComponent },
  { path: 'tipos-movimiento', component: TipoMovimientoComponent },
  { path: 'movimientos-inventario', component: MoviminetoInventarioComponent },
  { path: 'detalles-movimiento', component: DetalleMoviminetoComponent },
  // Rutas del módulo de ventas
  { path: 'facturas', component: FacturaComponent },
  { path: 'zonas-venta', component: ZonaVentaComponent },
  { path: 'tipos-cliente', component: TipoClienteComponent },
  { path: 'listas-precios', component: ListaPreciosComponent },
  { path: 'precios-producto', component: PrecioProductoComponent },
  { path: 'detalles-factura', component: DetalleFacturaComponent },
  { path: 'clientes', component: ClienteComponent },
  { path: 'contactos-cliente', component: ContactoClienteComponent },
  { path: 'direcciones-cliente', component: DireccionClienteComponent },
  { path: 'cobros', component: CobroComponent },
  { path: 'condiciones-pago', component: CondicionPagoComponent },
  { path: 'formas-pago', component: FormaPagoComponent },
  { path: 'cuentas-por-cobrar', component: CuentasCobrarComponent },
  // Ruta por defecto (404)
  { path: '**', redirectTo: '/empleados' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
