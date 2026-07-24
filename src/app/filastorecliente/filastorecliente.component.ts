import { Component, OnInit, OnDestroy } from '@angular/core';
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
  escencia?: string;
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
  // Para detectar cambios de estado en pedidos
  private prevStates: Record<string, string> = {};
  private ordersSub: any;
  // Id del último pedido enviado por este cliente (se guarda también en localStorage)
  public myOrderId: string | null = null;

  // Popup local cuando un pedido pasa a Entregado
  public showDeliveredPopup = false;
  public deliveredInfo: any = null;
  
  constructor(private cafeService: CoffeeOrdersService) {}

  ngOnInit(): void {
    this.cafeService.getCafes().subscribe((result) => {
      this.listaCafes = result.map((item: any) => ({
        ...item,
        Nombre:
          item.Nombre || item.nombre || item.name || item.producto || item.title || 'Café',
        leche: 'light',
        azucar: 'normal',
        escencia: 'Caramelo',
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

      //console.log('Cafés calientes:', this.cafesCalienes);
      //console.log('Cafés fríos:', this.cafesFrios);
    });

    // Escuchar cambios en los pedidos para notificar cuando se pongan como Entregado
    this.ordersSub = this.cafeService.getOrders().subscribe((orders: any[]) => {
      // Si no hay prevStates llenos, inicializarlos
      if (Object.keys(this.prevStates).length === 0) {
        orders.forEach((o: any) => {
          if (o.id) this.prevStates[o.id] = o.estado || '';
        });
        return;
      }

      orders.forEach((o: any) => {
        const id = o.id;
        const prev = this.prevStates[id];
        const curr = o.estado || '';

        const prevNorm = (prev || '').toString().toLowerCase();
        const currNorm = (curr || '').toString().toLowerCase();

        // Detectar transición a entregado (case-insensitive) y solo avisar al cliente correspondiente
        if (prevNorm !== 'entregado' && currNorm === 'entregado') {
          const clienteActual = (this.pedidos.cliente || '').trim().toLowerCase();
          const clientePedido = (o.cliente || o.nombre || '').toString().trim().toLowerCase();
          const storedLastId = localStorage.getItem('lastOrderId');
          const isMyOrderById = (this.myOrderId && this.myOrderId === id) || (storedLastId && storedLastId === id);

          // Mostrar popup si:
          // - el cliente actual coincide con el cliente del pedido, o
          // - este pedido coincide con el id del último pedido creado en esta sesión/localStorage
          if ((clienteActual && clientePedido && clienteActual === clientePedido) || isMyOrderById) {
            this.deliveredInfo = o;
            this.showDeliveredPopup = true;
            const nombre = o.cliente || o.nombre || 'cliente';
            notify(`Pedido listo: ${nombre}`, 'success', 4000);
          }
        }

        if (id) this.prevStates[id] = curr;
      });
    });
  }

  // Calcula el total del pedido a partir de los detalles (cantidad * precio)
  calcularTotal(detalles: any[] | undefined): number {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((total, d) => {
      const cantidad = Number(d.cantidad || 0);
      const precio = Number(d.precio ?? d.Precio ?? 0);
      return total + cantidad * precio;
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.ordersSub) this.ordersSub.unsubscribe();
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
    const seleccionadoLeche = cafe.leche || 'light';
    const seleccionadoEscencia = cafe.escencia || 'caramelo';
    const seleccionadoAzucar = cafe.azucar || 'normal';

    // Buscar si ya existe en el carrito con las mismas opciones
    const existeEnCarrito = this.carrito.findIndex(
      item =>
        item.Nombre === cafe.Nombre &&
        item.leche === seleccionadoLeche &&
        item.escencia === seleccionadoEscencia &&
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
        escencia: seleccionadoEscencia,
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
      escencia: item.escencia || 'Caramelo',
      leche: item.leche || 'light',
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
      .then((docRef: any) => {
        notify(
          '✓ ¡Pedido enviado con éxito! Tu café está en preparación.',
          'success',
          3000,
        );
        // Resetear formulario
        // Guardar id del pedido para poder detectar su cambio de estado en esta sesión
        try {
          const id = docRef.id || (docRef && docRef._key && docRef._key.path && docRef._key.path.segments && docRef._key.path.segments.pop());
          if (id) {
            this.myOrderId = id;
            localStorage.setItem('lastOrderId', id);
          }
        } catch (err) {
          // ignore
        }

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
