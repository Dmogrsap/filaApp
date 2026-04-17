import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../services/auth-service.service';
import { UsersService } from '../services/usersService.service';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.css'],
})
export class ChangePassComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UsersService,
    private AuthService: AuthServiceService,
  ) {}

  customer = { name: '', currentPassword: '', newPassword: '', confirmPassword: '' };
  @Output() login = new EventEmitter<{ username: string; password: string }>();
  @Output() close = new EventEmitter<void>();

  public showPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showConfirmPassword: boolean = false;
  public passfounded: boolean = false;
  public datasourceusers: any[] = [];
  public isLoged: boolean = false;
  public nullPassword: boolean = false;
  public isLoading: boolean = false;
  public userExists: boolean = false;
  public userCheckInProgress: boolean = false;
  private currentUserId: string = '';
  private checkUserTimeout: any = null;

  ngOnInit() {
    this.loadCurrentUser();
  }

  /**
   * Carga el usuario actual desde el servicio de autenticación
   */
  private loadCurrentUser() {
    this.AuthService.userName$.subscribe((userName) => {
      if (userName) {
        this.customer.name = userName.split(' ')[0]; // Obtiene el primer nombre
        this.checkUserExists();
      }
    });
  }

  /**
   * Verifica si el usuario existe en la BD (con debounce)
   */
  public onUserNameChange() {
    // Limpiar timeout anterior si existe
    if (this.checkUserTimeout) {
      clearTimeout(this.checkUserTimeout);
    }

    if (!this.customer.name || this.customer.name.trim() === '') {
      this.userExists = false;
      this.userCheckInProgress = false;
      return;
    }

    this.userCheckInProgress = true;

    // Debounce de 500ms para no hacer búsquedas en cada carácter
    this.checkUserTimeout = setTimeout(() => {
      this.checkUserExists();
    }, 500);
  }

  /**
   * Busca si el usuario existe en la BD
   */
  private checkUserExists() {
    this.userService.getUsers().subscribe(
      (result) => {
        this.datasourceusers = result;
        const foundUser = this.datasourceusers.find(
          (user) => user.Nombre.toLowerCase() === this.customer.name.toLowerCase()
        );
        this.userExists = !!foundUser;
        this.nullPassword = foundUser ? !foundUser.Password : false;
        this.userCheckInProgress = false;
      },
      (error) => {
        console.error('Error al verificar usuario:', error);
        this.userExists = false;
        this.nullPassword = false;
        this.userCheckInProgress = false;
      }
    );
  }

  /**
   * Verifica la contraseña actual y cambia la contraseña del usuario
   */
  public CambiarPass() {
    // Validaciones iniciales
    if (!this.customer.name) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa tu usuario',
      });
      return;
    }

    if (!this.userExists) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El usuario ingresado no existe',
      });
      return;
    }

    if (!this.customer.currentPassword && !this.nullPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa tu contraseña actual',
      });
      return;
    }

    if (!this.customer.newPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa la nueva contraseña',
      });
      return;
    }

    if (this.customer.newPassword !== this.customer.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return;
    }

    if (this.customer.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
      return;
    }

    this.isLoading = true;

    // Obtener todos los usuarios
    this.userService.getUsers().subscribe(
      (result) => {
        this.datasourceusers = result;
        const foundUser = this.datasourceusers.find(
          (user) => user.Nombre.toLowerCase() === this.customer.name.toLowerCase()
        );

        if (!foundUser) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Usuario no encontrado',
          });
          this.isLoading = false;
          return;
        }

        this.currentUserId = foundUser.id || '';

        if (!this.currentUserId) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener el ID del usuario',
          });
          this.isLoading = false;
          return;
        }

        const passwordIsValid =
          !foundUser.Password || // Si no tiene contraseña (nula)
          foundUser.Password === this.customer.currentPassword;

        if (!passwordIsValid) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La contraseña actual es incorrecta',
          });
          this.isLoading = false;
          return;
        }

        this.updateUserPassword();
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al procesar la solicitud',
        });
        this.isLoading = false;
      }
    );
  }

  /**
   * Actualiza la contraseña del usuario en la base de datos
   */
  private updateUserPassword() {
    if (!this.currentUserId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'ID de usuario inválido para actualizar',
      });
      this.isLoading = false;
      return;
    }

    const updatedData = {
      Password: this.customer.newPassword,
    };

    this.userService.updateUser(this.currentUserId, updatedData).then(
      () => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Tu contraseña ha sido actualizada correctamente',
        });

        // Limpiar formulario
        this.customer = { name: '', currentPassword: '', newPassword: '', confirmPassword: '' };
        this.nullPassword = false;
        this.isLoading = false;

        // Ir a home después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      (error) => {
        console.error('Error al actualizar contraseña:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al actualizar la contraseña. Intenta de nuevo.',
        });
        this.isLoading = false;
      }
    );
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  public togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Alterna la visibilidad de la nueva contraseña
   */
  public toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  public toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Cierra el modal
   */
  public onExit() {
    this.close.emit();
    this.router.navigate(['/']);
  }
}
