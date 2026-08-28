import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoffeeOrdersService } from '../services/coffee-orders.service';
import { NotificationService } from '../services/notification.service';
import { SupabaseStorageService } from '../services/supabase-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-filastore',
  templateUrl: './filastore.component.html',
  styleUrls: ['./filastore.component.css'],
})
export class FilastoreComponent implements OnInit, OnDestroy {
  public dataSourceMenusTab: any[] = [];
  public dataSourceCafes: any[] = [];
  public dataSourceCalendar: any[] = [];
  public pedidos: any[] = [];
  private sub: any;
  private cafesSub: any;
  public loadIndicatorVisible = true;
  public tipodeCafeOptions: string[] = ['Caliente', 'Helado'];

  // Variables para subida de imagen de café
  public subiendoImagen = false;
  public previewImagenUrl: string | null = null;
  public currentUploadedUrl: string | null = null;
  public currentUploadedPath: string | null = null;
  private previousImagePath: string | null = null;
  private editingCoffeeId: string | null = null;

  private normalizeCoffeeFlags(data: any = {}): any {
    const item = { ...data };
    item.llevaLeche = item.llevaLeche === false ? false : true;
    item.llevaEscencia = item.llevaEscencia === true ? true : false;
    item.llevaAzucar = item.llevaAzucar === false ? false : true;
    item.Status = item.Status === false ? false : true;
    return item;
  }

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
    moka: true,
    vainilla: true,
    azucar: true,
    splenda: true,
  };
  private insumosSub: any;

  // +++++  variables calendario  ++++++ //

  public rolesCafeList: any[] = [];
  public vistaActual: 'calendario' | 'tabla' = 'calendario';

  // Opciones predefinidas para dropdowns en DevExtreme
  public turnosOptions = [
    'Primer Servicio (9:00 AM)',
    'Segundo Servicio (11:30 AM)',
    'Especial / Evento',
  ];
  public tareasOptions = [
    'Barista',
    'Caja / Cobros',
    'Atención en Barra',
    'Limpieza y Insumos',
  ];

  // +++++  cierre de variables calendario  ++++++ //

  constructor(
    private cafeService: CoffeeOrdersService,
    private notification: NotificationService,
    private storageService: SupabaseStorageService,
  ) {}

  ngOnInit(): void {
    this.dataSourceMenusTab = [
      { Nombre: 'Pedidos de Cafe' },
      { Nombre: 'Cobros de Cafe' },
      { Nombre: 'Añadir Nuevos Cafes' },
      { Nombre: 'Editar Insumos' },
      { Nombre: 'Calendario' },
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

    this.cafesSub = this.cafeService.getCafes().subscribe({
      next: (result) => {
        this.dataSourceCafes = (result || [])
          .map((item: any) => ({
            ...item,
            Nombre: item.Nombre || item.nombre || item.name || '',
            Descripcion: item.Descripcion || item.descripcion || '',
            'Tipo de Cafe':
              item['Tipo de Cafe'] || item.tipo || item.Tipo || 'Caliente',
            Precio: item.Precio ?? item.precio ?? 0,
            Tamaño: item.Tamaño || item.Tamano || item.tamano || '',
            Status:
              item.Status !== undefined ? item.Status : (item.status ?? true),
            llevaLeche: item.llevaLeche === false ? false : true,
            llevaEscencia: item.llevaEscencia === true ? true : false,
            llevaAzucar: item.llevaAzucar === false ? false : true,
            imagen: item.imagen || item.Imagen || '',
          }))
          .sort((a, b) => (a.Nombre || '').localeCompare(b.Nombre || ''));
        this.loadIndicatorVisible = false;
        //console.log('Añadir Cafes cargados:', this.dataSourceCafes);
      },
      error: (err) => {
        //console.error('Error al cargar cafés:', err);
        this.loadIndicatorVisible = false;
      },
    });

    this.insumosSub = this.cafeService.getInsumos().subscribe((res: any) => {
      if (res) {
        this.insumos = { ...this.insumos, ...res };
      }
      // console.log('Insumos', this.insumos);
    });

    this.cafeService.getCalendarEvents().subscribe((result) => {
      this.dataSourceCalendar = result.sort((a, b) =>
        a.fecha.localeCompare(b.fecha),
      );
      this.loadIndicatorVisible = false;
      //console.log('Calendario', this.dataSourceCalendar);
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
      e.promise = this.cafeService
        .updateOrder(id, cambios)
        .then(() => {
          if (cambios.estado) {
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
        })
        .catch((err: any) => {
          console.error('Error al actualizar pedido:', err);
          throw err;
        });
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
    if (this.cafesSub) this.cafesSub.unsubscribe();
    if (this.insumosSub) this.insumosSub.unsubscribe();
  }

  getDisplayExpr(item: any) {
    if (!item) {
      return '';
    }
    return `$ ${item.Nombre}, `;
  }

  onInitNewCoffeeRow(e: any) {
    this.previewImagenUrl = null;
    this.currentUploadedUrl = null;
  }

  onEditingCoffeeStart(e: any) {
    const coffee = this.normalizeCoffeeFlags(e.data || {});
    e.data = coffee;

    this.editingCoffeeId = coffee.id;
    this.previewImagenUrl = coffee?.imagen || coffee?.Imagen || null;
    this.currentUploadedUrl = this.previewImagenUrl;
    this.previousImagePath = coffee?.imagenPath || null;
  }

  async onCoffeeImageSelected(e: any, formItemData: any) {
    const file: File | undefined = e.value?.[0];
    if (!file) return;

    try {
      this.subiendoImagen = true;

      // Preview local instantáneo
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.previewImagenUrl = event.target.result;
      };
      reader.readAsDataURL(file);

      // Subir archivo a la carpeta 'cafes' en Storage
      const { url, path } = await this.storageService.uploadFile(file, 'cafes');
      this.currentUploadedUrl = url;
      this.currentUploadedPath = path;

      if (this.editingCoffeeId) {
        await this.cafeService.updateCoffeeList(this.editingCoffeeId, {
          imagen: url,
          imagenPath: path,
        });

        if (this.previousImagePath && this.previousImagePath !== path) {
          await this.storageService.deleteFile(this.previousImagePath);
        }

        this.previousImagePath = path;
      }

      // Actualizar el valor en el formulario de DevExtreme
      if (formItemData?.component) {
        formItemData.component.updateData('imagen', url);

        formItemData.component.updateData('imagenPath', path);

        // Forzar a DevExtreme a marcar el formulario como modificado
        formItemData.component.repaint();
      }

      Swal.fire({
        icon: 'success',
        title: 'Imagen subida',
        text: 'La imagen se cargó correctamente',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      Swal.fire('Error', error?.message || 'Error al subir la imagen', 'error');
    } finally {
      this.subiendoImagen = false;
    }
  }

  onSaving(e: any) {
    const change = e.changes[0];

    if (!change) {
      return;
    }

    if (change.type === 'insert') {
      // Limpia los campos no válidos
      const cleanData = this.normalizeCoffeeFlags({ ...change.data });
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });

      //console.log('currentUploadedUrl =>', this.currentUploadedUrl);
      if (this.currentUploadedUrl && !cleanData.imagen) {
        cleanData.imagen = this.currentUploadedUrl;
      }

      if (this.currentUploadedPath && !cleanData.imagenPath) {
        cleanData.imagenPath = this.currentUploadedPath;
      }

      //console.log('cleanData final =>', cleanData);
      e.promise = this.cafeService
        .addCoffeeList(cleanData)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: '¡Café agregado correctamente!',
          });
          this.previewImagenUrl = null;
          this.currentUploadedUrl = null;
        })
        .catch((err) => {
          console.error('Error al agregar café:', err);
          Swal.fire(
            'Error',
            'No se pudo agregar el café: ' + (err?.message || err),
            'error',
          );
          throw err;
        });
    }

    if (change.type === 'update') {
      // Limpia los campos no válidos
      const cleanData = this.normalizeCoffeeFlags({
        ...change.data,
        imagen: this.currentUploadedUrl,
        imagenPath: this.currentUploadedPath,
      });
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });

      if (this.currentUploadedUrl && !cleanData.imagen) {
        cleanData.imagen = this.currentUploadedUrl;
      }

      if (this.currentUploadedPath && !cleanData.imagenPath) {
        cleanData.imagenPath = this.currentUploadedPath;
      }

      const id = typeof change.key === 'string' ? change.key : change.key.id;

      e.promise = (async () => {
        try {
          const nuevaImagen =
            cleanData.imagenPath &&
            cleanData.imagenPath !== this.previousImagePath;

          await this.cafeService.updateCoffeeList(id, cleanData);

          if (nuevaImagen && this.previousImagePath) {
            await this.storageService.deleteFile(this.previousImagePath);
          }

          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: '¡Café actualizado correctamente!',
          });

          this.previewImagenUrl = null;
          this.currentUploadedUrl = null;
          this.currentUploadedPath = null;
          this.previousImagePath = null;
        } catch (err: any) {
          console.error(err);

          Swal.fire('Error', 'No se pudo actualizar el café', 'error');

          throw err;
        }
      })();

      // e.promise = this.cafeService
      //   .updateCoffeeList(id, cleanData)
      //   .then(() => {
      //     Swal.fire({
      //       icon: 'success',
      //       title: 'Éxito',
      //       text: '¡Café actualizado correctamente!',
      //     });
      //     this.previewImagenUrl = null;
      //     this.currentUploadedUrl = null;
      //   })
      //   .catch((err) => {
      //     console.error('Error al actualizar café:', err);
      //     Swal.fire(
      //       'Error',
      //       'No se pudo actualizar el café: ' + (err?.message || err),
      //       'error',
      //     );
      //     throw err;
      //   });
    }

    if (change.type === 'remove') {
      const id = typeof change.key === 'string' ? change.key : change.key.id;

      const cafe = this.dataSourceCafes.find((x: any) => x.id === id);

      e.promise = (async () => {
        try {
          if (cafe?.imagenPath) {
            await this.storageService.deleteFile(cafe.imagenPath);
          }
          await this.cafeService.deleteCoffeeList(id);
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: 'Café eliminado',
          });
          this.previewImagenUrl = null;
          this.currentUploadedUrl = null;
          this.currentUploadedPath = null;
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'No se pudo eliminar el café', 'error');
          throw err;

          // e.promise =  this.cafeService
          //   .deleteCoffeeList(id)
          //   .then(() => {
          //     Swal.fire({
          //       icon: 'success',
          //       title: 'Éxito',
          //       text: 'Café eliminado',
          //     });
          //   })
          //   .catch((err) => {
          //     console.error('Error al eliminar café:', err);
          //     Swal.fire(
          //       'Error',
          //       'No se pudo eliminar el café: ' + (err?.message || err),
          //       'error',
          //     );
          //     throw err;
          //   });
        }
      })();
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
    const change = e.changes?.[0];

    if (!change) return;

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
        pago: cleanData.pago || 'Pendiente de pagar',
        fecha: cleanData.fecha || new Date(),
        producto: [detalle.nombre],
        detalles: [detalle],
      };

      e.promise = this.cafeService
        .addOrder(nuevoPedido)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: '¡Pedido agregado correctamente!',
          });
        })
        .catch((err) => {
          console.error('Error al agregar pedido:', err);
          throw err;
        });
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
      if (
        cleanData.producto ||
        cleanData.cantidad ||
        cleanData.tamano ||
        cleanData.leche ||
        cleanData.escencia ||
        cleanData.azucar !== undefined ||
        cleanData.notas
      ) {
        const pedidoActual = this.pedidos.find((p: any) => p.id === id);
        const productoActual =
          cleanData.producto || pedidoActual?.producto?.[0] || 'Pedido Manual';
        const cafeActual = this.dataSourceCafes.find(
          (c: any) => c.Nombre === productoActual,
        );
        const precioUnitario =
          cafeActual?.Precio || pedidoActual?.detalles?.[0]?.precio || 0;

        cleanData.detalles = [
          {
            nombre: productoActual,
            cantidad: cleanData.cantidad ?? pedidoActual?.cantidad ?? 1,
            precio: precioUnitario,
            tamano:
              cleanData.tamano ||
              pedidoActual?.detalles?.[0]?.tamano ||
              'Mediano',
            leche:
              cleanData.leche || pedidoActual?.detalles?.[0]?.leche || 'No',
            escencia:
              cleanData.escencia || pedidoActual?.detalles?.[0]?.escencia || '',
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

      e.promise = this.cafeService
        .updateOrder(id, cleanData)
        .then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: '¡Pedido actualizado correctamente!',
          });
        })
        .catch((err) => {
          console.error('Error al actualizar pedido:', err);
          throw err;
        });
    }
  }

  onSavingGrid(e: any) {
    const change = e.changes[0];
    if (!change) return;

    if (change.type === 'insert') {
      const data = { ...change.data, fecha: new Date(change.data.fecha) };
      e.promise = this.cafeService.addCalendarEvent(data);
    } else if (change.type === 'update') {
      this.cafeService
        .updateCalendarEvent(change.key.id, change.data)
        .then(() => {
          //console.log('Usuario actualizado');
          Swal.fire({
            icon: 'success',
            title: 'success',
            text: 'Date list Updated Successfully!',
          });
        });
    } else if (change.type === 'remove') {
      if (change.type == 'remove') {
        const id = typeof change.key === 'string' ? change.key : change.key.id;
        this.cafeService.deleteCalendarEvent(id).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'success',
            text: 'Date list Eliminated',
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
  }

  onExporting(e: any) {}
}
