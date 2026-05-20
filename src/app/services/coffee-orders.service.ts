import { Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class CoffeeOrdersService {

  
private collectionName = 'coffeeOrders';

  constructor(private firestore: Firestore) {}

  getOrders(): Observable<any[]> {
    const ref = collection(this.firestore,  'coffeeOrders');
    return collectionData(ref, { idField: 'id' });
  }

  addOrder(order: any) {
    const ref = collection(this.firestore, 'coffeeOrders');
    return addDoc(ref, {
      ...order,
      createdAt: new Date()
    });
  }

  updateOrder(id: string, data: Partial<any>) {
    const docRef = doc(this.firestore, 'coffeeOrders', id);
    return updateDoc(docRef, data);
  }

  deleteOrder(id: string) {
    const docRef = doc(this.firestore, 'coffeeOrders', id);
    return deleteDoc(docRef);
  }

}
