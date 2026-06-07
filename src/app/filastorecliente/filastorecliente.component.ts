import { Component, OnInit } from '@angular/core';
import { CoffeeOrdersService } from '../services/coffee-orders.service';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-filastorecliente',
  templateUrl: './filastorecliente.component.html',
  styleUrls: ['./filastorecliente.component.css'],
})
export class FilastoreclienteComponent implements OnInit {
  pedidos = { cliente: '', producto: [] as string[], cantidad: 1 };
  public listaCafes: any[] = [];
  
  constructor(private cafeService: CoffeeOrdersService) {}

  ngOnInit(): void {
    this.cafeService.getCafes().subscribe((result) => {
      this.listaCafes = result.map((item: any) => ({
        ...item,
        Nombre:
          item.Nombre || item.nombre || item.name || item.producto || item.title || 'Café',
      }));

      console.log('Lista de cafés:', this.listaCafes);
    });
  }

  onCoffeeSelectionChanged(selectedRowKeys: any[], component: any) {
    this.pedidos.producto = selectedRowKeys || [];
    component.option('value', this.pedidos.producto);
  }

  enviarPedido(e: SubmitEvent) {
    e.preventDefault();

    const pedidoAEnviar: Omit<any, 'id'> = {
      cliente: this.pedidos.cliente,
      producto: this.pedidos.producto,
      cantidad: this.pedidos.cantidad,
      estado: 'pendiente',
      fecha: new Date(), // Almacena la fecha actual
    };

    this.cafeService
      .crearPedido(pedidoAEnviar)
      .then(() => {
        notify(
          '¡Pedido enviado con éxito! Tu café está en preparación.',
          'success',
          3000,
        );
        // Resetear formulario
        this.pedidos = { cliente: '', producto: [], cantidad: 1 };
      })
      .catch((err) => {
        notify('Hubo un error al procesar tu pedido.', 'error', 3000);
        console.error(err);
      });
  }
}
