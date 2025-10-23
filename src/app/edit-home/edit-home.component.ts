import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { SupabaseImageService } from '../services/image.service';
import { async, from, Observable } from 'rxjs';
import { collectionData, collection, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-edit-home',
  templateUrl: './edit-home.component.html',
  styleUrls: ['./edit-home.component.css'],
})
export class EditHomeComponent {
  public images: any[] = [];
  public loading = false;

  constructor(private supabaseImageService: SupabaseImageService) {}

  async ngOnInit() {
    await this.loadImages();
  }

  async loadImages() {
    try {
      this.loading = true;
      const data = await this.supabaseImageService.listImages();
      // normaliza campos esperados por el grid
      this.images = (data || []).map((it: any) => ({
        ...it,
        name: it.name ?? it.nombre ?? '',
        url: it.url ?? it.public_url ?? it.path ?? '',
        description: it.description ?? it.descripcion ?? '',
        created_at: it.created_at
          ? new Date(it.created_at)
          : it.fecha
          ? new Date(it.fecha)
          : null,
      }));
    } catch (err) {
      console.error('Error loading images', err);
    } finally {
      this.loading = false;
    }
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;
    try {
      this.loading = true;
      await this.supabaseImageService.uploadAndSave(file, '');
      await this.loadImages();
      Swal.fire('OK', 'Imagen subida y guardada', 'success');
    } catch (err: any) {
      console.error('Error uploading image', err);
      Swal.fire('Error', err?.message || 'Fallo al subir imagen', 'error');
    } finally {
      this.loading = false;
    }
  }
}
