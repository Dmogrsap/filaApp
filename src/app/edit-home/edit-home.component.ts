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

  public dataSourceMenusTab: any[] = [];

  constructor(
    private firebaseStorage: SupabaseStorageService,
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

  // onSaving(e: { value?: boolean; previousValue?: boolean; promise?: Promise<void> }) {
  //   const estado = e.value ?? false;
  //   const estadoAnterior = e.previousValue ?? !estado;

  //   if (!this.liveStateId) {
  //     this.isLive = estadoAnterior;
  //     Swal.fire('Error', 'No existe una configuración de transmisión', 'error');
  //     return;
  //   }

  //   e.promise = this.edithomeService
  //     .updateEstadoTransmision(this.liveStateId, estado)
  //     .then(() => {
  //       this.isLive = estado;
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Estado actualizado',
  //         showConfirmButton: false,
  //         timer: 1200,
  //       });
  //     })
  //     .catch((err) => {
  //       console.error('Error updating live transmission state', err);
  //       this.isLive = estadoAnterior;
  //       Swal.fire(
  //         'Error',
  //         'No se pudo actualizar el estado de transmisión',
  //         'error',
  //       );
  //       throw err;
  //     });
  // }

  async loadImages() {
    try {
      this.loading = true;
      this.images = await this.firebaseStorage.listFiles('images');
    } catch (err) {
      console.error('Error listing files', err);
    } finally {
      this.loading = false;
    }
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;
    try {
      this.loading = true;
      const { path, url } = await this.firebaseStorage.uploadFile(
        file,
        'images',
      );
      await this.loadImages();
      Swal.fire('OK', 'Imagen subida a Firebase Storage', 'success');
    } catch (err: any) {
      console.error('Error uploading image', err);
      Swal.fire('Error', err?.message || 'Fallo al subir imagen', 'error');
    } finally {
      this.loading = false;
    }
  }

  async onDelete(path: string) {
    try {
      await this.firebaseStorage.deleteFile(path);
      await this.loadImages();
      Swal.fire('OK', 'Archivo eliminado', 'success');
    } catch (err) {
      console.error('Delete error', err);
      Swal.fire('Error', 'No se pudo eliminar', 'error');
    }
  }

  onRowClick(event: any) {
    this.selectedImage = event.data;
    this.popupVisible = true;
  }

  normalizeEnvivo(envivo: any) {
    if (Array.isArray(envivo)) {
      return envivo.filter((item) => typeof item === 'string').join(', ');
    }

    if (typeof envivo === 'object' && envivo !== null) {
      return envivo.Role || envivo.roleName || envivo.name || '';
    }

    return typeof envivo === 'string' ? envivo : '';
  }
  normalizeEnvivoField(data: any) {
    if (!data) {
      return data;
    }

    if (data.Envivo !== undefined) {
      data.Envivo = this.normalizeEnvivo(data.Envivo);
    }

    return data;
  }
}
