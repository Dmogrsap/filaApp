import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';
import { UsersService } from '../services/usersService.service';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.css'],
})
export class ChangePassComponent implements OnInit, OnDestroy {
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
  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    this.loadCurrentUser();
  }

  /**
   * Carga el usuario actual desde el servicio de autenticación
   */
  private loadCurrentUser() {
    const userNameSubscription = this.AuthService.userName$.subscribe((userName) => {
      if (userName) {
        this.customer.name = userName.trim();
        this.checkUserExists();
      } else {
        this.resetForm();
      }
    });

    this.subscriptions.add(userNameSubscription);
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
  private normalizeName(name: string): string {
    return (name || '').toLowerCase().trim();
  }

  private findUserByName(name: string) {
    const normalizedCustomerName = this.normalizeName(name);

    return this.datasourceusers.find((user) => {
      const firstName = this.normalizeName(user.Nombre);
      const fullName = this.normalizeName(`${user.Nombre || ''} ${user.Apellido || ''}`);
      return (
        firstName === normalizedCustomerName ||
        fullName === normalizedCustomerName ||
        normalizedCustomerName === fullName.split(' ')[0]
      );
    });
  }

  private checkUserExists() {
    this.userService.getUsers().subscribe(
      (result) => {
        this.datasourceusers = result;
        const foundUser = this.findUserByName(this.customer.name);
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
  public async CambiarPass() {
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

    try {
      const result = await firstValueFrom(this.userService.getUsers());
      this.datasourceusers = result;
      const foundUser = this.findUserByName(this.customer.name);

      if (foundUser === undefined || foundUser === null) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Usuario no encontrado',
        });
        this.isLoading = false;
        return;
      }

      this.currentUserId = foundUser.id ?? '';

      if (!this.currentUserId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener el ID del usuario',
        });
        this.isLoading = false;
        return;
      }

      const storedPassword = foundUser.Password == null ? '' : foundUser.Password.toString().trim();
      const enteredPassword = this.customer.currentPassword == null ? '' : this.customer.currentPassword.toString().trim();
      const passwordIsValid = storedPassword.length === 0 || storedPassword === enteredPassword;

      if (passwordIsValid === false) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La contraseña actual es incorrecta',
        });
        this.isLoading = false;
        return;
      }

      await this.updateUserPassword();
      return;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al procesar la solicitud',
      });
      this.isLoading = false;
    }
  }

  /**
   * Actualiza la contraseña del usuario en la base de datos
   */
  private async updateUserPassword() {
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

    try {
      await this.userService.updateUser(this.currentUserId, updatedData);

      await Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Tu contraseña ha sido actualizada correctamente',
      });

      // Cerrar sesión para eliminar el usuario actual de la sesión
      this.AuthService.logout();

      // Limpiar formulario
      this.resetForm();
      this.isLoading = false;
      return;
      //this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar la contraseña. Intenta de nuevo.',
      });
      this.isLoading = false;
      return
    }
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

  private showError(message: string) {
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'Cerrar',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  }

  /**
   * Cierra el modal
   */
  public onExit() {
    this.close.emit();
    this.router.navigate(['/']);
  }

  private resetForm() {
    this.customer = { name: '', currentPassword: '', newPassword: '', confirmPassword: '' };
    this.userExists = false;
    this.nullPassword = false;
    this.isLoading = false;
    this.currentUserId = '';
    this.datasourceusers = [];
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
