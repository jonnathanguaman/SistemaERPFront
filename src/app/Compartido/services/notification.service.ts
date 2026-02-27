import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/**
 * Servicio centralizado para notificaciones usando SweetAlert2
 * Proporciona métodos reutilizables para diferentes tipos de alertas
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    /**
     * Muestra una notificación de éxito
     * @param message Mensaje a mostrar
     * @param title Título opcional (por defecto: "¡Éxito!")
     */
    success(message: string, title: string = '¡Éxito!'): Promise<any> {
        return Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonColor: '#2563EB',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
        });
    }

    /**
     * Muestra una notificación de error
     * @param message Mensaje de error
     * @param title Título opcional (por defecto: "Error")
     */
    error(message: string, title: string = 'Error'): Promise<any> {
        return Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        confirmButtonColor: '#DC2626',
        confirmButtonText: 'Aceptar'
        });
    }

    /**
     * Muestra una notificación de advertencia
     * @param message Mensaje de advertencia
     * @param title Título opcional (por defecto: "Advertencia")
     */
    warning(message: string, title: string = 'Advertencia'): Promise<any> {
        return Swal.fire({
        icon: 'warning',
        title: title,
        text: message,
        confirmButtonColor: '#F59E0B',
        confirmButtonText: 'Aceptar'
        });
    }

    /**
     * Muestra una notificación informativa
     * @param message Mensaje informativo
     * @param title Título opcional (por defecto: "Información")
     */
    info(message: string, title: string = 'Información'): Promise<any> {
        return Swal.fire({
        icon: 'info',
        title: title,
        text: message,
        confirmButtonColor: '#2563EB',
        confirmButtonText: 'Aceptar'
        });
    }

    /**
     * Muestra un diálogo de confirmación
     * @param message Mensaje de confirmación
     * @param title Título opcional (por defecto: "¿Estás seguro?")
     * @returns Promise que resuelve true si confirma, false si cancela
     */
    confirm(
        message: string, 
        title: string = '¿Estás seguro?',
        confirmButtonText: string = 'Sí, confirmar',
        cancelButtonText: string = 'Cancelar'
    ): Promise<boolean> {
        return Swal.fire({
        icon: 'question',
        title: title,
        text: message,
        showCancelButton: true,
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#6B7280',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true
        }).then((result) => {
        return result.isConfirmed;
        });
    }

    /**
     * Muestra un diálogo de confirmación para eliminación
     * @param itemName Nombre del elemento a eliminar
     * @returns Promise que resuelve true si confirma, false si cancela
     */
    confirmDelete(itemName: string): Promise<boolean> {
        return Swal.fire({
        icon: 'warning',
        title: '¿Eliminar?',
        html: `¿Estás seguro de que deseas eliminar <strong>${itemName}</strong>?<br><small>Esta acción no se puede deshacer.</small>`,
        showCancelButton: true,
        confirmButtonColor: '#DC2626',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
        }).then((result) => {
        return result.isConfirmed;
        });
    }

    /**
     * Muestra una notificación toast (pequeña y temporal)
     * @param message Mensaje a mostrar
     * @param icon Tipo de icono (success, error, warning, info)
     * @param position Posición del toast (por defecto: top-end)
     */
    toast(
        message: string,
        icon: 'success' | 'error' | 'warning' | 'info' = 'success',
        position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end'
    ): void {
        const Toast = Swal.mixin({
        toast: true,
        position: position,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
        });

        Toast.fire({
        icon: icon,
        title: message
        });
    }

    /**
     * Muestra un loading spinner
     * @param message Mensaje a mostrar durante la carga
     */
    loading(message: string = 'Cargando...'): void {
        Swal.fire({
        title: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
        });
    }

    /**
     * Cierra cualquier notificación activa
     */
    close(): void {
        Swal.close();
    }

    /**
     * Muestra una notificación de éxito con redirección
     * @param message Mensaje de éxito
     * @param url URL a la que redirigir
     * @param title Título opcional
     */
    successWithRedirect(message: string, url: string, title: string = '¡Éxito!'): void {
        Swal.fire({
        icon: 'success',
        title: title,
        text: message,
        confirmButtonColor: '#2563EB',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true
        }).then(() => {
        globalThis.location.href = url;
        });
    }

    /**
     * Muestra un diálogo con input de texto
     * @param title Título del diálogo
     * @param label Etiqueta del input
     * @param placeholder Placeholder del input
     * @returns Promise que resuelve con el valor ingresado o null si se cancela
     */
    async inputText(
        title: string,
        label: string,
        placeholder: string = ''
    ): Promise<string | null> {
        const result = await Swal.fire({
        title: title,
        input: 'text',
        inputLabel: label,
        inputPlaceholder: placeholder,
        showCancelButton: true,
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
            return 'Este campo es requerido';
            }
            return null;
        }
        });

        return result.isConfirmed ? result.value : null;
    }

    // ========== Alias para compatibilidad con componentes ==========
    
    /**
     * Alias de success() - Muestra una notificación de éxito
     * @param message Mensaje a mostrar
     * @param title Título opcional (por defecto: "¡Éxito!")
     */
    showSuccess(message: string, title: string = '¡Éxito!'): Promise<any> {
        return this.success(message, title);
    }

    /**
     * Alias de error() - Muestra una notificación de error
     * @param message Mensaje de error
     * @param title Título opcional (por defecto: "Error")
     */
    showError(message: string, title: string = 'Error'): Promise<any> {
        return this.error(message, title);
    }

    /**
     * Alias de warning() - Muestra una notificación de advertencia
     * @param message Mensaje de advertencia
     * @param title Título opcional (por defecto: "Advertencia")
     */
    showWarning(message: string, title: string = 'Advertencia'): Promise<any> {
        return this.warning(message, title);
    }

    /**
     * Alias de info() - Muestra una notificación informativa
     * @param message Mensaje informativo
     * @param title Título opcional (por defecto: "Información")
     */
    showInfo(message: string, title: string = 'Información'): Promise<any> {
        return this.info(message, title);
    }

    /**
     * Alias de confirm() - Muestra un diálogo de confirmación
     * @param message Mensaje de confirmación
     * @param title Título opcional (por defecto: "¿Estás seguro?")
     * @returns Promise que resuelve true si confirma, false si cancela
     */
    showConfirm(
        message: string, 
        title: string = '¿Estás seguro?',
        confirmButtonText: string = 'Sí, confirmar',
        cancelButtonText: string = 'Cancelar'
    ): Promise<boolean> {
        return this.confirm(message, title, confirmButtonText, cancelButtonText);
    }
}
