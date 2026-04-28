import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtInterceptor } from './Compartido/interceptors/jwt.interceptor';
import { LoginComponent } from './Compartido/login/login.component';
import { EmpleadosComponent } from './ModuloEmpleados/Vista/empleados/empleados.component';
import { RolesComponent } from './ModuloEmpleados/Vista/roles/roles.component';
import { MenuComponent } from './Compartido/menu/menu.component';
import { AsignarRolesComponent } from './ModuloEmpleados/Vista/asignar-roles/asignar-roles.component';
import { EmpresaComponent } from './ModuloEmpresa/Vista/empresa/empresa.component';
import { BodegaComponent } from './ModuloEmpresa/Vista/bodega/bodega.component';
import { BodegaResponsableComponent } from './ModuloEmpresa/Vista/bodega-responsable/bodega-responsable.component';
import { PersonaEmpresaComponent } from './ModuloEmpresa/Vista/persona-empresa/persona-empresa.component';
import { ProcesoComponent } from './ModuloEmpresa/Vista/proceso/proceso.component';
import { AccionProcesoComponent } from './ModuloEmpresa/Vista/accion-proceso/accion-proceso.component';
import { PermisoDirectoPersonalComponent } from './ModuloEmpresa/Vista/permiso-directo-personal/permiso-directo-personal.component';
import { PersonaEmpresaRolComponent } from './ModuloEmpresa/Vista/persona-empresa-rol/persona-empresa-rol.component';
import { RolProcesoPermisoComponent } from './ModuloEmpresa/Vista/rol-proceso-permiso/rol-proceso-permiso.component';
import { RolEmpresaComponent } from './ModuloEmpresa/Vista/rol-empresa/rol-empresa.component';
import { ReporteJerarquicoComponent } from './ModuloEmpresa/Vista/reporte-jerarquico/reporte-jerarquico.component';
import { UnidadOrganizacionalComponent } from './ModuloEmpresa/Vista/unidad-organizacional/unidad-organizacional.component';
import { GrupoComponent } from './ModuloInventario/Vista/grupo/grupo.component';
import { SubgrupoComponent } from './ModuloInventario/Vista/subgrupo/subgrupo.component';
import { CategoriaComponent } from './ModuloInventario/Vista/categoria/categoria.component';
import { SubcategoriaComponent } from './ModuloInventario/Vista/subcategoria/subcategoria.component';
import { ProductoComponent } from './ModuloInventario/Vista/producto/producto.component';
import { ProductoLoteComponent } from './ModuloInventario/Vista/producto-lote/producto-lote.component';
import { ProductoTipoComponent } from './ModuloInventario/Vista/producto-tipo/producto-tipo.component';
import { ProductoExistenciasComponent } from './ModuloInventario/Vista/producto-existencias/producto-existencias.component';
import { ProductoConfiguracionContableComponent } from './ModuloInventario/Vista/producto-configuracion-contable/producto-configuracion-contable.component';
import { CentroCostosComponent } from './ModuloInventario/Vista/centro-costos/centro-costos.component';
import { CuentaContableComponent } from './ModuloInventario/Vista/cuenta-contable/cuenta-contable.component';
import { LineaNegocioComponent } from './ModuloInventario/Vista/linea-negocio/linea-negocio.component';
import { MetodoValuacionComponent } from './ModuloInventario/Vista/metodo-valuacion/metodo-valuacion.component';
import { TipoMovimientoComponent } from './ModuloInventario/Vista/tipo-movimiento/tipo-movimiento.component';
import { MoviminetoInventarioComponent } from './ModuloInventario/Vista/movimineto-inventario/movimineto-inventario.component';
import { DetalleMoviminetoComponent } from './ModuloInventario/Vista/detalle-movimineto/detalle-movimineto.component';
import { ClienteComponent } from './ModuloVentas/Vista/cliente/cliente.component';
import { ContactoClienteComponent } from './ModuloVentas/Vista/contacto-cliente/contacto-cliente.component';
import { DireccionClienteComponent } from './ModuloVentas/Vista/direccion-cliente/direccion-cliente.component';
import { FacturaComponent } from './ModuloVentas/Vista/factura/factura.component';
import { DetalleFacturaComponent } from './ModuloVentas/Vista/detalle-factura/detalle-factura.component';
import { ZonaVentaComponent } from './ModuloVentas/Vista/zona-venta/zona-venta.component';
import { ListaPreciosComponent } from './ModuloVentas/Vista/lista-precios/lista-precios.component';
import { TipoClienteComponent } from './ModuloVentas/Vista/tipo-cliente/tipo-cliente.component';
import { PrecioProductoComponent } from './ModuloVentas/Vista/precio-producto/precio-producto.component';
import { CobroComponent } from './ModuloVentas/Vista/cobro/cobro.component';
import { CondicionPagoComponent } from './ModuloVentas/Vista/condicion-pago/condicion-pago.component';
import { FormaPagoComponent } from './ModuloVentas/Vista/forma-pago/forma-pago.component';
import { CuentasCobrarComponent } from './ModuloVentas/Vista/cuentas-cobrar/cuentas-cobrar.component';
import { DetalleCotizacionComponent } from './ModuloVentas/Vista/detalle-cotizacion/detalle-cotizacion.component';
import { DetalleCobroComponent } from './ModuloVentas/Vista/detalle-cobro/detalle-cobro.component';
import { CotizacionComponent } from './ModuloVentas/Vista/cotizacion/cotizacion.component';
import { CotizacionFormComponent } from './ModuloVentas/Vista/cotizacion-form/cotizacion-form.component';
import { DespachoComponent } from './ModuloVentas/Vista/despacho/despacho.component';
import { DetalleDespachoComponent } from './ModuloVentas/Vista/detalle-despacho/detalle-despacho.component';
import { NotaCreditoComponent } from './ModuloVentas/Vista/nota-credito/nota-credito.component';
import { DetalleNotaCreditoComponent } from './ModuloVentas/Vista/detalle-nota-credito/detalle-nota-credito.component';
import { OrdenVentaComponent } from './ModuloVentas/Vista/orden-venta/orden-venta.component';
import { OrdenVentaFormComponent } from './ModuloVentas/Vista/orden-venta-form/orden-venta-form.component';
import { DetalleOrdenVentaComponent } from './ModuloVentas/Vista/detalle-orden-venta/detalle-orden-venta.component';
import { OrdenCompraComponent } from './ModuloCompras/Vista/orden-compra/orden-compra.component';
import { OrdenCompraFormComponent } from './ModuloCompras/Vista/orden-compra-form/orden-compra-form.component';
import { DetalleOrdenCompraComponent } from './ModuloCompras/Vista/detalle-orden-compra/detalle-orden-compra.component';
import { ProveedorComponent } from './ModuloCompras/Vista/proveedor/proveedor.component';
import { RecepcionInventarioComponent } from './ModuloCompras/Vista/recepcion-inventario/recepcion-inventario.component';
import { DetalleRecepcionComponent } from './ModuloCompras/Vista/detalle-recepcion/detalle-recepcion.component';
import { RecepcionFormComponent } from './ModuloCompras/Vista/recepcion-form/recepcion-form.component';
import { SinAccesoComponent } from './Compartido/sin-acceso/sin-acceso.component';
import { PermisosRolComponent } from './ModuloEmpleados/Vista/permisos-rol/permisos-rol.component';
import { IvaProductoComponent } from './ModuloVentas/Vista/iva-producto/iva-producto.component';
import { ListaIvaComponent } from './ModuloVentas/Vista/lista-iva/lista-iva.component';
import { SolicitudTransferenciaComponent } from './ModuloInventario/Vista/solicitud-transferencia/solicitud-transferencia.component';
import { DashboardComponent } from './ModuloDashboard/Vista/dashboard/dashboard.component';
import { DashboardVentasComponent } from './ModuloVentas/Vista/dashboard-ventas/dashboard-ventas.component';
import { DashboardComprasComponent } from './ModuloCompras/Vista/dashboard-compras/dashboard-compras.component';
import { DashboardInventarioComponent } from './ModuloInventario/Vista/dashboard-inventario/dashboard-inventario.component';
import { DashboardEmpleadosComponent } from './ModuloEmpleados/Vista/dashboard-empleados/dashboard-empleados.component';
import { DashboardEmpresaComponent } from './ModuloEmpresa/Vista/dashboard-empresa/dashboard-empresa.component';
import { FacturadorComponent } from './ModuloVentas/Vista/facturador/facturador.component';
import { PaisComponent } from './ModuloEmpresa/Vista/pais/pais.component';
import { ProvinciaComponent } from './ModuloEmpresa/Vista/provincia/provincia.component';
import { CiudadComponent } from './ModuloEmpresa/Vista/ciudad/ciudad.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DashboardVentasComponent,
    DashboardComprasComponent,
    DashboardInventarioComponent,
    DashboardEmpleadosComponent,
    DashboardEmpresaComponent,
    FacturadorComponent,
    PaisComponent,
    ProvinciaComponent,
    CiudadComponent,
    LoginComponent,
    EmpleadosComponent,
    RolesComponent,
    MenuComponent,
    AsignarRolesComponent,
    EmpresaComponent,
    BodegaComponent,
    BodegaResponsableComponent,
    PersonaEmpresaComponent,
    ProcesoComponent,
    AccionProcesoComponent,
    PermisoDirectoPersonalComponent,
    PersonaEmpresaRolComponent,
    RolProcesoPermisoComponent,
    RolEmpresaComponent,
    ReporteJerarquicoComponent,
    UnidadOrganizacionalComponent,
    GrupoComponent,
    SubgrupoComponent,
    CategoriaComponent,
    SubcategoriaComponent,
    ProductoComponent,
    ProductoLoteComponent,
    ProductoTipoComponent,
    ProductoExistenciasComponent,
    ProductoConfiguracionContableComponent,
    CentroCostosComponent,
    CuentaContableComponent,
    LineaNegocioComponent,
    MetodoValuacionComponent,
    TipoMovimientoComponent,
    MoviminetoInventarioComponent,
    DetalleMoviminetoComponent,
    ClienteComponent,
    ContactoClienteComponent,
    DireccionClienteComponent,
    FacturaComponent,
    DetalleFacturaComponent,
    ZonaVentaComponent,
    ListaPreciosComponent,
    TipoClienteComponent,
    PrecioProductoComponent,
    IvaProductoComponent,
    ListaIvaComponent,
    CobroComponent,
    CondicionPagoComponent,
    FormaPagoComponent,
    CuentasCobrarComponent,
    DetalleCotizacionComponent,
    DetalleCobroComponent,
    CotizacionComponent,
    CotizacionFormComponent,
    DespachoComponent,
    DetalleDespachoComponent,
    NotaCreditoComponent,
    DetalleNotaCreditoComponent,
    OrdenVentaComponent,
    OrdenVentaFormComponent,
    DetalleOrdenVentaComponent,
    OrdenCompraComponent,
    OrdenCompraFormComponent,
    DetalleOrdenCompraComponent,
    ProveedorComponent,
    RecepcionInventarioComponent,
    DetalleRecepcionComponent,
    RecepcionFormComponent,
    SinAccesoComponent,
    PermisosRolComponent,
    SolicitudTransferenciaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
