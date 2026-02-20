import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
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
  getDoc
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

  // Nuevo método para obtener un rol específico por su idRole
  getRoleById(idRole: number): Observable<any> {
    const rolesRef = collection(this.firestore, 'Roles');
    return collectionData(rolesRef, { idField: 'id' }).pipe(
      map(roles => roles.find((role: any) => role.idRole === idRole))
    );
  }

  // Nuevo método para obtener el nombre del rol por idRole (síncrono con map)
  getRoleNameById(idRole: number): Observable<string> {
    return this.getRoleById(idRole).pipe(
      map(role => role ? role.roleName : 'Unknown')
    );
  }

  addRoles(user: any): Promise<any> {
    const usersRef = collection(this.firestore, 'Roles');
    return addDoc(usersRef, user);
  }

  updateRoles(id: string, user: any): Promise<void> {
    const userRef = doc(this.firestore, 'Roles', id);
    return updateDoc(userRef, user);
  }

  deleteRoles(id: string): Promise<void> {
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
