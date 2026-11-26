import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { SupabaseStorageService } from '../services/supabase-storage.service';

@Component({
  selector: 'app-multimedia',
  templateUrl: './multimedia.component.html',
  styleUrls: ['./multimedia.component.css'],
})
export class MultimediaComponent {
  /* --- Variables --- */
  public uploading = false;
  public loading = false;
  public images: any[] = [];
  public imageToReplace: any = null;
  public selectedImage: any;
  public popupVisible = false;

  /* --- Fin de variables --- */
  constructor(private supabaseStorage: SupabaseStorageService) {}

  ngOnInit(): void {}

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire(
        'Formato incorrecto',
        'Por favor selecciona un archivo de imagen (PNG, JPG, etc.)',
        'warning',
      );
      event.target.value = '';
      return;
    }

    try {
      this.uploading = true;
      await this.supabaseStorage.uploadFile(file, 'multimedia');
      await this.loadImages();
      Swal.fire({
        icon: 'success',
        title: '¡Imagen subida!',
        text: 'La imagen se guardó exitosamente en Supabase (images/multimedia).',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Error uploading image to Supabase', err);
      Swal.fire(
        'Error',
        err?.message || 'Fallo al subir imagen a Supabase',
        'error',
      );
    } finally {
      this.uploading = false;
      event.target.value = '';
    }
  }

  async loadImages() {
    try {
      this.loading = true;
      // Listamos todas las imágenes dentro de la carpeta 'multimedia' del bucket 'images'
      this.images = await this.supabaseStorage.listFiles('multimedia');
    } catch (err) {
      console.error('Error listing files from Supabase', err);
    } finally {
      this.loading = false;
    }
  }

  async onReplaceFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file || !this.imageToReplace) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire(
        'Formato incorrecto',
        'Por favor selecciona un archivo de imagen válido',
        'warning',
      );
      event.target.value = '';
      return;
    }

    try {
      this.uploading = true;
      await this.supabaseStorage.replaceFile(
        this.imageToReplace.path,
        file,
        'multimedia',
      );
      this.imageToReplace = null;
      await this.loadImages();
      Swal.fire({
        icon: 'success',
        title: '¡Imagen reemplazada!',
        text: 'La imagen ha sido actualizada en Supabase con éxito.',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Error al reemplazar imagen', err);
      Swal.fire(
        'Error',
        err?.message || 'No se pudo reemplazar la imagen',
        'error',
      );
    } finally {
      this.uploading = false;
      event.target.value = '';
    }
  }

  onPreview(image: any) {
    this.selectedImage = image;
    this.popupVisible = true;
  }

  openReplaceDialog(image: any, fileInput: HTMLInputElement) {
    this.imageToReplace = image;
    fileInput.click();
  }

  async onDelete(image: any) {
    if (!image?.path) return;

    const result = await Swal.fire({
      title: '¿Eliminar imagen?',
      text: `Se eliminará permanentemente "${image.name || 'la imagen'}" de Supabase.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      this.loading = true;
      await this.supabaseStorage.deleteFile(image.path);
      await this.loadImages();
      Swal.fire({
        icon: 'success',
        title: 'Imagen eliminada',
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Delete error', err);
      Swal.fire('Error', 'No se pudo eliminar la imagen de Supabase', 'error');
    } finally {
      this.loading = false;
    }
  }
}
