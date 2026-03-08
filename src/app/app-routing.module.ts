import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Compartido/login/login.component';
import { AuthGuard } from './Compartido/guards/auth.guard';
import { EmpleadosComponent } from './ModuloEmpleados/Vista/empleados/empleados.component';
import { RolesComponent } from './ModuloEmpleados/Vista/roles/roles.component';
import { AsignarRolesComponent } from './ModuloEmpleados/Vista/asignar-roles/asignar-roles.component';
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
  
  // Rutas protegidas con AuthGuard
  // Rutas del módulo de empleados
  { path: 'empleados', component: EmpleadosComponent, canActivate: [AuthGuard] },
  { path: 'roles', component: RolesComponent, canActivate: [AuthGuard] },
  { path: 'asignar-roles', component: AsignarRolesComponent, canActivate: [AuthGuard] },
  
  // Rutas del módulo de compras
  { path: 'proveedores', component: ProveedorComponent, canActivate: [AuthGuard] },
  
  // Rutas del módulo de empresa
  { path: 'empresas', component: EmpresaComponent, canActivate: [AuthGuard] },
  { path: 'bodegas', component: BodegaComponent, canActivate: [AuthGuard] },
  { path: 'bodegas-responsables', component: BodegaResponsableComponent, canActivate: [AuthGuard] },
  { path: 'personas-empresa', component: PersonaEmpresaComponent, canActivate: [AuthGuard] },
  { path: 'procesos', component: ProcesoComponent, canActivate: [AuthGuard] },
  { path: 'acciones-proceso', component: AccionProcesoComponent, canActivate: [AuthGuard] },
  { path: 'roles-empresa', component: RolEmpresaComponent, canActivate: [AuthGuard] },
  { path: 'personas-empresa-roles', component: PersonaEmpresaRolComponent, canActivate: [AuthGuard] },
  { path: 'permisos-directos', component: PermisoDirectoPersonalComponent, canActivate: [AuthGuard] },
  { path: 'roles-procesos-permisos', component: RolProcesoPermisoComponent, canActivate: [AuthGuard] },
  { path: 'reportes-jerarquicos', component: ReporteJerarquicoComponent, canActivate: [AuthGuard] },
  { path: 'unidades-organizacionales', component: UnidadOrganizacionalComponent, canActivate: [AuthGuard] },
  // Rutas del módulo de inventario
  { path: 'productos', component: ProductoComponent, canActivate: [AuthGuard] },
  { path: 'producto-lotes', component: ProductoLoteComponent, canActivate: [AuthGuard] },
  { path: 'producto-tipos', component: ProductoTipoComponent, canActivate: [AuthGuard] },
  { path: 'producto-existencias', component: ProductoExistenciasComponent, canActivate: [AuthGuard] },
  { path: 'producto-configuracion-contable', component: ProductoConfiguracionContableComponent, canActivate: [AuthGuard] },
  { path: 'categorias', component: CategoriaComponent, canActivate: [AuthGuard] },
  { path: 'subcategorias', component: SubcategoriaComponent, canActivate: [AuthGuard] },
  { path: 'grupos', component: GrupoComponent, canActivate: [AuthGuard] },
  { path: 'subgrupos', component: SubgrupoComponent, canActivate: [AuthGuard] },
  { path: 'centros-costos', component: CentroCostosComponent, canActivate: [AuthGuard] },
  { path: 'cuentas-contables', component: CuentaContableComponent, canActivate: [AuthGuard] },
  { path: 'lineas-negocio', component: LineaNegocioComponent, canActivate: [AuthGuard] },
  { path: 'metodos-valuacion', component: MetodoValuacionComponent, canActivate: [AuthGuard] },
  { path: 'tipos-movimiento', component: TipoMovimientoComponent, canActivate: [AuthGuard] },
  { path: 'movimientos-inventario', component: MoviminetoInventarioComponent, canActivate: [AuthGuard] },
  { path: 'detalles-movimiento', component: DetalleMoviminetoComponent, canActivate: [AuthGuard] },
  // Rutas del módulo de ventas
  { path: 'facturas', component: FacturaComponent, canActivate: [AuthGuard] },
  { path: 'zonas-venta', component: ZonaVentaComponent, canActivate: [AuthGuard] },
  { path: 'tipos-cliente', component: TipoClienteComponent, canActivate: [AuthGuard] },
  { path: 'listas-precios', component: ListaPreciosComponent, canActivate: [AuthGuard] },
  { path: 'precios-producto', component: PrecioProductoComponent, canActivate: [AuthGuard] },
  { path: 'detalles-factura', component: DetalleFacturaComponent, canActivate: [AuthGuard] },
  { path: 'clientes', component: ClienteComponent, canActivate: [AuthGuard] },
  { path: 'contactos-cliente', component: ContactoClienteComponent, canActivate: [AuthGuard] },
  { path: 'direcciones-cliente', component: DireccionClienteComponent, canActivate: [AuthGuard] },
  { path: 'cobros', component: CobroComponent, canActivate: [AuthGuard] },
  { path: 'condiciones-pago', component: CondicionPagoComponent, canActivate: [AuthGuard] },
  { path: 'cotizaciones', component: CotizacionComponent, canActivate: [AuthGuard] },
  { path: 'detalles-cotizacion', component: DetalleCotizacionComponent, canActivate: [AuthGuard] },
  { path: 'despachos', component: DespachoComponent, canActivate: [AuthGuard] },
  { path: 'detalles-despacho', component: DetalleDespachoComponent, canActivate: [AuthGuard] },
  { path: 'formas-pago', component: FormaPagoComponent, canActivate: [AuthGuard] },
  { path: 'cuentas-por-cobrar', component: CuentasCobrarComponent, canActivate: [AuthGuard] },
  { path: 'notas-credito', component: NotaCreditoComponent, canActivate: [AuthGuard] },
  { path: 'detalles-nota-credito', component: DetalleNotaCreditoComponent, canActivate: [AuthGuard] },
  { path: 'ordenes-venta', component: OrdenVentaComponent, canActivate: [AuthGuard] },
  { path: 'detalles-orden-venta', component: DetalleOrdenVentaComponent, canActivate: [AuthGuard] },
  { path: 'detalles-orden-venta/:id', component: DetalleOrdenVentaComponent, canActivate: [AuthGuard] },
  // Rutas del módulo de compras
  { path: 'compras/ordenes', component: OrdenCompraComponent, canActivate: [AuthGuard] },
  { path: 'compras/detalles-orden', component: DetalleOrdenCompraComponent, canActivate: [AuthGuard] },
  { path: 'compras/proveedores', component: ProveedorComponent, canActivate: [AuthGuard] },
  { path: 'compras/recepciones', component: RecepcionInventarioComponent, canActivate: [AuthGuard] },
  { path: 'compras/detalles-recepcion', component: DetalleRecepcionComponent, canActivate: [AuthGuard] },
  // Ruta por defecto (404)
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
