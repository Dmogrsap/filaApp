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
  
async uploadAndSave(file: File, description = '') {
    try {
      const filePath = `${Date.now()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // getPublicUrl no devuelve (data, error). Obtener la URL así:
      const publicResult: any = this.supabase.storage.from('images').getPublicUrl(filePath);
      // dependiendo de la versión puede estar en publicResult.data.publicUrl o publicResult.publicUrl
      const publicUrl = publicResult?.data?.publicUrl ?? publicResult?.publicUrl ?? '';

      const { data, error } = await this.supabase
        .from('images')
        .insert([{
          name: file.name,
          path: filePath,
          url: publicUrl,
          description,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { row: data, url: publicUrl };
    } catch (err) {
      console.error('Supabase uploadAndSave error:', err);
      throw err;
    }
  }

  async listImages() {
    try {
      const { data, error } = await this.supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Supabase listImages error:', err);
      throw err;
    }
  }

  getPublicUrl(path: string) {
    try {
      const result: any = this.supabase.storage.from('images').getPublicUrl(path);
      return result?.data?.publicUrl ?? result?.publicUrl ?? null;
    } catch (err) {
      console.error('getPublicUrl error:', err);
      return null;
    }
  }
}