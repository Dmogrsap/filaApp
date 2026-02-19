import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthServiceService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Obtener los roles requeridos de la ruta
    const requiredRoles = route.data['allowedRoles'] as number[];
    
    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener el rol del usuario actual
    const userRole = this.authService.getUserRole();

    // Verificar si el usuario está logueado
    if (!this.authService.isLoggedIn()) {
      // Redirigir al login si no está logueado
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar si el usuario tiene el rol requerido
    if (userRole !== null && requiredRoles.includes(userRole)) {
      return true;
    }

    // Si no tiene el rol requerido, redirigir a una página de acceso denegado
    // o volver al inicio
    this.router.navigate(['/']);
    return false;
  }
}
