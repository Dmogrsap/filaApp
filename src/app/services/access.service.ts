import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  updateDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AccessService {
  public _refresh$ = new Subject<void>();

  constructor(private http: HttpClient, private firestore: Firestore) {}

  getRefresh$() {
    this._refresh$;
  }

  getMenus(): Observable<any[]> {
    const usersRef = collection(this.firestore, 'Menus');
    return collectionData(usersRef, { idField: 'id' });
  }

  getsubMenus(): Observable<any[]> {
    const menusRefRef = collection(this.firestore, 'submenus');
    return collectionData(menusRefRef, { idField: 'id' });
  }
}
