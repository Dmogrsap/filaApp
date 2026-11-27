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

  ngOnInit(): void {
    this.loadImages();
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    if (!this.isSupportedFile(file)) {
      Swal.fire(
        'Formato incorrecto',
        'Selecciona una imagen, un archivo PDF o una presentación PowerPoint (PPT/PPTX).',
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
        title: '¡Archivo subido!',
        text: 'El archivo se guardó exitosamente en Supabase (images/multimedia).',
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

    if (!this.isSupportedFile(file)) {
      Swal.fire(
        'Formato incorrecto',
        'Selecciona una imagen, un archivo PDF o una presentación PowerPoint (PPT/PPTX).',
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
        title: '¡Archivo reemplazado!',
        text: 'El archivo ha sido actualizado en Supabase con éxito.',
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
    if (!this.isImage(image)) return;
    this.selectedImage = image;
    this.popupVisible = true;
  }

  isSupportedFile(file: File): boolean {
    if (file.type.startsWith('image/')) return true;

    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['pdf', 'ppt', 'pptx'].includes(extension || '');
  }

  isImage(file: any): boolean {
    if (!file) return false;
    if (file.contentType?.startsWith('image/')) return true;

    const filename = file.name || file.path || '';
    return /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(filename);
  }

  getFileExtension(file: any): string {
    const filename = file?.name || file?.path || '';
    const extension = filename.split('.').pop();
    return extension && extension !== filename
      ? extension.toUpperCase()
      : 'FILE';
  }

  openReplaceDialog(image: any, fileInput: HTMLInputElement) {
    this.imageToReplace = image;
    fileInput.click();
  }

  async onDownload(image: any) {
    if (!image?.url) return;

    try {
      const response = await fetch(image.url);
      if (!response.ok) {
        throw new Error(`No se pudo descargar la imagen (${response.status})`);
      }

      const blob = await response.blob();
      const originalName = image.name || 'imagen';
      const dotIndex = originalName.lastIndexOf('.');
      const nameWithoutExtension =
        dotIndex > 0 ? originalName.substring(0, dotIndex) : originalName;
      const mimeExtensions: Record<string, string> = {
        'image/avif': 'avif',
        'image/bmp': 'bmp',
        'image/gif': 'gif',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/svg+xml': 'svg',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          'pptx',
      };
      const extension =
        (dotIndex > 0 ? originalName.substring(dotIndex + 1).toLowerCase() : '') ||
        mimeExtensions[blob.type] ||
        'jpg';
      const downloadName = `${nameWithoutExtension}.${extension}`;
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        pdf: 'application/pdf',
        ppt: 'application/vnd.ms-powerpoint',
        pptx:
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      };
      const mimeType = mimeTypes[extension] || blob.type || 'application/octet-stream';

      const savePicker = (window as any).showSaveFilePicker;
      if (typeof savePicker === 'function') {
        try {
          const handle = await savePicker({
            suggestedName: downloadName,
            types: [
              {
                description: `Archivo ${extension.toUpperCase()}`,
                accept: {
                  [mimeType]: [`.${extension}`],
                },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return;
        } catch (err: any) {
          if (err?.name === 'AbortError') return;
          throw err;
        }
      }

      const result = await Swal.fire({
        title: 'Nombre de descarga',
        input: 'text',
        inputValue: downloadName,
        showCancelButton: true,
        confirmButtonText: 'Descargar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => (!value.trim() ? 'Ingresa un nombre válido' : undefined),
      });
      if (!result.isConfirmed) return;

      const chosenName = result.value.trim();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = chosenName.toLowerCase().endsWith(`.${extension}`)
        ? chosenName
        : `${chosenName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      console.error('Download error', err);
      Swal.fire(
        'Error',
        err?.message || 'No se pudo descargar la imagen',
        'error',
      );
    }
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
