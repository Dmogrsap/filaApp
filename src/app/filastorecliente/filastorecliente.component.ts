import { Component, OnInit } from '@angular/core';
import { CoffeeOrdersService } from '../services/coffee-orders.service';
import notify from 'devextreme/ui/notify';

interface CartItem {
  Nombre: string;
  Precio: number;
  Descripcion?: string;
  'Tipo de Cafe'?: string;
  imagen?: string;
  Imagen?: string;
  cantidadCarrito: number;
}

@Component({
  selector: 'app-filastorecliente',
  templateUrl: './filastorecliente.component.html',
  styleUrls: ['./filastorecliente.component.css'],
})
export class FilastoreclienteComponent implements OnInit {
  pedidos = { cliente: '', producto: [] as string[], cantidad: 1 };
  public listaCafes: any[] = [];
  public carrito: CartItem[] = [];
  public cantidadProducto: number[] = [];
  public mostrarCarrito = false;
  
  constructor(private cafeService: CoffeeOrdersService) {}

  ngOnInit(): void {
    this.cafeService.getCafes().subscribe((result) => {
      this.listaCafes = result.map((item: any) => ({
        ...item,
        Nombre:
          item.Nombre || item.nombre || item.name || item.producto || item.title || 'Café',
      }));

      // Inicializar cantidades a 1 para cada producto
      this.cantidadProducto = new Array(this.listaCafes.length).fill(1);

      console.log('Lista de cafés:', this.listaCafes);
    });
  }

  /**
   * Incrementar cantidad de un producto
   */
  increaseQty(index: number): void {
    if (this.cantidadProducto[index] < 10) {
      this.cantidadProducto[index]++;
    }
  }

  /**
   * Decrementar cantidad de un producto
   */
  decreaseQty(index: number): void {
    if (this.cantidadProducto[index] > 1) {
      this.cantidadProducto[index]--;
    }
  }

  /**
   * Agregar café al carrito
   */
  agregarAlCarrito(cafe: any, index: number): void {
    const cantidad = this.cantidadProducto[index];
    
    // Buscar si ya existe en el carrito
    const existeEnCarrito = this.carrito.findIndex(item => item.Nombre === cafe.Nombre);
    
    if (existeEnCarrito > -1) {
      // Si ya existe, incrementar la cantidad
      this.carrito[existeEnCarrito].cantidadCarrito += cantidad;
    } else {
      // Si no existe, agregarlo
      this.carrito.push({
        Nombre: cafe.Nombre,
        Precio: cafe.Precio,
        Descripcion: cafe.Descripcion,
        'Tipo de Cafe': cafe['Tipo de Cafe'],
        imagen: cafe.imagen,
        Imagen: cafe.Imagen,
        cantidadCarrito: cantidad
      });
    }

    // Resetear cantidad
    this.cantidadProducto[index] = 1;
    
    notify('✓ Café agregado al carrito', 'success', 2000);
  }

  /**
   * Remover café del carrito
   */
  removerDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
  }

  /**
   * Alternar visibilidad del carrito
   */
  toggleCart(): void {
    this.mostrarCarrito = !this.mostrarCarrito;
  }

  /**
   * Calcular subtotal del carrito
   */
  calcularSubtotal(): number {
    return this.carrito.reduce((total, item) => total + (item.Precio * item.cantidadCarrito), 0);
  }

  /**
   * Método original para compatibilidad con DevExtreme
   */
  onCoffeeSelectionChanged(selectedRowKeys: any[], component: any) {
    this.pedidos.producto = selectedRowKeys || [];
    component.option('value', this.pedidos.producto);
  }

  /**
   * Enviar pedido
   */
  enviarPedido(e: any): void {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    // Validación
    if (!this.pedidos.cliente || !this.pedidos.cliente.trim()) {
      notify('Por favor, ingresa tu nombre', 'warning', 3000);
      return;
    }

    if (this.carrito.length === 0) {
      notify('Por favor, agrega al menos un café al carrito', 'warning', 3000);
      return;
    }

    // Construir array de productos con cantidades
    const productosConCantidad = this.carrito.map(item => ({
      nombre: item.Nombre,
      cantidad: item.cantidadCarrito,
      precio: item.Precio
    }));

    // Calcular cantidad total
    const cantidadTotal = this.carrito.reduce((total, item) => total + item.cantidadCarrito, 0);

    const pedidoAEnviar: Omit<any, 'id'> = {
      cliente: this.pedidos.cliente.trim(),
      producto: productosConCantidad.map(p => p.nombre), // Array de nombres
      cantidad: cantidadTotal,
      estado: 'pendiente',
      fecha: new Date(),
      detalles: productosConCantidad // Guardar detalles completos
    };

    this.cafeService
      .crearPedido(pedidoAEnviar)
      .then(() => {
        notify(
          '✓ ¡Pedido enviado con éxito! Tu café está en preparación.',
          'success',
          3000,
        );
        // Resetear formulario
        this.pedidos = { cliente: '', producto: [], cantidad: 1 };
        this.carrito = [];
        this.mostrarCarrito = false;
      })
      .catch((err) => {
        notify('❌ Hubo un error al procesar tu pedido. Intenta de nuevo.', 'error', 3000);
        console.error(err);
      });
  }
}
