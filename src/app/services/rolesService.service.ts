import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { IResultObjectRoles } from '../Interfaces/IResultObjectRoles';
import { IRoles } from '../Interfaces/IRoles';
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
export class RolesService {
  public _refresh$ = new Subject<void>();
  // private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient, private firestore: Firestore) {}

  getRefresh$() {
    this._refresh$;
  }

  getRoles(): Observable<any[]> {
    const usersRef = collection(this.firestore, 'Roles');
    return collectionData(usersRef, { idField: 'id' });
  }

  addRoles(user: any): Promise<any> {
    const usersRef = collection(this.firestore, 'Roles');
    return addDoc(usersRef, user);
  }

  updateRoles(id: string, user: any): Promise<void> {
    const userRef = doc(this.firestore, 'Roles', id);
    return updateDoc(userRef, user);
  }

  deleteUser(id: string): Promise<void> {
    const userRef = doc(this.firestore, 'Roles', id);
    return deleteDoc(userRef);
  }

  // getRoles(): Observable<IResultObjectRoles[]> {
  //   return this.http.get<IResultObjectRoles[]>(`${this.apiUrl}/Role/Get`, { withCredentials: true });
  // }

  // getRolesActivate(): Observable<IResultObjectRoles> {
  //   return this.http.get<IResultObjectRoles>(`${this.apiUrl}/Role/RolesActivate`, { withCredentials: true });
  // }

  // postRol(rol: IRoles) {
  //   return this.http.post<IRoles>(`${this.apiUrl}/Role`, rol , { withCredentials: true });
  // }

  // putRol(id: number, rol: IRoles) {
  //   return this.http.put<IRoles>(`${this.apiUrl}/Role/${id}`, rol, { withCredentials: true });
  // }

  // deleteRol(id: number) {
  //   return this.http.delete<IRoles>(`${this.apiUrl}/Role/${id}`, { withCredentials: true });
  // }
}
