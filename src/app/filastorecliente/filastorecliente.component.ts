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
  leche?: string;
  azucar?: string;
}

@Component({
  selector: 'app-filastorecliente',
  templateUrl: './filastorecliente.component.html',
  styleUrls: ['./filastorecliente.component.css'],
})
export class FilastoreclienteComponent implements OnInit {
  pedidos = { cliente: '', producto: [] as string[], cantidad: 1 };
  public listaCafes: any[] = [];
  public cafesCalienes: any[] = [];
  public cafesFrios: any[] = [];
  public carrito: CartItem[] = [];
  public mostrarCarrito = false;
  
  constructor(private cafeService: CoffeeOrdersService) {}

  ngOnInit(): void {
    this.cafeService.getCafes().subscribe((result) => {
      this.listaCafes = result.map((item: any) => ({
        ...item,
        Nombre:
          item.Nombre || item.nombre || item.name || item.producto || item.title || 'Café',
        leche: 'normal',
        azucar: 'normal',
        cantidad: 1,
      }));

      // Separar cafés en calientes y fríos
      this.cafesCalienes = this.listaCafes.filter((cafe: any) => {
        const tipo = (cafe['Tipo de Cafe'] || cafe.tipo || cafe.Tipo || '').toLowerCase();
        return !tipo.includes('frio') && !tipo.includes('frío') && !tipo.includes('ice') && !tipo.includes('helado');
      });

      this.cafesFrios = this.listaCafes.filter((cafe: any) => {
        const tipo = (cafe['Tipo de Cafe'] || cafe.tipo || cafe.Tipo || '').toLowerCase();
        return tipo.includes('frio') || tipo.includes('frío') || tipo.includes('ice') || tipo.includes('helado');
      });

      console.log('Cafés calientes:', this.cafesCalienes);
      console.log('Cafés fríos:', this.cafesFrios);
    });
  }

  /**
   * Incrementar cantidad de un producto
   */
  increaseQty(cafe: any): void {
    if (cafe.cantidad < 10) {
      cafe.cantidad++;
    }
  }

  /**
   * Decrementar cantidad de un producto
   */
  decreaseQty(cafe: any): void {
    if (cafe.cantidad > 1) {
      cafe.cantidad--;
    }
  }

  /**
   * Agregar café al carrito
   */
  agregarAlCarrito(cafe: any): void {
    const cantidad = cafe.cantidad;
    const seleccionadoLeche = cafe.leche || 'normal';
    const seleccionadoAzucar = cafe.azucar || 'normal';

    // Buscar si ya existe en el carrito con las mismas opciones
    const existeEnCarrito = this.carrito.findIndex(
      item =>
        item.Nombre === cafe.Nombre &&
        item.leche === seleccionadoLeche &&
        item.azucar === seleccionadoAzucar
    );

    if (existeEnCarrito > -1) {
      this.carrito[existeEnCarrito].cantidadCarrito += cantidad;
    } else {
      this.carrito.push({
        Nombre: cafe.Nombre,
        Precio: cafe.Precio,
        Descripcion: cafe.Descripcion,
        'Tipo de Cafe': cafe['Tipo de Cafe'],
        imagen: cafe.imagen,
        Imagen: cafe.Imagen,
        cantidadCarrito: cantidad,
        leche: seleccionadoLeche,
        azucar: seleccionadoAzucar,
      });
    }

    // Resetear cantidad, pero mantener la selección de leche y azúcar
    cafe.cantidad = 1;

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

    // Construir array de productos con cantidades y opciones
    const productosConCantidad = this.carrito.map(item => ({
      nombre: item.Nombre,
      cantidad: item.cantidadCarrito,
      precio: item.Precio,
      leche: item.leche || 'normal',
      azucar: item.azucar || 'normal',
    }));

    // Calcular cantidad total
    const cantidadTotal = this.carrito.reduce((total, item) => total + item.cantidadCarrito, 0);

    const pedidoAEnviar: Omit<any, 'id'> = {
      cliente: this.pedidos.cliente.trim(),
      producto: productosConCantidad.map(p => p.nombre), // Array de nombres
      cantidad: cantidadTotal,
      estado: 'pendiente',
      fecha: new Date(),
      detalles: productosConCantidad // Guardar detalles completos con opciones
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
