import { Component, OnInit } from '@angular/core';
import { CoffeeOrdersService } from '../services/coffee-orders.service';
import { NotificationService } from '../services/notification.service';

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

  constructor(
    private cafeService: CoffeeOrdersService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.dataSourceMenusTab = [
      { Nombre: 'Fila Store' },
      { Nombre: 'Fila Coffee' },
    ];

    // Escucha en tiempo real de Firestore
    this.sub = this.cafeService.getOrders().subscribe((result) => {
      this.pedidos = result
        .map((item: any) => ({
          ...item,
          fecha: item.fecha && item.fecha.toDate ? item.fecha.toDate() : item.fecha,
          desglose: this.generarDesglose(item.detalles),
          totalAPagar: this.calcularTotal(item.detalles),
        }))
        .sort((a: any, b: any) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return dateB - dateA;
        });
    });
  }

  // Genera desglose de productos (ej: "2x Espresso, 1x Americano")
  generarDesglose(detalles: any[]): string {
    if (!detalles || detalles.length === 0) return '-';
    return detalles
      .map(
        (d) =>
          `${d.cantidad}x ${d.nombre} (${d.leche || 'normal'} / ${d.azucar || 'normal'})`
      )
      .join('\n');
  }

  // Calcula el total a pagar sumando cantidad * precio de cada detalle
  calcularTotal(detalles: any[]): number {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((total, d) => total + (d.cantidad * d.precio), 0);
  }

  // Captura el cambio de estado directamente desde el Grid de DevExtreme
  onRowUpdating(e: any) {
    const id = e.key;
    if (e.newData.hasOwnProperty('estado')) {
      this.cafeService
        .actualizarEstado(id, e.newData.estado)
        .then(() => {
          console.log('Estado actualizado en Firestore');
          // Si el estado cambia a Entregado, mostrar notificación
          if (e.newData.estado === 'Entregado') {
            const pedido = this.pedidos.find((p: any) => p.id === id);
            const nombre = this.getCustomerName(pedido);
            this.notification.notify('Pedido listo', `Pedido de ${nombre} listo para recoger`);
          }
        })
        .catch((err: any) => console.error('Error al actualizar:', err));
    }
  }

  // Intenta obtener un nombre legible del objeto pedido
  getCustomerName(pedido: any): string {
    if (!pedido) return 'cliente';
    return (
      pedido.nombre || pedido.cliente || pedido.usuario || pedido.nombreCliente || pedido.email || 'cliente'
    );
  }

  onRowRemoving(e: any) {
    const id = e.key;
    if (!id) return;
    this.cafeService
      .deleteOrder(id)
      .then(() => console.log('Pedido eliminado en Firestore'))
      .catch((err: any) => console.error('Error al eliminar pedido:', err));
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
