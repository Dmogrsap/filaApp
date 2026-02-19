import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private isLogedSource = new BehaviorSubject<boolean>(false);
  private userRoleSource = new BehaviorSubject<number | null>(null);
  private userNameSource = new BehaviorSubject<string | null>(null);
  
  // Este es el observable al que se suscribirá el MainMenu
  isLoged$ = this.isLogedSource.asObservable();
  userRole$ = this.userRoleSource.asObservable();
  userName$ = this.userNameSource.asObservable();

  // Método para cambiar el valor desde el Login
  setLoginStatus(status: boolean) {
    this.isLogedSource.next(status);
  }

  // Método para establecer el rol del usuario
  setUserRole(roleId: number) {
    this.userRoleSource.next(roleId);
  }

  // Método para establecer el nombre del usuario
  setUserName(name: string) {
    this.userNameSource.next(name);
  }

  // Método para obtener el rol actual
  getUserRole(): number | null {
    return this.userRoleSource.value;
  }

  // Método para obtener el estado de login
  isLoggedIn(): boolean {
    return this.isLogedSource.value;
  }

  // Método para limpiar los datos al hacer logout
  logout() {
    this.isLogedSource.next(false);
    this.userRoleSource.next(null);
    this.userNameSource.next(null);
  }

  constructor() { }
}
