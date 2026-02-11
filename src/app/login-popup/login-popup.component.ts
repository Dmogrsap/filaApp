import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DxFormComponent } from 'devextreme-angular';
import { DxFormModule, DxFormTypes } from 'devextreme-angular/ui/form';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.css']
})
export class LoginPopupComponent {
  @ViewChild(DxFormComponent, { static: false }) form: DxFormComponent | undefined;

  customer = { Email: '', Password: '' };
  @Output() login = new EventEmitter<{ username: string; password: string }>();
  @Output() close = new EventEmitter<void>();

  emailEditorOptions = {
    mode: 'email'
  };

  passwordEditorOptions = {
    mode: 'password'
  };

  constructor(private router: Router) {}

  onFormSubmit(e: any) {
    this.login.emit({ username: this.customer.Email, password: this.customer.Password });
    e.preventDefault();
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

  iniciarSesion() {
    // ... tu lógica de autenticación ...
    console.log('Login exitoso');
    
    // 3. Redirigir a la página principal
    //this.router.navigate(['/home']); 
  }

  onClose() {
    this.close.emit();
  }

  onExit() {
    this.close.emit();
    this.router.navigate(['/']);
  }
}
