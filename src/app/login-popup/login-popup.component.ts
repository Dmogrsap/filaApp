import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrls: ['./login-popup.component.css']
})
export class LoginPopupComponent {
  username = '';
  password = '';
  @Output() login = new EventEmitter<{ username: string; password: string }>();
  @Output() close = new EventEmitter<void>();

  onLogin() {
    this.login.emit({ username: this.username, password: this.password });
  }

  onClose() {
    this.close.emit();
  }
}
