# TODO: Agregar Popup para Mostrar Imagen al Hacer Click en Fila

## Pasos a Realizar
- [ ] Editar `src/app/edit-home/edit-home.component.html` para agregar el evento `onRowClick` al `dx-data-grid` y el componente `dx-popup`.
- [ ] Editar `src/app/edit-home/edit-home.component.ts` para agregar propiedades `selectedImage`, `popupVisible` y el método `onRowClick`.
- [ ] Verificar que `DxPopupModule` esté importado en `app.module.ts` (si no, agregarlo).
- [ ] Probar la funcionalidad del popup en el navegador.

## Información Recopilada
- El componente `edit-home` muestra una lista de imágenes en un `dx-data-grid` con columnas para nombre, descripción, fecha e imagen.
- Las imágenes tienen propiedades como `url`, `name`, etc.
- Se usará `dx-popup` de DevExtreme para mostrar la imagen en tamaño mediano (aprox. 600x400px) con el nombre como título.

## Plan Detallado
- En `edit-home.component.html`:
  - Agregar `(onRowClick)="onRowClick($event)"` al `dx-data-grid`.
  - Agregar un `<dx-popup>` con `[visible]="popupVisible"`, título dinámico con el nombre de la imagen, y contenido con la imagen en tamaño mediano.
- En `edit-home.component.ts`:
  - Agregar propiedades: `selectedImage: any; popupVisible = false;`.
  - Agregar método `onRowClick(event: any)` para setear `selectedImage` y mostrar el popup.
- Dependencias: Asegurar que `DxPopupModule` esté en `app.module.ts`.

## Seguimiento de Progreso
- [x] Paso 1 completado: Agregado onRowClick al dx-data-grid y dx-popup en HTML.
- [x] Paso 2 completado: Agregadas propiedades selectedImage, popupVisible y método onRowClick en TS.
- [x] Paso 3 completado: DxPopupModule ya está importado en app.module.ts.
- [x] Paso 4 completado: Build exitoso, funcionalidad lista para probar en navegador.
