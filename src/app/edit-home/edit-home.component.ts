import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { SupabaseStorageService } from '../services/supabase-storage.service';
import { EdithomeService } from '../services/edithome.service';
import { firstValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-edit-home',
  templateUrl: './edit-home.component.html',
  styleUrls: ['./edit-home.component.css'],
})
export class EditHomeComponent implements OnInit {
  public images: any[] = [];
  public dataSourceEnvivo: any[] = [];
  public loading = false;
  public loadIndicatorVisible = false;
  public selectedImage: any;
  public popupVisible = false;
  public previewSelected: string | null = null;
  public uploading = false;
  public isUpdatingLive = false;
  public isLive = false;
  public liveStateId: string | null = null;
  public liveVideoLink: string = '';
  public envivo: any[] = [];
  public imageToReplace: any = null;

  public dataSourceMenusTab: any[] = [];

  constructor(
    private supabaseStorage: SupabaseStorageService,
    private edithomeService: EdithomeService,
  ) {}

  async ngOnInit() {
    await Promise.all([this.loadImages(), this.loadLiveState()]);

    this.edithomeService.getEnvivo().subscribe({
      next: (data) => {
        this.dataSourceEnvivo = data;
        if (data && data.length > 0) {
          const state = data[0];
          this.liveStateId = state.id;
          this.envivo = state.envivo;
          this.liveVideoLink = state.link || '';
        }
        //console.log('Datos de transmisión en vivo:', data);
      },
      error: (error) => {
        //console.error('Error al obtener la colección de transmisión en vivo:', error);
      },
    });
  }

  public async onEnvivoChange(e: any) {
    if (!e.event) {
      return;
    }

    const nuevoEstado: boolean = e.value;
    const estadoAnterior: boolean = e.previousValue ?? !nuevoEstado;
    const id = this.liveStateId || this.dataSourceEnvivo?.[0]?.id;
    // Validamos que tengamos el ID del documento obtenido en ngOnInit
    if (!id) {
      this.isLive = estadoAnterior;
      Swal.fire(
        'Error',
        'No se encontró el ID de la transmisión para actualizar',
        'error',
      );
      return;
    }
    this.isUpdatingLive = true;

    try {
      // Actualizamos en Firebase pasando el ID y el nuevo campo { envivo }
      await this.edithomeService.updateEnvivo(id, {
        envivo: nuevoEstado,
      });
      this.isLive = nuevoEstado;
      Swal.fire({
        icon: 'success',
        title: nuevoEstado
          ? '¡Transmisión activada!'
          : 'Transmisión desactivada',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error('Error al actualizar el estado de transmisión:', error);
      // Revertimos el switch a su estado previo en caso de error
      this.isLive = estadoAnterior;
      Swal.fire(
        'Error',
        'No se pudo actualizar el estado en Firebase',
        'error',
      );
    } finally {
      this.isUpdatingLive = false;
    }
  }

  public async agregarLinkTransmision() {
    const id = this.liveStateId || this.dataSourceEnvivo?.[0]?.id;

    if (!id) {
      Swal.fire(
        'Error',
        'No se encontró la configuración de transmisión en Firebase',
        'error',
      );
      return;
    }

    const { value: urlIngresada } = await Swal.fire({
      title: 'Enlace de la Transmisión',
      input: 'url',
      inputLabel: 'Pega el link del video de Facebook Live',
      inputValue: this.liveVideoLink || '',
      inputPlaceholder: 'https://www.facebook.com/.../videos/...',
      showCancelButton: true,
      confirmButtonText: 'Guardar Link',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes ingresar un enlace válido';
        }
        return null;
      },
    });

    if (urlIngresada) {
      try {
        await this.edithomeService.updateEnvivo(id, {
          link: urlIngresada.trim(),
        });

        this.liveVideoLink = urlIngresada.trim();

        Swal.fire({
          icon: 'success',
          title: '¡Enlace actualizado!',
          text: 'El link de transmisión se guardó correctamente.',
          timer: 1600,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error al guardar el enlace en Firebase:', error);
        Swal.fire('Error', 'No se pudo guardar el enlace en Firebase', 'error');
      }
    }
  }

  public async loadLiveState() {
    try {
      const states = await firstValueFrom(
        this.edithomeService.getEnvivo().pipe(take(1)),
      );
      const state = states[0];
      this.liveStateId = state?.id ?? null;
      this.isLive = state?.envivo ?? false;
      //console.log('Live transmission state loaded:', this.isLive);
    } catch (err) {
      //console.error('Error loading live transmission state', err);
    }
  }

  // GESTIÓN DE IMÁGENES EN SUPABASE (images/home)

  async loadImages() {
    try {
      this.loading = true;
      // Listamos todas las imágenes dentro de la carpeta 'home' del bucket 'images'
      this.images = await this.supabaseStorage.listFiles('home');
    } catch (err) {
      console.error('Error listing files from Supabase', err);
    } finally {
      this.loading = false;
    }
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Formato incorrecto', 'Por favor selecciona un archivo de imagen (PNG, JPG, etc.)', 'warning');
      event.target.value = '';
      return;
    }

    try {
      this.uploading = true;
      await this.supabaseStorage.uploadFile(file, 'home');
      await this.loadImages();
      Swal.fire({
        icon: 'success',
        title: '¡Imagen subida!',
        text: 'La imagen se guardó exitosamente en Supabase (images/home).',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Error uploading image to Supabase', err);
      Swal.fire('Error', err?.message || 'Fallo al subir imagen a Supabase', 'error');
    } finally {
      this.uploading = false;
      event.target.value = '';
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

  openReplaceDialog(image: any, fileInput: HTMLInputElement) {
    this.imageToReplace = image;
    fileInput.click();
  }

  async onReplaceFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file || !this.imageToReplace) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Formato incorrecto', 'Por favor selecciona un archivo de imagen válido', 'warning');
      event.target.value = '';
      return;
    }

    try {
      this.uploading = true;
      await this.supabaseStorage.replaceFile(this.imageToReplace.path, file, 'home');
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
      Swal.fire('Error', err?.message || 'No se pudo reemplazar la imagen', 'error');
    } finally {
      this.uploading = false;
      event.target.value = '';
    }
  }

  onPreview(image: any) {
    this.selectedImage = image;
    this.popupVisible = true;
  }

  copyImageUrl(url: string) {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      Swal.fire({
        icon: 'success',
        title: '¡Enlace copiado!',
        text: 'La URL pública ha sido copiada al portapapeles.',
        timer: 1300,
        showConfirmButton: false,
      });
    });
  }

  onRowClick(event: any) {
    this.onPreview(event.data);
  }
}
