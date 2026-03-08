import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Compartido/login/login.component';
import { AuthGuard } from './Compartido/guards/auth.guard';
import { RoleGuard } from './Compartido/guards/role.guard';
import { SinAccesoComponent } from './Compartido/sin-acceso/sin-acceso.component';
import { EmpleadosComponent } from './ModuloEmpleados/Vista/empleados/empleados.component';
import { RolesComponent } from './ModuloEmpleados/Vista/roles/roles.component';
import { AsignarRolesComponent } from './ModuloEmpleados/Vista/asignar-roles/asignar-roles.component';
import { PermisosRolComponent } from './ModuloEmpleados/Vista/permisos-rol/permisos-rol.component';
import { EmpresaComponent } from './ModuloEmpresa/Vista/empresa/empresa.component';
import { BodegaComponent } from './ModuloEmpresa/Vista/bodega/bodega.component';
import { BodegaResponsableComponent } from './ModuloEmpresa/Vista/bodega-responsable/bodega-responsable.component';
import { PersonaEmpresaComponent } from './ModuloEmpresa/Vista/persona-empresa/persona-empresa.component';
import { ProcesoComponent } from './ModuloEmpresa/Vista/proceso/proceso.component';
import { ProveedorComponent } from './ModuloCompras/Vista/proveedor/proveedor.component';
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
import { CotizacionComponent } from './ModuloVentas/Vista/cotizacion/cotizacion.component';
import { DetalleCotizacionComponent } from './ModuloVentas/Vista/detalle-cotizacion/detalle-cotizacion.component';
import { DespachoComponent } from './ModuloVentas/Vista/despacho/despacho.component';
import { DetalleDespachoComponent } from './ModuloVentas/Vista/detalle-despacho/detalle-despacho.component';
import { NotaCreditoComponent } from './ModuloVentas/Vista/nota-credito/nota-credito.component';
import { DetalleNotaCreditoComponent } from './ModuloVentas/Vista/detalle-nota-credito/detalle-nota-credito.component';
import { OrdenVentaComponent } from './ModuloVentas/Vista/orden-venta/orden-venta.component';
import { DetalleOrdenVentaComponent } from './ModuloVentas/Vista/detalle-orden-venta/detalle-orden-venta.component';
import { OrdenCompraComponent } from './ModuloCompras/Vista/orden-compra/orden-compra.component';
import { DetalleOrdenCompraComponent } from './ModuloCompras/Vista/detalle-orden-compra/detalle-orden-compra.component';
import { RecepcionInventarioComponent } from './ModuloCompras/Vista/recepcion-inventario/recepcion-inventario.component';
import { DetalleRecepcionComponent } from './ModuloCompras/Vista/detalle-recepcion/detalle-recepcion.component';

const routes: Routes = [
  // Ruta de login (pública)
  { path: 'login', component: LoginComponent },
  
  // Ruta raíz redirige a login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Página de acceso denegado
  { path: 'sin-acceso', component: SinAccesoComponent, canActivate: [AuthGuard] },
  
  // Rutas del módulo de empleados (solo Administrador)
  { path: 'empleados', component: EmpleadosComponent, canActivate: [RoleGuard], data: { module: 'empleados' } },
  { path: 'roles', component: RolesComponent, canActivate: [RoleGuard], data: { module: 'empleados' } },
  { path: 'asignar-roles', component: AsignarRolesComponent, canActivate: [RoleGuard], data: { module: 'empleados' } },
  { path: 'permisos-rol', component: PermisosRolComponent, canActivate: [RoleGuard], data: { module: 'empleados' } },
  
  // Rutas del módulo de compras
  { path: 'proveedores', component: ProveedorComponent, canActivate: [RoleGuard], data: { module: 'compras' } },
  
  // Rutas del módulo de empresa (solo Administrador)
  { path: 'empresas', component: EmpresaComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'bodegas', component: BodegaComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'bodegas-responsables', component: BodegaResponsableComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'personas-empresa', component: PersonaEmpresaComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'procesos', component: ProcesoComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'acciones-proceso', component: AccionProcesoComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'roles-empresa', component: RolEmpresaComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'personas-empresa-roles', component: PersonaEmpresaRolComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'permisos-directos', component: PermisoDirectoPersonalComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'roles-procesos-permisos', component: RolProcesoPermisoComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'reportes-jerarquicos', component: ReporteJerarquicoComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  { path: 'unidades-organizacionales', component: UnidadOrganizacionalComponent, canActivate: [RoleGuard], data: { module: 'empresa' } },
  // Rutas del módulo de inventario
  { path: 'productos', component: ProductoComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'producto-lotes', component: ProductoLoteComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'producto-tipos', component: ProductoTipoComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'producto-existencias', component: ProductoExistenciasComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'producto-configuracion-contable', component: ProductoConfiguracionContableComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'categorias', component: CategoriaComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'subcategorias', component: SubcategoriaComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'grupos', component: GrupoComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'subgrupos', component: SubgrupoComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'centros-costos', component: CentroCostosComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'cuentas-contables', component: CuentaContableComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'lineas-negocio', component: LineaNegocioComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'metodos-valuacion', component: MetodoValuacionComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'tipos-movimiento', component: TipoMovimientoComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'movimientos-inventario', component: MoviminetoInventarioComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  { path: 'detalles-movimiento', component: DetalleMoviminetoComponent, canActivate: [RoleGuard], data: { module: 'inventario' } },
  // Rutas del módulo de ventas
  { path: 'facturas', component: FacturaComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'zonas-venta', component: ZonaVentaComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'tipos-cliente', component: TipoClienteComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'listas-precios', component: ListaPreciosComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'precios-producto', component: PrecioProductoComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'detalles-factura', component: DetalleFacturaComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'clientes', component: ClienteComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'contactos-cliente', component: ContactoClienteComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'direcciones-cliente', component: DireccionClienteComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'cobros', component: CobroComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'condiciones-pago', component: CondicionPagoComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'cotizaciones', component: CotizacionComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'detalles-cotizacion', component: DetalleCotizacionComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'despachos', component: DespachoComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'detalles-despacho', component: DetalleDespachoComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'formas-pago', component: FormaPagoComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'cuentas-por-cobrar', component: CuentasCobrarComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'notas-credito', component: NotaCreditoComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'detalles-nota-credito', component: DetalleNotaCreditoComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'ordenes-venta', component: OrdenVentaComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'detalles-orden-venta', component: DetalleOrdenVentaComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  { path: 'detalles-orden-venta/:id', component: DetalleOrdenVentaComponent, canActivate: [RoleGuard], data: { module: 'ventas' } },
  // Rutas del módulo de compras
  { path: 'compras/ordenes', component: OrdenCompraComponent, canActivate: [RoleGuard], data: { module: 'compras' } },
  { path: 'compras/detalles-orden', component: DetalleOrdenCompraComponent, canActivate: [RoleGuard], data: { module: 'compras' } },
  { path: 'compras/proveedores', component: ProveedorComponent, canActivate: [RoleGuard], data: { module: 'compras' } },
  { path: 'compras/recepciones', component: RecepcionInventarioComponent, canActivate: [RoleGuard], data: { module: 'compras' } },
  { path: 'compras/detalles-recepcion', component: DetalleRecepcionComponent, canActivate: [RoleGuard], data: { module: 'compras' } },
  // Ruta por defecto (404)
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
