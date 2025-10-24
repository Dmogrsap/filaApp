import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
//import { environment } from 'src/environments/environment.development';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseImageService {
  private supabase: SupabaseClient;
  private bucket = environment.supabaseBucket ?? 'images'; // usar env, fallback 'images'
  private table = environment.supabaseTable ?? 'images'; // usar env, fallback 'images'
  
  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: { persistSession: false, detectSessionInUrl: false },
      }
    );
    (
      // debug rápido: listar buckets y mostrar env para verificar que estás en el proyecto correcto
      (+this.debugListBuckets().catch((err) =>
        console.error('debugListBuckets error:', err)
      ))
    );
  }

    async testConnection() {
    try {
      const tableRes = await this.supabase.from(this.table).select('*').limit(1);
      console.log('testConnection table result:', tableRes);

      // listar buckets (si tu versión de supabase-js lo soporta)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anySupabase: any = this.supabase as any;
      if (anySupabase.storage && typeof anySupabase.storage.listBuckets === 'function') {
        const listRes = await anySupabase.storage.listBuckets();
        console.log('Buckets visible:', listRes);
      } else {
        // fallback: intentar endpoint REST v1/bucket
        console.warn('listBuckets no disponible, usa curl o fetch contra /storage/v1/bucket para verificar buckets');
      }

      return tableRes;
    } catch (err) {
      console.error('testConnection error:', err);
      throw err;
    }
  }

  private async debugListBuckets() {
    console.log('Supabase URL:', environment.supabaseUrl);
    console.log('Supabase Bucket (expected):', this.bucket);
    // intenta listar buckets accesibles con la clave actual
    try {
      // supabase-js v2: storage.listBuckets()
      // si tu versión no tiene listBuckets, esto fallará y lo verás en la consola
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anySupabase: any = this.supabase as any;
      if (
        anySupabase.storage &&
        typeof anySupabase.storage.listBuckets === 'function'
      ) {
        const { data, error } = await anySupabase.storage.listBuckets();
        console.log('Buckets visible to current key:', data, 'error:', error);
      } else {
        console.warn(
          'listBuckets not available in this supabase-js version; try fetch to /storage/v1/bucket'
        );
      }
    } catch (err) {
      console.error(
        'Failed to list buckets (likely wrong project or key):',
        err
      );
    }
  }

  private safeFilename(name: string) {
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    const base = name.replace(/\.[^/.]+$/, '');
    const safe = base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
    return `${safe}${ext}`;
  }

  async listImages(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.table) // asegúrate this.table === 'images'
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase listImages error:', error);
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error('listImages failed:', err);
      throw err;
    }
  }

  async uploadAndSave(file: File) {
    const filename = this.safeFilename(file.name);
    const filePath = `${Date.now()}_${filename}`;

    try {
      const { data: uploadData, error: uploadError } =
        await this.supabase.storage
          .from(this.bucket)
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      const publicResult: any = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);
      const publicUrl =
        publicResult?.data?.publicUrl ?? publicResult?.publicUrl ?? '';

      // INSERT guardando también 'path' (necesario para eliminar en Storage)
      const { data, error } = await this.supabase.from(this.table).insert([
        {
          nombre: file.name,
          url: publicUrl,
          tipo: file.type || '',
          path: filePath, // <-- nuevo campo guardado
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw error;
      }
      return { row: data, url: publicUrl };
    } catch (err) {
      console.error('uploadAndSave failed:', err);
      throw err;
    }
  }

  // actualizar metadatos (nombre, tipo, url opcional)
  async updateImage(
    id: string,
    changes: { nombre?: string; tipo?: string; url?: string; path?: string }
  ) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update(changes)
      .eq('id', id)
      .select(); // devuelve la fila actualizada

    if (error) {
      console.error('updateImage error:', error);
      throw error;
    }
    return data;
  }

  // eliminar: borrar archivo en Storage (si existe path) y luego fila en la tabla
  async deleteImage(id: string) {
    // obtener path guardado
    const { data: rows, error: selectErr } = await this.supabase
      .from(this.table)
      .select('path')
      .eq('id', id)
      .limit(1)
      .single();

    if (selectErr) {
      console.error('deleteImage select error:', selectErr);
      throw selectErr;
    }

    const filePath = (rows as any)?.path;
    if (filePath) {
      const { error: removeErr } = await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);
      if (removeErr) {
        console.error('Storage remove error:', removeErr);
        // no abortar automáticamente; opcional: throw removeErr;
        throw removeErr;
      }
    }

    const { data, error } = await this.supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteImage db error:', error);
      throw error;
    }
    return data;
  }
}
