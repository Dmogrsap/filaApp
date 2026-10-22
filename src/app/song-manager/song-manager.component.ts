import { Component, OnInit, SimpleChanges } from '@angular/core';
import { SongManagerService } from '../services/song-manager.service';
import { DataType } from 'devextreme/common';
import Swal from 'sweetalert2';
import { UsersService } from '../services/usersService.service';
import { RolesService } from '../services/rolesService.service';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-song-manager',
  templateUrl: './song-manager.component.html',
  styleUrls: ['./song-manager.component.css'],
})
export class SongManagerComponent implements OnInit {
  selectedSong?: any;
  previewText: string = '';
  showOnlySunday: boolean = false;

  public loadIndicatorVisible = true;
  public datasourceSongs: any[] = [];
  public filteredSundaySongs: any[] = [];
  public filteredServidores: any[] = [];
  public filteredServidoresMusicos: any [] = [];
  public dataSourceMenusTab: any[] = [];

  public dataSourceUsers: any[] = [];
  public datasourceServidores: any[] = [];
  public dataSourceRoles: any[] = [];
  public datasourceRolesAlabanza: any[] = [];
  public selectedMusicos: any[] = [];
  public selectedMusicosIds: any[] = [];
  public popupVisible = false;

  constructor(
    private songService: SongManagerService,
    private userService: UsersService,
    private rolesService: RolesService,
    private authService: AuthServiceService
  ) {}

  ngOnInit() {
    this.dataSourceMenusTab = [
      { Nombre: 'Add/ Edit Canciones' },
      { Nombre: 'Add/ Edit Musicos' },
    ];

    this.songService.getSongs().subscribe((result) => {
      this.datasourceSongs = result.sort((a, b) =>
        a.Titulo.localeCompare(b.Titulo)
      );
      //console.log('datasourceSongs', this.datasourceSongs);
      this.filteredSundaySongs = this.datasourceSongs.filter(
        (song) => song.usaDomingo === true
      );
      this.loadIndicatorVisible = false;

      //console.log('filteredSundaySongs', this.filteredSundaySongs);
    });

    this.userService.getUsers().subscribe((result) => {
      this.updateUsersData(result);
      this.loadIndicatorVisible = false;
    });

    this.rolesService.getRoles().subscribe((result) => {
      this.dataSourceRoles = result.sort((a, b) =>
        a.Role.localeCompare(b.Role)
      );
      //console.log('dataSourceRoles', this.dataSourceRoles);
      for (let i = 0; i < this.dataSourceRoles.length; i++) {
        this.datasourceRolesAlabanza = this.dataSourceRoles.filter((role) => {
          // Convierte el rol a minúsculas para una comparación insensible a mayúsculas/minúsculas
          const alabanzaRole = role.Role ? role.Role.toLowerCase() : ''; // Manejo de caso si 'Role' es undefined/null

          // Verifica si el rol es 'pastor' (exacto) o si incluye 'lider'
          //return liderRole === 'alabanza' || liderRole.includes('Lider');
          return (
            alabanzaRole === 'alabanza' || alabanzaRole.includes('alabanza')
          );
        });
      }
      console.log('datasourceRolesAlabanza', this.datasourceRolesAlabanza);
    });
  }

  private updateUsersData(users: any[]) {
    this.dataSourceUsers = [...users].sort((a, b) =>
      (a.Nombre || '').localeCompare(b.Nombre || '')
    );
    this.filteredServidoresMusicos = this.dataSourceUsers.filter(
      (servidor) => servidor.tocaDomingo === true
    );
    this.datasourceServidores = this.dataSourceUsers.filter((user) =>
      Array.isArray(user.Role) &&
      user.Role.some((role: string) =>
        typeof role === 'string' && role.toLowerCase().includes('alabanza')
      )
    );
    this.filteredServidores = this.datasourceServidores.filter(
      (servidor) => servidor.tocaDomingo === true
    );
  }

  onExporting(e: any) {
    // const workbook = new ExcelJS.Workbook();
    // const worksheet = workbook.addWorksheet('Main sheet');
    // exportDataGrid({
    //   component: e.component,
    //   worksheet: worksheet,
    //   customizeCell: function (options) {
    //     options.excelCell.font = { name: 'Segoe UI light', size: 12 };
    //     options.excelCell.alignment = { horizontal: 'center' };
    //   },
    // }).then(function () {
    //   workbook.xlsx.writeBuffer().then(function (buffer: BlobPart) {
    //     saveAs(
    //       new Blob([buffer], { type: 'application/octet-stream' }),
    //       'Users.xlsx'
    //     );
    //   });
    // });
    // e.cancel = true;
  }

  getDisplayExpr(item: any) {
    if (!item) {
      return '';
    }
    return `$ ${item.Nombre}, `;
  }

  onSelectionChanged(
    selectedRowKeys: any,
    cellInfo: any,
    dropDownBoxComponent: any
  ) {
    cellInfo.value = selectedRowKeys[0];
    if (selectedRowKeys.length > 0) {
      dropDownBoxComponent.close();
    }
  }


