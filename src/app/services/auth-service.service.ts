import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private isLogedSource = new BehaviorSubject<boolean>(false);
  
  // Este es el observable al que se suscribirá el MainMenu
  isLoged$ = this.isLogedSource.asObservable();

  // Método para cambiar el valor desde el Login
  setLoginStatus(status: boolean) {
    this.isLogedSource.next(status);
  }

  constructor() { }
}
