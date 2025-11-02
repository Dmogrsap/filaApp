import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { SupabaseImageService } from '../services/image.service';
import { collectionData, collection, Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-edit-home',
  templateUrl: './edit-home.component.html',
  styleUrls: ['./edit-home.component.css'],
})
export class EditHomeComponent implements OnInit {
  public images: any[] = [];
  public loading = false;

  public uploading = false;
  public previewSelected: string | null = null;

  constructor(private supabaseImageService: SupabaseImageService) {}

  async ngOnInit() {
    await this.loadImages();
    //  try {
    //   const res = await this.supabaseImageService.testConnection();
    //   console.log('Supabase testConnection OK:', res);
    // } catch (err) {
    //   console.error('Supabase testConnection falló:', err);
    // }
  }

  async loadImages() {
    try {
      this.loading = true;
      const data = await this.supabaseImageService.listImages();
      this.images = (data || []).map((it: any) => ({
        ...it,
        nombre: it.nombre ?? it.name ?? '',
        url: it.url, // Ya no usa ?? it.public_url ?? ''
        tipo: it.tipo ?? it.type ?? '',
        created_at: it.created_at ? new Date(it.created_at) : null,
      }));

      console.log('Datos cargados de Supabase:', this.images); // <--- AÑADE ESTO
    } catch (err) {
      console.error('Error loading images', err);
    } finally {
      this.loading = false;
    }
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;

    // vista previa local inmediata
    const reader = new FileReader();
    reader.onload = () => {
      this.previewSelected =
        typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);

    try {
      this.uploading = true;
      await this.supabaseImageService.uploadAndSave(file);
      await this.loadImages(); // refresca la lista con la imagen subida
      Swal.fire('OK', 'Imagen subida y guardada', 'success');
      // limpia input y preview tras subir
      (event.target as HTMLInputElement).value = '';
      setTimeout(() => (this.previewSelected = null), 2000);
    } catch (err: any) {
      console.error('Error uploading image', err);
      Swal.fire('Error', err?.message || 'Fallo al subir imagen', 'error');
    } finally {
      this.uploading = false;
      this.loading = false;
    }
  }
}
