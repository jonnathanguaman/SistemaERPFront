import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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

@NgModule({
  declarations: [
    AppComponent,
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
    CobroComponent,
    CondicionPagoComponent,
    FormaPagoComponent,
    CuentasCobrarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
