import { Component, OnInit } from '@angular/core';
import { CoffeeOrdersService } from '../services/coffee-orders.service';

@Component({
  selector: 'app-filastorecliente',
  templateUrl: './filastorecliente.component.html',
  styleUrls: ['./filastorecliente.component.css'],
})
export class FilastoreclienteComponent implements OnInit {
  pedidos = { cliente: '', producto: '', cantidad: 1 };
  listaCafes: any[] = [];
  
  constructor(private cafeService: CoffeeOrdersService) {}

  ngOnInit(): void {
    this.cafeService.getCafes().subscribe((result) => {
      this.listaCafes = result;
    });
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
        this.pedidos = { cliente: '', producto: '', cantidad: 1 };
      })
      .catch((err) => {
        notify('Hubo un error al procesar tu pedido.', 'error', 3000);
        console.error(err);
      });
  }
}
function notify(arg0: string, arg1: string, arg2: number) {
  throw new Error('Function not implemented.');
}
