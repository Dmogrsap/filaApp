import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { SupabaseStorageService } from '../services/supabase-storage.service';
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
  public previewSelected: string | null = null;
  public uploading = false;

  constructor(private firebaseStorage: SupabaseStorageService) {}

  async ngOnInit() {
    await this.loadImages();

    //  try {
    //   const res = await this.supabaseImageService.testConnection();
    //   //console.log('Supabase testConnection OK:', res);
    // } catch (err) {
    //   console.error('Supabase testConnection falló:', err);
    // }
  }

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
}
