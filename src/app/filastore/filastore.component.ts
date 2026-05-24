import { Component, OnInit } from '@angular/core';
import { CoffeeOrdersService } from '../services/coffee-orders.service';

@Component({
  selector: 'app-filastore',
  templateUrl: './filastore.component.html',
  styleUrls: ['./filastore.component.css'],
})
export class FilastoreComponent implements OnInit {
  public dataSourceMenusTab: any[] = [];
  public pedidos: any[] = [];
  private sub: any;

  // KPIs
  totalOrders = 0;
  totalRevenue = 0;

  // Charts
  salesByCoffee: any[] = [];
  ordersByStatus: any[] = [];

  constructor(private cafeService: CoffeeOrdersService) {}

  ngOnInit(): void {
    this.dataSourceMenusTab = [
      { Nombre: 'Fila Store' },
      { Nombre: 'Fila Coffee' },
    ];

    // Escucha en tiempo real de Firestore
    this.sub = this.cafeService.getOrders().subscribe((result) => {
      this.pedidos = result;
    });
  }

  // Captura el cambio de estado directamente desde el Grid de DevExtreme
  onRowUpdating(e: any) {
    const id = e.key;
    if (e.newData.hasOwnProperty('estado')) {
      this.cafeService
        .actualizarEstado(id, e.newData.estado)
        .then(() => console.log('Estado actualizado en Firestore'))
        .catch((err: any) => console.error('Error al actualizar:', err));
    }
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
