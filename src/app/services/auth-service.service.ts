import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private isLogedSource = new BehaviorSubject<boolean>(false);
  private userRolesSource = new BehaviorSubject<string[]>([]);
  private userNameSource = new BehaviorSubject<string | null>(null);
  private userIdRoleSource = new BehaviorSubject<number | null>(null);
  private userIdRolesSource = new BehaviorSubject<number[]>([]);
  
  isLoged$ = this.isLogedSource.asObservable();
  userRoles$ = this.userRolesSource.asObservable();
  userName$ = this.userNameSource.asObservable();
  userIdRole$ = this.userIdRoleSource.asObservable();
  userIdRoles$ = this.userIdRolesSource.asObservable();

  setLoginStatus(status: boolean) {
    this.isLogedSource.next(status);
  }

  setUserRoles(roleNames: string[]) {
    // Filtrar solo strings válidas
    const validRoles = roleNames.filter(role => typeof role === 'string' && role.trim() !== '');
    this.userRolesSource.next(validRoles);
  }

  setUserRole(roleName: string) {
    if (typeof roleName === 'string') {
      this.userRolesSource.next([roleName]);
    } else {
      this.userRolesSource.next([]);
    }
  }

  setUserIdRole(idRole: number) {
    this.userIdRoleSource.next(idRole);
  }

  setUserIdRoles(idRoles: number[]) {
    this.userIdRolesSource.next(idRoles);
  }

  setUserName(name: string) {
    this.userNameSource.next(name);
  }

  getUserRoles(): string[] {
    return this.userRolesSource.value || [];
  }

  getUserRole(): string | null {
    const roles = this.userRolesSource.value;
    return roles && roles.length > 0 ? roles[0] : null;
  }

  getUserIdRoles(): number[] {
    return this.userIdRolesSource.value || [];
  }

  getUserIdRole(): number | null {
    return this.userIdRoleSource.value;
  }

  hasRole(roleName: string): boolean {
    const userRoles = this.getUserRoles();
    return userRoles.includes(roleName);
  }

  hasAnyRole(roleNames: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roleNames.some(role => userRoles.includes(role));
  }

  // Verificación flexible: coincide si el rol del usuario contiene el rol requerido o viceversa
  hasAnyRoleFlexible(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    
    // Si no hay roles de usuario, retornar false
    if (!userRoles || userRoles.length === 0) {
      console.log('No hay roles de usuario');
      return false;
    }
    
    for (const requiredRole of requiredRoles) {
      if (!requiredRole || typeof requiredRole !== 'string') continue;
      
      for (const userRole of userRoles) {
        if (!userRole || typeof userRole !== 'string') continue;
        
        const userRoleLower = userRole.toLowerCase().trim();
        const requiredRoleLower = requiredRole.toLowerCase().trim();
        
        if (userRoleLower === requiredRoleLower || 
            userRoleLower.includes(requiredRoleLower) ||
            requiredRoleLower.includes(userRoleLower)) {
          console.log('Coincidencia encontrada:', userRole, 'contiene', requiredRole);
          return true;
        }
      }
    }
    return false;
  }

  isLoggedIn(): boolean {
    return this.isLogedSource.value;
  }

  logout() {
    this.isLogedSource.next(false);
    this.userRolesSource.next([]);
    this.userNameSource.next(null);
    this.userIdRoleSource.next(null);
    this.userIdRolesSource.next([]);
  }

  constructor() { }
}
