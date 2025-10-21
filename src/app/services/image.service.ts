import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SupabaseImageService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // sube al bucket 'images' y guarda metadata en la tabla 'images'
  async uploadAndSave(file: File, descripcion: string = ''): Promise<any> {
    const filePath = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await this.supabase
      .storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // obtener url pública (si el bucket es público)
    const { data: publicData } = this.supabase.storage.from('images').getPublicUrl(filePath);
    const publicUrl = publicData.publicUrl;

    // guardar metadatos en tabla 'images' (ajusta columnas)
    const { data, error } = await this.supabase
      .from('images')
      .insert([{ name: file.name, path: filePath, url: publicUrl, description: descripcion, created_at: new Date() }]);

    if (error) throw error;
    return { storage: uploadData, row: data };
  }

  // listar archivos (metadatos desde la tabla 'images')
  async listImages(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // obtener URL pública si tienes solo path
  getPublicUrl(path: string) {
    return this.supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
  }
}