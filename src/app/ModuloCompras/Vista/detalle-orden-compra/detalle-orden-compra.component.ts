import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ProductoService } from '../../../ModuloInventario/Service/producto.service';
import { ProductoResponse } from '../../../ModuloInventario/Entidad/producto.model';

@Component({
  selector: 'app-detalle-orden-compra',
  standalone: false,
  templateUrl: './detalle-orden-compra.component.html',
  styleUrl: './detalle-orden-compra.component.css'
})
export class DetalleOrdenCompraComponent implements OnInit {
  
  @Input() detalles!: FormArray;
  @Input() isViewMode: boolean = false;
  @Output() agregarDetalle = new EventEmitter<void>();
  @Output() eliminarDetalle = new EventEmitter<number>();

  productos: ProductoResponse[] = [];
  isLoadingProductos: boolean = false;

  constructor(private readonly productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  get detallesControls(): FormGroup[] {
    return this.detalles.controls as FormGroup[];
  }

  cargarProductos(): void {
    this.isLoadingProductos = true;
    this.productoService.findAll().subscribe({
      next: (data) => {
        this.productos = data;
        this.isLoadingProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.isLoadingProductos = false;
      }
    });
  }

  onAgregarDetalle(): void {
    this.agregarDetalle.emit();
  }

  onEliminarDetalle(index: number): void {
    this.eliminarDetalle.emit(index);
  }

  calcularTotalDetalle(index: number): number {
    const detalle = this.detalles.at(index).value;
    const cantidad = detalle.cantidadOrdenada || 0;
    const precio = detalle.precioUnitario || 0;
    const descuento = detalle.descuentoMonto || 0;
    const impuesto = detalle.impuestoPorcentaje || 0;
    
    const subtotal = (cantidad * precio) - descuento;
    const montoImpuesto = subtotal * (impuesto / 100);
    return subtotal + montoImpuesto;
  }

  calcularTotalOrden(): number {
    let total = 0;
    for (let i = 0; i < this.detalles.length; i++) {
      total += this.calcularTotalDetalle(i);
    }
    return total;
  }

  getNombreProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.productoNombre : 'Seleccione un producto';
  }

  isDetalleFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.detalles.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
