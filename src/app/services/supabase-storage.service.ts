import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: { persistSession: false, detectSessionInUrl: false },
    });
    this.bucket = environment.supabaseBucket ?? 'images';
  }

  private sanitizeName(name: string) {
    return name.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 200);
  }

  async uploadFile(file: File, folder = 'images'): Promise<{ path: string; url: string }> {
    const filename = `${Date.now()}_${this.sanitizeName(file.name)}`;
    const path = `${folder}/${filename}`;
    try {
      const { data, error } = await this.supabase.storage.from(this.bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;

      const publicRes: any = this.supabase.storage.from(this.bucket).getPublicUrl(path);
      const url = publicRes?.data?.publicUrl ?? publicRes?.publicUrl ?? '';
      console.log('Supabase upload ok', { path, url });
      return { path, url };
    } catch (err) {
      console.error('Supabase uploadFile error', err);
      throw err;
    }
  }

  async listFiles(prefix = 'images'): Promise<{ path: string; url: string; name?: string; created_at?: string | null }[]> {
    try {
      // list objects under prefix
      const { data, error } = await this.supabase.storage.from(this.bucket).list(prefix, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' },
      });
      if (error) throw error;

      const items = await Promise.all(
        (data || []).map(async (it: any) => {
          const fullPath = `${prefix}/${it.name}`;
          const publicRes: any = this.supabase.storage.from(this.bucket).getPublicUrl(fullPath);
          const url = publicRes?.data?.publicUrl ?? publicRes?.publicUrl ?? '';
          return { path: fullPath, url, name: it.name, created_at: it.updated_at ?? null };
        })
      );
      return items;
    } catch (err) {
      console.error('Supabase listFiles error', err);
      throw err;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.storage.from(this.bucket).remove([path]);
      if (error) throw error;
      console.log('Supabase delete ok', data);
    } catch (err) {
      console.error('Supabase deleteFile error', err);
      throw err;
    }
  }
}
