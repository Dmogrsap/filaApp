import { Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoffeeOrdersService {
  private collectionName = 'ordenescafe';

  constructor(private firestore: Firestore) {}

  getOrders(): Observable<any[]> {
    const ref = collection(this.firestore, 'ordenescafe');
    return collectionData(ref, { idField: 'id' });
  }

  getPedidosnuevos(): Observable<any[]> {
    const ref = collection(this.firestore, 'pedidos');
    return collectionData(ref, { idField: 'id' });
  }

  getCafes(): Observable<any[]> {
    const ref = collection(this.firestore, 'coffeeOrders');
    return collectionData(ref, { idField: 'id' });
  }

  addOrder(order: any) {
    const ref = collection(this.firestore, 'ordenescafe');
    return addDoc(ref, {
      ...order,
      createdAt: new Date(),
    });
  }

  updateOrder(id: string, data: Partial<any>) {
    const docRef = doc(this.firestore, 'ordenescafe', id);
    return updateDoc(docRef, data);
  }

  deleteOrder(id: string) {
    const docRef = doc(this.firestore, 'ordenescafe', id);
    return deleteDoc(docRef);
  }

  // Crear un nuevo pedido (Vista Cliente)
  crearPedido(pedido: Omit<any, 'id'>) {
    const ref = collection(this.firestore, this.collectionName);
    return addDoc(ref, pedido);
  }

  // Cambiar estado del pedido (Dashboard)
  actualizarEstado(id: string, nuevoEstado: 'Pendiente' | 'Entregado') {
    const docRef = doc(this.firestore, this.collectionName, id);
    return updateDoc(docRef, { estado: nuevoEstado });
  }
}
