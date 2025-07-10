import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable, debounceTime } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { IResultObject } from '../Interfaces/IResultObject';
import { IResultObjectEmployees } from '../Interfaces/IResultObjectEmployees';
import { IUser } from '../Interfaces/IUser';
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
export class UsersService {
  public _refresh$ = new Subject<void>();
  // private apiUrl = environment.baseUrl;
  private apiUrlFire = environment.firebase;

  constructor(private http: HttpClient, private firestore: Firestore) {}

  getUsers(): Observable<any[]> {
    const usersRef = collection(this.firestore, 'Usuarios');
    return collectionData(usersRef, { idField: 'id' });
  }

  addUser(user: any): Promise<any> {
    const usersRef = collection(this.firestore, 'Usuarios');
    return addDoc(usersRef, user);
  }

  updateUser(id: string, user: any): Promise<void> {
  const userRef = doc(this.firestore, 'Usuarios', id);
  return updateDoc(userRef, user);
}

  deleteUser(id: string): Promise<void> {
    const userRef = doc(this.firestore, 'Usuarios', id);
    return deleteDoc(userRef);
  }

  getRefresh$() {
    this._refresh$;
  }

  // getUsers(): Observable<IResultObject[]> {
  //   return this.http.get<IResultObject[]>(`${this.apiUrl}/Users/GetUser`, { withCredentials: true }).pipe(debounceTime(1000));
  // }

  // searchUser(user: string) {
  //   return this.http.get<IResultObject>(`${this.apiUrl}/Users/GetUser${user}`, { withCredentials: true });
  // }

  // postUser(user: IUser) {
  //   return this.http.post(`${this.apiUrl}/Users`, user, { withCredentials: true });
  // }

  // putUser(id: number, user: IUser) {
  //   return this.http.put(`${this.apiUrl}/Users/${id}`, user, { withCredentials: true });
  // }

  // deleteUser(id: number) {
  //   return this.http.delete(`${this.apiUrl}/Users/${id}`, { withCredentials: true });
  // }

  // getEmployeesByBadge(badge:string){
  //   return this.http.get<any>(`${this.apiUrl}/CrossBadgeEmpleado/GetBadge?badge=${badge}`, { withCredentials: true });
  // }

  // getEmployees(): Observable<IResultObjectEmployees[]>{
  //   return this.http.get<IResultObjectEmployees[]>(`${this.apiUrl}/CrossBadgeEmpleado/Get`, { withCredentials: true });
  // }

  // getCurrentUser(): Observable<any>{
  //   return this.http.get<any>(`${this.apiUrl}/CurrentUser`,{ withCredentials: true });
  // }

  // getUserFull(): Observable<any[]>{
  //   return this.http.get<any[]>(`${this.apiUrl}/CrossBadgeEmpleado/GetBadgeList`,{ withCredentials: true });
  // }
}
