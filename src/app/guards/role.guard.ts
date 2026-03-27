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
    
    const requiredRoles = route.data['allowedRoles'] as string[];
    
    // console.log('=== RoleGuard ===');
    // console.log('Ruta:', state.url);
    // console.log('Required roles:', requiredRoles);
    // console.log('Tipo de requiredRoles:', typeof requiredRoles, Array.isArray(requiredRoles));
    
    if (!requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0 || (requiredRoles.length === 1 && (requiredRoles[0] === '' || requiredRoles[0] === undefined))) {
      //console.log('Sin roles requeridos - Permitido');
      return true;
    }

    const isLoggedIn = this.authService.isLoggedIn();
    //console.log('Usuario logueado:', isLoggedIn);
    
    if (!isLoggedIn) {
      //console.log('No logueado - Redirigiendo a /login');
      this.router.navigate(['/login']);
      return false;
    }

    const userRoles = this.authService.getUserRoles();
    // console.log('Roles del usuario:', userRoles);
    // console.log('Tipo de userRoles:', typeof userRoles, Array.isArray(userRoles));
    
    // Usar verificación flexible
    const hasAccess = this.authService.hasAnyRoleFlexible(requiredRoles);
    //console.log('Tiene acceso:', hasAccess);
    
    if (hasAccess) {
      //console.log('Acceso concedido');
      return true;
    }

    //console.log('Sin acceso - Redirigiendo a /');
    // Si el usuario acaba de actualizar sus propios roles, evitar redirección inmediata
    if (this.authService.skipNextGuardRedirect) {
      this.authService.skipNextGuardRedirect = false;
      // Aquí puedes mostrar un mensaje, recargar la sesión, o simplemente permitir la navegación
      // Por ejemplo, mostrar un alert:
      alert('Tus permisos han cambiado. Por favor, vuelve a iniciar sesión o recarga la página.');
      return false;
    }
    this.router.navigate(['/']);
    return false;
  }
}
