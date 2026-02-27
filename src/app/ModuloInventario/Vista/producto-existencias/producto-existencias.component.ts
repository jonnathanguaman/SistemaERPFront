import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoExistenciasService } from '../../Service/producto-existencias.service';
import { ProductoService } from '../../Service/producto.service';
import { ProductoLoteService } from '../../Service/producto-lote.service';
import { BodegaService } from '../../../ModuloEmpresa/Service/bodega.service';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { ProductoExistenciasRequest, ProductoExistenciasResponse } from '../../Entidad/producto-existencias.model';
import { ProductoResponse } from '../../Entidad/producto.model';
import { ProductoLoteResponse } from '../../Entidad/producto-lote.model';
import { BodegaResponse } from '../../../ModuloEmpresa/Entidad/bodega.model';

@Component({
  selector: 'app-producto-existencias',
  standalone: false,
  templateUrl: './producto-existencias.component.html',
  styleUrl: './producto-existencias.component.css'
})
export class ProductoExistenciasComponent implements OnInit {
  existenciasList: ProductoExistenciasResponse[] = [];
  productos: ProductoResponse[] = [];
  bodegas: BodegaResponse[] = [];
  lotes: ProductoLoteResponse[] = [];
  existenciasForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  showModal = false;
  searchTerm: string = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly existenciasService: ProductoExistenciasService,
    private readonly productoService: ProductoService,
    private readonly loteService: ProductoLoteService,
    private readonly bodegaService: BodegaService,
    private readonly notificationService: NotificationService
  ) {
    this.existenciasForm = this.fb.group({
      productoId: ['', Validators.required],
      bodegaId: ['', Validators.required],
      productoLoteId: [''],
      cantidadFisica: [0, [Validators.required, Validators.min(0)]],
      cantidadDisponible: [0, [Validators.required, Validators.min(0)]],
      cantidadReservada: [0, [Validators.required, Validators.min(0)]],
      costoPromedio: [0, [Validators.required, Validators.min(0)]],
      ubicacion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadExistencias();
    this.loadProductos();
    this.loadBodegas();
    this.loadLotes();
  }

  /**
   * Obtiene la lista filtrada de existencias según el término de búsqueda
   */
  get existenciasFiltradas(): ProductoExistenciasResponse[] {
    if (!this.searchTerm.trim()) {
      return this.existenciasList;
    }

    const termino = this.searchTerm.toLowerCase();
    return this.existenciasList.filter(existencia =>
      existencia.productoNombre?.toLowerCase().includes(termino) ||
      existencia.bodegaNombre?.toLowerCase().includes(termino) ||
      existencia.loteNumero?.toLowerCase().includes(termino) ||
      existencia.id.toString().includes(termino)
    );
  }

  loadExistencias(): void {
    this.existenciasService.findAll().subscribe({
      next: (data) => {
        this.existenciasList = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar existencias: ' + error.message);
      }
    });
  }

  loadProductos(): void {
    this.productoService.findAll().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar productos: ' + error.message);
      }
    });
  }

  loadBodegas(): void {
    this.bodegaService.findAll().subscribe({
      next: (data) => {
        this.bodegas = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar bodegas: ' + error.message);
      }
    });
  }

  loadLotes(): void {
    this.loteService.findAll().subscribe({
      next: (data) => {
        this.lotes = data;
      },
      error: (error) => {
        this.notificationService.showError('Error al cargar lotes: ' + error.message);
      }
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.existenciasForm.reset({
      cantidadFisica: 0,
      cantidadDisponible: 0,
      cantidadReservada: 0,
      costoPromedio: 0,
      ubicacion: '',
      activo: true
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.existenciasForm.reset();
  }

  edit(existencias: ProductoExistenciasResponse): void {
    this.isEditing = true;
    this.editingId = existencias.id;
    this.existenciasForm.patchValue({
      productoId: existencias.productoId,
      bodegaId: existencias.bodegaId,
      productoLoteId: existencias.productoLoteId,
      cantidadFisica: existencias.cantidadFisica,
      cantidadDisponible: existencias.cantidadDisponible,
      cantidadReservada: existencias.cantidadReservada,
      ubicacion: existencias.ubicacion,
      costoPromedio: existencias.costoPromedio,
      activo: existencias.activo
    });
    this.showModal = true;
  }

  save(): void {
    if (this.existenciasForm.invalid) {
      this.notificationService.showWarning('Por favor complete todos los campos requeridos');
      return;
    }

    const existenciasData: ProductoExistenciasRequest = this.existenciasForm.value;

    if (this.isEditing && this.editingId !== null) {
      this.existenciasService.update(this.editingId, existenciasData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Existencias actualizadas exitosamente');
          this.loadExistencias();
          this.closeModal();
        },
        error: (error) => {
          this.notificationService.showError('Error al actualizar: ' + error.message);
        }
      });
    } else {
      this.existenciasService.save(existenciasData).subscribe({
        next: () => {
          this.notificationService.showSuccess('Existencias registradas exitosamente');
          this.loadExistencias();
          this.closeModal();
        },
        error: (error) => {
          this.notificationService.showError('Error al registrar: ' + error.message);
        }
      });
    }
  }

  delete(id: number): void {
    if (confirm('¿Está seguro de eliminar este registro de existencias?')) {
      this.existenciasService.delete(id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Existencias eliminadas exitosamente');
          this.loadExistencias();
        },
        error: (error) => {
          this.notificationService.showError('Error al eliminar: ' + error.message);
        }
      });
    }
  }
}
