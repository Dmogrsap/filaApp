import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EdithomeService {
  public _refresh$ = new Subject<void>();
  // private apiUrl = environment.baseUrl;
  private apiUrlFire = environment.firebase;

  constructor(private firestore: Firestore) {}

  getEnvivo(): Observable<any[]> {
    const usersRef = collection(this.firestore, 'Transmisionenvivo');
    return collectionData(usersRef, { idField: 'id' });
  }

  updateEnvivo(id: string, transmisionenvivo: any): Promise<void> {
    const transmisionRef = doc(this.firestore, 'Transmisionenvivo', id);
    return updateDoc(transmisionRef, transmisionenvivo);
  }

  getimageshome(): Observable<any[]> {
    const usersRef = collection(this.firestore, 'imagenes');
    return collectionData(usersRef, { idField: 'id' });
  }

}
