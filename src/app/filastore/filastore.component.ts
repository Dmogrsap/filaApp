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

  public insumos: any = {
    normal: true,
    light: true,
    deslactosada: true,
    caramelo: true,
    cremaIrlandesa: true,
    avellana: true,
    moka:true,
    vainilla:true,
    azucar: true,
    splenda: true,
  };
  private insumosSub: any;
  // Pedido manual desde grid

  constructor(
    private cafeService: CoffeeOrdersService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.dataSourceMenusTab = [
      { Nombre: 'Pedidos de Cafe' },
      { Nombre: 'Cobros de Cafe' },
      { Nombre: 'Añadir Nuevos Cafes' },
      { Nombre: 'Editar Insumos' },
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
          pago: item.pago || 'Pendiente de pagar',
          metodoPago: item.metodoPago || 'Efectivo',
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

    this.insumosSub = this.cafeService.getInsumos().subscribe((res: any) => {
      if (res) {
        this.insumos = { ...this.insumos, ...res };
      }
     // console.log('Insumos', this.insumos);
    });
  }


  // Genera desglose de productos (ej: "2x Espresso, 1x Americano")
  generarDesglose(detalles: any[]): string {
    if (!detalles || detalles.length === 0) return '-';
    return detalles
      .map(
        (d) =>
          `${d.cantidad}x ${d.nombre} (leche: ${d.leche || 'No lleva'} / Escencia: ${d.escencia || 'No lleva'} / Azucar: ${d.azucar || 'No lleva'})`,
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
    const cambios: any = {};

    if (e.newData.hasOwnProperty('estado')) {
      cambios.estado = e.newData.estado;
    }

    if (e.newData.hasOwnProperty('pago')) {
      cambios.pago = e.newData.pago;
    }

    if (e.newData.hasOwnProperty('metodoPago')) {
      cambios.metodoPago = e.newData.metodoPago;
    }

    if (Object.keys(cambios).length > 0) {
      this.cafeService
        .updateOrder(id, cambios)
        .then(() => {
          if (cambios.estado) {
            console.log('Estado actualizado en Firestore');
            if (
              (cambios.estado || '').toString().toLowerCase() === 'entregado'
            ) {
              const pedido = this.pedidos.find((p: any) => p.id === id);
              const nombre = this.getCustomerName(pedido);
              this.notification.notify(
                'Pedido listo',
                `Pedido de ${nombre} listo para recoger`,
              );
            }
          }
          if (cambios.pago || cambios.metodoPago) {
            console.log('Datos de cobro actualizados en Firestore');
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
    if (this.insumosSub) this.insumosSub.unsubscribe();
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

  guardarInsumos(): void {
    this.cafeService
      .actualizarInsumos(this.insumos)
      .then(() => {
        this.notification.notify(
          'Éxito',
          'Disponibilidad de insumos actualizada',
        );
      })
      .catch((err) => console.error('Error al actualizar insumos:', err));
  }

  onSaving1(e: any) {
    const change = e.changes[0];

    if (change) {
      e.cancel = false;
    }

    if (change.type === 'insert') {
      const cleanData = { ...change.data };

      // Limpiar propiedades internas de DevExtreme
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });

      const productoSeleccionado = cleanData.producto;
      const cafeSeleccionado = this.dataSourceCafes.find(
        (c: any) => c.Nombre === productoSeleccionado,
      );
      const precioUnitario = cafeSeleccionado?.Precio || 0;

      const detalle = {
        nombre: cleanData.producto || 'Pedido Manual',
        cantidad: cleanData.cantidad || 1,
        precio: precioUnitario,
        tamano: cleanData.tamano || 'Mediano',
        leche: cleanData.leche || 'No',
        escencia: cleanData.escencia || '',
        azucar: cleanData.azucar ? 'Si' : 'No',
        notas: cleanData.notas || '',
      };

      const nuevoPedido = {
        cliente: cleanData.cliente || 'Manual',
        cantidad: cleanData.cantidad || 1,
        estado: cleanData.estado || 'pendiente',
        fecha: cleanData.fecha || new Date(),
        producto: [detalle.nombre],
        detalles: [detalle],
      };

      this.cafeService
        .addOrder(nuevoPedido)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: '¡Pedido agregado correctamente!',
          });
        })
        .catch((err) => console.error('Error al agregar pedido:', err));
    }

    if (change.type === 'update') {
      const id = change.key;
      const cleanData = { ...change.data };

      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });

      // Si se actualiza el producto o la cantidad, regenerar detalles mínimos
      if (cleanData.producto || cleanData.cantidad || cleanData.tamano || cleanData.leche || cleanData.escencia || cleanData.azucar !== undefined || cleanData.notas) {
        const pedidoActual = this.pedidos.find((p: any) => p.id === id);
        const productoActual = cleanData.producto || pedidoActual?.producto?.[0] || 'Pedido Manual';
        const cafeActual = this.dataSourceCafes.find((c: any) => c.Nombre === productoActual);
        const precioUnitario = cafeActual?.Precio || pedidoActual?.detalles?.[0]?.precio || 0;

        cleanData.detalles = [
          {
            nombre: productoActual,
            cantidad: cleanData.cantidad ?? pedidoActual?.cantidad ?? 1,
            precio: precioUnitario,
            tamano: cleanData.tamano || pedidoActual?.detalles?.[0]?.tamano || 'Mediano',
            leche: cleanData.leche || pedidoActual?.detalles?.[0]?.leche || 'No',
            escencia: cleanData.escencia || pedidoActual?.detalles?.[0]?.escencia || '',
            azucar:
              cleanData.azucar !== undefined
                ? cleanData.azucar
                  ? 'Si'
                  : 'No'
                : pedidoActual?.detalles?.[0]?.azucar || 'No',
            notas: cleanData.notas || pedidoActual?.detalles?.[0]?.notas || '',
          },
        ];
        cleanData.producto = [productoActual];
      }

      this.cafeService
        .updateOrder(id, cleanData)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: '¡Pedido actualizado correctamente!',
          });
        })
        .catch((err) => console.error('Error al actualizar pedido:', err));
    }
  }

  onExporting(e: any) {}
}
