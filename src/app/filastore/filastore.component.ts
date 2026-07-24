import { Component, OnInit } from '@angular/core';
import { CoffeeOrdersService } from '../services/coffee-orders.service';
import { NotificationService } from '../services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-filastore',
  templateUrl: './filastore.component.html',
  styleUrls: ['./filastore.component.css'],
})
export class FilastoreComponent implements OnInit {
  public dataSourceMenusTab: any[] = [];
  public dataSourceCafes: any[] = [];
  public pedidos: any[] = [];
  private sub: any;
  public loadIndicatorVisible = true;
  public tipodeCafeOptions: string[] = ['Caliente', 'Helado'];

  // KPIs
  totalOrders = 0;
  totalRevenue = 0;

  // Charts
  salesByCoffee: any[] = [];
  ordersByStatus: any[] = [];

  constructor(
    private cafeService: CoffeeOrdersService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.dataSourceMenusTab = [
      { Nombre: 'Fila Store' },
      { Nombre: 'Pedidos de Cafe' },
      { Nombre: 'Addcoffee' },
    ];

    // Escucha en tiempo real de Firestore
    this.sub = this.cafeService.getOrders().subscribe((result) => {
      this.pedidos = result
        .map((item: any) => ({
          ...item,
          fecha:
            item.fecha && item.fecha.toDate ? item.fecha.toDate() : item.fecha,
          desglose: this.generarDesglose(item.detalles),
          totalAPagar: this.calcularTotal(item.detalles),
        }))
        .sort((a: any, b: any) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return dateB - dateA;
        });
    });

    this.cafeService.getCafes().subscribe((result) => {
      this.dataSourceCafes = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      this.loadIndicatorVisible = false;
      //console.log('Cafes', this.dataSourceCafes);
    });
  }

  // Genera desglose de productos (ej: "2x Espresso, 1x Americano")
  generarDesglose(detalles: any[]): string {
    if (!detalles || detalles.length === 0) return '-';
    return detalles
      .map(
        (d) =>
          `${d.cantidad}x ${d.nombre} (${d.leche || 'normal'} / ${d.azucar || 'normal'})`,
      )
      .join('\n');
  }

  // Calcula el total a pagar sumando cantidad * precio de cada detalle
  calcularTotal(detalles: any[]): number {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((total, d) => total + d.cantidad * d.precio, 0);
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
          if (
            (e.newData.estado || '').toString().toLowerCase() === 'entregado'
          ) {
            const pedido = this.pedidos.find((p: any) => p.id === id);
            const nombre = this.getCustomerName(pedido);
            this.notification.notify(
              'Pedido listo',
              `Pedido de ${nombre} listo para recoger`,
            );
          }
        })
        .catch((err: any) => console.error('Error al actualizar:', err));
    }
  }

  // Evita que el menú desplegable del lookup deforme la fila al abrirse cuando hay pocos registros
  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'estado') {
      e.editorOptions.dropDownOptions = {
        ...e.editorOptions.dropDownOptions,
        container: 'body',
      };
    }
  }

  // Intenta obtener un nombre legible del objeto pedido
  getCustomerName(pedido: any): string {
    if (!pedido) return 'cliente';
    return (
      pedido.nombre ||
      pedido.cliente ||
      pedido.usuario ||
      pedido.nombreCliente ||
      pedido.email ||
      'cliente'
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

  getDisplayExpr(item: any) {
    if (!item) {
      return '';
    }
    return `$ ${item.Nombre}, `;
  }

  onSaving(e: any) {
    const change = e.changes[0];

    if (change) {
      e.cancel = false;
    }

    if (change.type == 'insert') {

      // Limpia los campos no válidos
      const cleanData = { ...change.data };
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });

      this.cafeService.addCoffeeList(cleanData).then((docRef) => {
        //console.log('Usuario agregado con ID:', docRef.id);
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Coffee Added Successfully!',
        });

        this.cafeService.getCafes().subscribe((result) => {
          this.dataSourceCafes = result.sort((a, b) =>
            a.Nombre.localeCompare(b.Nombre),
          );
          this.loadIndicatorVisible = false;
          //console.log('Cafes', this.dataSourceCafes);
        });
      });
    }

    if (change.type == 'update') {
      // Limpia los campos no válidos
      const cleanData = { ...change.data };
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });

      this.cafeService.updateCoffeeList(change.key.id, cleanData).then(() => {
        //console.log('Usuario actualizado');
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Coffee list Updated Successfully!',
        });

        this.cafeService.getCafes().subscribe((result) => {
          this.dataSourceCafes = result.sort((a, b) =>
            a.Nombre.localeCompare(b.Nombre),
          );
          this.loadIndicatorVisible = false;
          //console.log('Cafes', this.dataSourceCafes);
        });
      });
    }

    if (change.type == 'remove') {
      const id = typeof change.key === 'string' ? change.key : change.key.id;
      this.cafeService.deleteCoffeeList(id).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Coffee Eliminated',
        });
        this.cafeService.getCafes().subscribe((result) => {
          this.dataSourceCafes = result.sort((a, b) =>
            a.Nombre.localeCompare(b.Nombre),
          );
          this.loadIndicatorVisible = false;
          //console.log('Cafes', this.dataSourceCafes);
        });
      });
    }
  }

  onExporting(e: any) {}
}
