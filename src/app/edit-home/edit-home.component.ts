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
  public selectedImage: any;
  public popupVisible = false;

  constructor(private supabaseImageService: SupabaseImageService) {}

  async ngOnInit() {
    await this.loadImages();

     try {
      const res = await this.supabaseImageService.testConnection();
      //console.log('Supabase testConnection OK:', res);
    } catch (err) {
      console.error('Supabase testConnection falló:', err);
    }
    
  }

  async loadImages() {
    try {
      this.loading = true;
      const data = await this.supabaseImageService.listImages();
      this.images = (data || []).map((it: any) => ({
        ...it,
        nombre: it.nombre ?? it.name ?? '',
        url: it.url ?? it.public_url ?? '',
        tipo: it.tipo ?? it.type ?? '',
        created_at: it.created_at ? new Date(it.created_at) : null,
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
      await this.supabaseImageService.uploadAndSave(file);
      await this.loadImages();
      Swal.fire('OK', 'Imagen subida y guardada', 'success');
    } catch (err: any) {
      console.error('Error uploading image', err);
      Swal.fire('Error', err?.message || 'Fallo al subir imagen', 'error');
    } finally {
      this.loading = false;
    }
  }

  onRowClick(event: any) {
    this.selectedImage = event.data;
    this.popupVisible = true;
  }
}