  // Guardar cambios en canciones
  onSavingSongs(e: any) {
    const change = e.changes[0];
    if (change) {
      e.cancel = false;
    }
    if (change.type == 'insert') {
      const cleanData = { ...change.data };
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });
      this.songService.addSongs(cleanData).then((docRef) => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Song Added Successfully!',
        });
        this.songService.getSongs().subscribe((result) => {
          this.datasourceSongs = result.sort((a, b) =>
            a.Nombre.localeCompare(b.Nombre)
          );
        });
      });
    }
    if (change.type == 'update') {
      const cleanData = { ...change.data };
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });
      this.songService.updateSongs(change.key.id, cleanData).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Song Updated Successfully!',
        });
      });
    }
    if (change.type == 'remove') {
      const id = typeof change.key === 'string' ? change.key : change.key.id;
      this.songService.deleteSongs(id).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Song Eliminated',
        });
        this.songService.getSongs().subscribe((result) => {
          this.datasourceSongs = result.sort((a, b) =>
            a.Nombre.localeCompare(b.Nombre)
          );
        });
      });
    }
  }

  // Guardar cambios en músicos/servidores
  onSavingServidores(e: any) {
    const change = e.changes?.[0];
    if (!change) {
      return;
    }

    e.cancel = true;
    const cleanData = { ...(change.data || {}) };
    Object.keys(cleanData).forEach((key) => {
      if (/^__.*__$/.test(key)) {
        delete cleanData[key];
      }
    });

    let savePromise: Promise<unknown>;
    if (change.type === 'insert') {
      savePromise = this.userService.addUser(cleanData).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Músico agregado exitosamente!',
        });
      });
    } else if (change.type === 'update') {
      const id = typeof change.key === 'string' ? change.key : change.key?.id;
      if (!id) {
        savePromise = Promise.reject(new Error('El usuario no tiene un identificador válido.'));
      } else {
        savePromise = this.userService.updateUser(id, cleanData).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'success',
            text: 'Músico actualizado exitosamente!',
          });
          // Proteger el estado del usuario logueado
          const currentUserName = this.authService.currentUser?.nombre;
          if (currentUserName && cleanData.Nombre === currentUserName) {
            // Si se editó el usuario logueado, actualizar roles si cambiaron
            if (cleanData.Role) {
              let roleNames: string[] = [];
              if (typeof cleanData.Role === 'string') {
                roleNames = cleanData.Role
                  .split(',')
                  .map((role: string) => role.trim())
                  .filter((role: string) => role);
              } else if (Array.isArray(cleanData.Role)) {
                roleNames = cleanData.Role.filter(
                  (role: any) => typeof role === 'string'
                );
              } else if (typeof cleanData.Role === 'object') {
                roleNames = [
                  cleanData.Role.roleName ||
                    cleanData.Role.name ||
                    cleanData.Role.Nombre,
                ].filter((role: any) => role);
              }
              this.authService.setUserRoles(roleNames);
            }
          }
        });
      }
    } else if (change.type === 'remove') {
      const id = typeof change.key === 'string' ? change.key : change.key?.id;
      if (!id) {
        savePromise = Promise.reject(new Error('El usuario no tiene un identificador válido.'));
      } else {
        savePromise = this.userService.deleteUser(id).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'success',
            text: 'Músico eliminado',
          });
        });
      }
    } else {
      return;
    }

    e.promise = savePromise.catch((error) => {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar',
        text: 'Ocurrió un error al guardar los cambios del músico. Inténtalo de nuevo.',
      });
      throw error;
    });
  }



  onRowClick(e: any) {
    this.selectedSong = e.data;
    this.previewText = `Título: ${e.data.Titulo}\n \nAcordes: \n\n ${e.data.Acordes}\n \nLetra: \n\n ${e.data.Letra}`;
  }

  downloadSongPdf() {
    if (!this.selectedSong) {
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo abrir la impresión',
        text: 'Permite las ventanas emergentes e inténtalo de nuevo.',
      });
      return;
    }

    const document = printWindow.document;
    document.title = this.selectedSong.Titulo || 'Canción';
    document.body.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      @page { margin: 18mm; }
      body { color: #111; font-family: Arial, sans-serif; }
      h1 { font-size: 22px; margin: 0 0 20px; }
      h2 { font-size: 16px; margin: 18px 0 8px; }
      pre {
        font-family: Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.5;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        margin: 0;
      }
    `;
    document.head.appendChild(style);

    const title = document.createElement('h1');
    title.textContent = this.selectedSong.Titulo || 'Canción';
    document.body.appendChild(title);

    [
      { heading: 'Acordes', content: this.selectedSong.Acordes },
      { heading: 'Letra', content: this.selectedSong.Letra },
    ].forEach(({ heading, content }) => {
      const sectionHeading = document.createElement('h2');
      sectionHeading.textContent = heading;
      document.body.appendChild(sectionHeading);

      const sectionContent = document.createElement('pre');
      sectionContent.textContent = content || '';
      document.body.appendChild(sectionContent);
    });

    printWindow.onafterprint = () => printWindow.close();
    printWindow.focus();
    printWindow.print();
  }

  onSelect(e: any) {
    this.selectedSong = e.selectedRowsData[0];
    this.previewText = '';
  }

  // get filteredSongs() {
  //   return this.showOnlySunday
  //     ? this.datasourceSongs.filter((song) => song.isActive)
  //     : this.datasourceSongs;
  // }

  get previewTitulo() {
    return this.selectedSong ? this.selectedSong.Titulo : '';
  }
  get previewAcordes() {
    return this.selectedSong ? this.selectedSong.Acordes : '';
  }
  get previewLetra() {
    return this.selectedSong ? this.selectedSong.Letra : '';
  }
}
