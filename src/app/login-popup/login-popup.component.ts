import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular';
import { DxFormModule, DxFormTypes } from 'devextreme-angular/ui/form';
import { UsersService } from '../services/usersService.service';
import { AuthServiceService } from '../services/auth-service.service';
import { RolesService } from '../services/rolesService.service';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.css'],
})
export class LoginPopupComponent {
  @ViewChild(DxFormComponent, { static: false }) form:
    | DxFormComponent
    | undefined;

  customer = { name: '', Password: '' };
  @Output() login = new EventEmitter<{ username: string; password: string }>();
  @Output() close = new EventEmitter<void>();
  
  showPassword: boolean = false;

  public datasourceusers: any[] = [];
  public isLoged: boolean = false;

  emailEditorOptions = {
    mode: 'name',
  };

  passwordEditorOptions = {
    mode: 'password',
  };
  TextEditorOptions: any;

  constructor(
    private router: Router,
    private userService: UsersService,
    private AuthService: AuthServiceService,
    private rolesService: RolesService,
  ) {}

  onFormSubmit(e: any) {
    this.login.emit({
      username: this.customer.name,
      password: this.customer.Password,
    });
    e.preventDefault();
  }

  public iniciar() {
    this.userService.getUsers().subscribe((result) => {
      this.datasourceusers = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      
      for (let i = 0; i < this.datasourceusers.length; i++) {
        const user = this.datasourceusers[i];
        
        if (
          user.Nombre === this.customer.name &&
          user.Password == this.customer.Password
        ) {
          console.log('Usuario encontrado:', user);
          this.loginUser(user);
          return;
        } else {
          if (i === this.datasourceusers.length - 1) {
            Swal.fire({
              icon: 'error',
              title: 'Sorry!!!',
              text: 'User not found',
              draggable: true,
              width: 600,
            });
            this.AuthService.setLoginStatus(false);
          }
        }
      }
    });
  }

  private loginUser(user: any): void {
    console.log('Procesando login para usuario:', user);
    console.log('Campo Role:', user.Role);
    console.log('Tipo de Role:', typeof user.Role);
    
    // Establecer estado de login
    this.AuthService.setLoginStatus(true);
    this.AuthService.setUserName(this.customer.name);
    
    // Procesar el rol del usuario
    let roleNames: string[] = [];
    
    // El campo es "Role" según lo que me indicaste
    if (user.Role) {
      if (typeof user.Role === 'string') {
        // Es un string, puede ser "Admin" o "Admin, Lider"
        roleNames = user.Role.split(',').map((r: string) => r.trim()).filter((r: string) => r);
        console.log('Role como string dividido:', roleNames);
      } else if (Array.isArray(user.Role)) {
        // Es un array
        roleNames = user.Role.filter((r: any) => typeof r === 'string');
        console.log('Role como array:', roleNames);
      } else if (typeof user.Role === 'object') {
        // Es un objeto, puede tener roleName
        roleNames = [user.Role.roleName || user.Role.name || user.Role.Nombre].filter((r: any) => r);
        console.log('Role como objeto:', roleNames);
      }
    }
    
    console.log('Roles a guardar:', roleNames);
    
    if (roleNames.length > 0) {
      this.AuthService.setUserRoles(roleNames);
      console.log('AuthService.setUserRoles llamado con:', roleNames);
      console.log('Roles guardados en AuthService:', this.AuthService.getUserRoles());
      
      Swal.fire({
        icon: 'success',
        title: 'Login!!!',
        text: 'User Logged: ' + roleNames.join(', '),
        draggable: true,
        width: 600,
      });
    } else {
      console.warn('No se encontró ningún rol para el usuario');
      
      Swal.fire({
        icon: 'success',
        title: 'Login!!!',
        text: 'User Logged (Sin roles)',
        draggable: true,
        width: 600,
      });
    }
    
    // Verificar que se guardó
    console.log('Verificación - Roles actuales en AuthService:', this.AuthService.getUserRoles());
    
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }

  onOptionChanged(e: any) {}

  asyncValidation(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(params.value !== 'test@example.com');
      }, 1000);
    });
  }

  onClose() {
    this.close.emit();
  }

  onExit() {
    this.close.emit();
    this.router.navigate(['/']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
