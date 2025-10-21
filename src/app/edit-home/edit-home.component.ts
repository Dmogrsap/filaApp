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

    public imageUrls: string[] = [];
  public imagenes$!: Observable<any[]>; // datos para el grid

  constructor(private supabaseImageService: SupabaseImageService) {}

  async ngOnInit() {
    await this.loadImages();
  }

  private async loadImages() {
    try {
      const images = await this.supabaseImageService.listImages(); // debe devolver array de objetos { name, path, url, description, created_at }
      // llena imageUrls para la previsualización simple
      this.imageUrls = images.map(img => img.url ?? img.public_url ?? img.path ?? '');
      // expone un Observable para el dx-data-grid
      this.imagenes$ = from(Promise.resolve(images));
    } catch (err) {
      console.error('Error cargando imágenes:', err);
    }
  }

  async onFileSelected(event: any) {
    const file: File | undefined = event.target.files?.[0];
    if (!file) return;
    try {
      // uploadAndSave debe subir al bucket y guardar metadatos en la tabla; devolver metadata o url
      await this.supabaseImageService.uploadAndSave(file, file.name);
      await this.loadImages(); // recargar lista tras subir
      Swal.fire('OK', 'Imagen subida y guardada', 'success');
    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      Swal.fire('Error', err?.message || 'Fallo al subir imagen', 'error');
    }
  }
}


