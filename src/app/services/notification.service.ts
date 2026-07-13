import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // Solicita permiso al usuario para mostrar notificaciones (si aplica)
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    return await Notification.requestPermission();
  }

  // Muestra una notificación nativa del navegador
  async notify(title: string, body?: string, icon?: string) {
    const perm = await this.requestPermission();
    if (perm !== 'granted') return false;
    try {
      new Notification(title, { body: body || '', icon });
      return true;
    } catch (e) {
      console.error('Error mostrando notificación:', e);
      return false;
    }
  }
}
