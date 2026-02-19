import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular';
import { DxFormModule, DxFormTypes } from 'devextreme-angular/ui/form';
import { UsersService } from '../services/usersService.service';
import { AuthServiceService } from '../services/auth-service.service';
import Swal from 'sweetalert2';

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
  
  // Password visibility toggle
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
  ) {}

  onFormSubmit(e: any) {
    this.login.emit({
      username: this.customer.name,
      password: this.customer.Password,
    });
    e.preventDefault();
    console.log(
      'this.customer name: ',
      this.customer.name,
      'this.customer password: ',
      this.customer.Password,
    );
  }

  public iniciar() {
    this.userService.getUsers().subscribe((result) => {
      this.datasourceusers = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      //console.log('Datasource:', this.datasourceusers);
      //this.loadIndicatorVisible = false;
      for (let i = 0; i < this.datasourceusers.length; i++) {
        if (
          this.datasourceusers[i].Nombre === this.customer.name &&
          this.datasourceusers[i].Password == this.customer.Password
        ) {
          //console.log('Usuario encontrado:', this.datasourceusers[i]);
          this.isLoged = true;
          this.AuthService.setLoginStatus(true); // Cambia a true
          // console.log(
          //   'Usuario encontrado:',
          //   this.datasourceusers[i],
          //   'esta logueado?: ',
          //   this.isLoged,
          // );
          // Aquí puedes agregar la lógica para redirigir al usuario o mostrar un mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Login!!!',
            text: 'User Logged',
            draggable: true,
            width: 600,
          });

          this.onClose();
          return; // Salir del bucle una vez que se encuentra el usuario
          
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Sorry!!!',
            text: 'User not found',
            draggable: true,
            width: 600,

            // imageAlt: 'Custom image',
          });
          this.AuthService.setLoginStatus(false);
          this.onClose();
        }
      }

      // this.router.navigate(['/']);
    });

    this.onClose();
  }

  onOptionChanged(e: any) {
    // Handle option changes if needed
  }

  asyncValidation(params: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(params.value !== 'test@example.com'); // Example async validation
      }, 1000);
    });
  }

  // onLogin(){
  //   this.router.navigate(['\login']);
  // }

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
