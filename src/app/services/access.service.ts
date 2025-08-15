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
    const menusRef = collection(this.firestore, 'Menus');
    return collectionData(menusRef, { idField: 'id' });
  }

  getsubMenus(): Observable<any[]> {
    const menusRef = collection(this.firestore, 'submenus');
    return collectionData(menusRef, { idField: 'id' });
  }

  addMenus(user: any): Promise<any> {
    const menusRef = collection(this.firestore, 'Menus');
    return addDoc(menusRef, user);
  }

  addSubMenus(user: any): Promise<any> {
    const menusRef = collection(this.firestore, 'submenus');
    return addDoc(menusRef, user);
  }

  updateMenus(id: string, user: any): Promise<void> {
    const userRef = doc(this.firestore, 'Menus', id);
    return updateDoc(userRef, user);
  }

  updatesubMenus(id: string, user: any): Promise<void> {
    const userRef = doc(this.firestore, 'submenus', id);
    return updateDoc(userRef, user);
  }

  deleteMenus(id: string): Promise<void> {
    const userRef = doc(this.firestore, 'Menus', id);
    return deleteDoc(userRef);
  }

  deletesubMenus(id: string): Promise<void> {
    const userRef = doc(this.firestore, 'submenus', id);
    return deleteDoc(userRef);
  }

}
