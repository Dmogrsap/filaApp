import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from '@angular/fire/firestore';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(private firestore: Firestore) {
    bucket: 'coffee';
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: { persistSession: false, detectSessionInUrl: false },
      },
    );
    this.bucket = environment.supabaseBucket ?? 'coffee';
    this.bucket = environment.supabaseBucket ?? 'images';
  }

  private sanitizeName(name: string) {
    return name.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 200);
  }

  async uploadFile(
    file: File,
    folder = 'coffee',
  ): Promise<{ path: string; url: string }> {
    const filename = `${Date.now()}_${this.sanitizeName(file.name)}`;
    const path = `${folder}/${filename}`;
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
      if (error) throw error;

      const publicRes: any = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(path);
      const url = publicRes?.data?.publicUrl ?? publicRes?.publicUrl ?? '';

      await addDoc(collection(this.firestore, 'imagenes'), {
        bucket: this.bucket,
        folder,
        name: file.name,
        path,
        url,
        contentType: file.type,
        size: file.size,
        createdAt: serverTimestamp(),
      });

      console.log('Supabase upload ok', { path, url });
      return { path, url };
    } catch (err) {
      console.error('Supabase uploadFile error', err);
      throw err;
    }
  }

  async listFiles(
    prefix = 'coffee',
  ): Promise<
    { path: string; url: string; name?: string; created_at?: string | null }[]
  > {
    try {
      // list objects under prefix
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .list(prefix, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'desc' },
        });
      if (error) throw error;

      const items = await Promise.all(
        (data || []).map(async (it: any) => {
          const fullPath = `${prefix}/${it.name}`;
          const publicRes: any = this.supabase.storage
            .from(this.bucket)
            .getPublicUrl(fullPath);
          const url = publicRes?.data?.publicUrl ?? publicRes?.publicUrl ?? '';
          return {
            path: fullPath,
            url,
            name: it.name,
            created_at: it.updated_at ?? null,
          };
        }),
      );
      return items;
    } catch (err) {
      console.error('Supabase listFiles error', err);
      throw err;
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .remove([path]);
      if (error) throw error;

      const imagesQuery = query(
        collection(this.firestore, 'imagenes'),
        where('path', '==', path),
      );
      const imageDocuments = await getDocs(imagesQuery);
      await Promise.all(imageDocuments.docs.map((imageDocument) => deleteDoc(imageDocument.ref)));

      console.log('Supabase delete ok', data);
    } catch (err) {
      console.error('Supabase deleteFile error', err);
      throw err;
    }
  }

  async replaceFile(
    oldPath: string,
    newFile: File,
    folder = 'home',
  ): Promise<{ path: string; url: string }> {
    try {
      if (oldPath) {
        await this.deleteFile(oldPath);
      }
      return await this.uploadFile(newFile, folder);
    } catch (err) {
      console.error('Supabase replaceFile error', err);
      throw err;
    }
  }

}
