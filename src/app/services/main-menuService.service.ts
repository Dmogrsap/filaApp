import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable, switchMap, map, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { IMenu } from '../Interfaces/IMenu';
import { IAccesses } from '../Interfaces/IAccesses';
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
  providedIn: 'root'
})
export class MainMenuService {

  public _refresh$ = new Subject<void>();
  // private apiUrl = environment.baseUrl;

  constructor(private http: HttpClient, private firestore: Firestore) { }

  getMenus(): Observable<any[]> {
    const menusRefRef = collection(this.firestore, 'Menus');
    return collectionData(menusRefRef, { idField: 'id' });
  }

  getMenusWithSubmenus(): Observable<any[]> {
    const menusRef = collection(this.firestore, 'Menus');
    return collectionData(menusRef, { idField: 'id' }).pipe(
      switchMap((menus: any[]) => {
        const menuWithSubs$ = menus.map(menu => {
          const submenusRef = collection(this.firestore, `Menus/${menu.id}/Submenus`);
          return collectionData(submenusRef, { idField: 'id' }).pipe(
            map(submenus => ({ menu, submenus }))
          );
        });
        return forkJoin(menuWithSubs$);
      })
    );
  }


  // getCurrentUser(): Observable<any>{
  //   return this.http.get<any>(`${this.apiUrl}/CurrentUser`,{ withCredentials: true });
  // }
  
  // getCurrentUser(): Observable<any>{
  //   return this.http.get<any>(`${this.apiUrl}/CurrentUser`,{ withCredentials: true });
  // }
  
  // getEmployeesByBadge(badge:string){
  //   return this.http.get<any>(`${this.apiUrl}/CrossBadgeEmpleado/GetBadge?badge=${badge}`, { withCredentials: true });
  // }

  // getMenu(): Observable<any>{
  //   return this.http.get<any>(`${this.apiUrl}/Menu/Get`, { withCredentials: true });
  // }

  // getAccesses(): Observable<any>{
  //   return this.http.get<any>(`${this.apiUrl}/Accesses/Get`, { withCredentials: true });
  // }

  // getMenusSubmenus( role: number): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}/Menu/GetRole?role=${role}`, { withCredentials: true });
  // }

  // putMenu(id: number, menu: IMenu ) {
  //   return this.http.put<IMenu>(`${this.apiUrl}/Menu/${id}`, menu,{ withCredentials: true });
  // }

  // postMenu(menu: IMenu ) {
  //   return this.http.post<IMenu>(`${this.apiUrl}/Menu`, menu,{ withCredentials: true });
  // }

  // deleteMenu(id: number) {
  //   return this.http.delete<IMenu>(`${this.apiUrl}/Menu/${id}`, { withCredentials: true });
  // }

  // getAccessesRoles(idRole: number): Observable<IAccesses[]> {
  //   return this.http.get<IAccesses[]>(`${this.apiUrl}/Menu/GetGroup?role=${idRole}`,{ withCredentials: true });
  // }

  // getMenusViewsBySection(idRole: number): Observable<IMenu[]> {
  //   return this.http.get<IMenu[]>(`${this.apiUrl}/Menu/GetSection?role=${idRole}`,{ withCredentials: true });
  // }

  // getAccessesRole(idRole: number): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}/Menu/GetGroup?role=${idRole}`, { withCredentials: true });
  // }

}
