import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private firestore: Firestore) {}

  async uploadImage(file: File, nombre: string, descripcion: string): Promise<void> {
    const storage = getStorage();
    const storageRef = ref(storage, `imagenes/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Guarda la referencia en Firestore
    const imagenesRef = collection(this.firestore, 'imagenes');
    await addDoc(imagenesRef, {
      nombre,
      url,
      descripcion,
      fecha: new Date()
    });
  }
}
