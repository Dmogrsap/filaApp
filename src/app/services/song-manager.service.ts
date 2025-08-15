import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongManagerService {

  constructor(private firestore: Firestore) { }

  getSongs(): Observable<any[]> {
      const songsRef = collection(this.firestore, 'Letras');
      return collectionData(songsRef, { idField: 'id' });
    }

  addSongs(user: any): Promise<any> {
      const songsRef = collection(this.firestore, 'Letras');
      return addDoc(songsRef, user);
    }
  
  updateSongs(id: string, user: any): Promise<void> {
      const songsRef = doc(this.firestore, 'Letras', id);
      return updateDoc(songsRef, user);
    }
  
  deleteSongs(id: string): Promise<void> {
      const songsRef = doc(this.firestore, 'Letras', id);
      return deleteDoc(songsRef);
    }


}
