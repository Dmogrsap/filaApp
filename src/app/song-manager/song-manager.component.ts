import { Component, OnInit, SimpleChanges } from '@angular/core';
import { SongManagerService } from '../services/song-manager.service';
import { DataType } from 'devextreme/common';
import Swal from 'sweetalert2';
import { UsersService } from '../services/usersService.service';

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
  public dataSourceMenusTab: any[] = [];
  

  public dataSourceUsers: any[] = [];
  public datasourceServidores: any[] = [];
  public datasourceRolesLider: any[] = [];
  public selectedMusicos: any[] = [];
  public selectedMusicosIds: any[] = [];
  public popupVisible = false;

  constructor(
    private songService: SongManagerService,
    private userService: UsersService
  ) {}

  ngOnInit() {

    this.dataSourceMenusTab = [{ Nombre: 'Add/ Edit Canciones' }, { Nombre: 'Add/ Edit Musicos' }];


    // this.songService.getSongs().subscribe((result) => {
    //   this.datasourceSongs = result.sort((a, b) =>
    //     a.Titulo.localeCompare(b.Titulo)
    //   );

    //   if (this.showOnlySunday == false || this.showOnlySunday === undefined) {
    //     this.filteredSundaySongs = this.datasourceSongs.filter(
    //       (song) => song.usaDomingo === true
    //     );
    //   } else {
    //   }
    //   this.loadIndicatorVisible = false;
    // });

    // this.userService.getUsers().subscribe((result) => {
    //   this.dataSourceUsers = result.sort((a, b) =>
    //     a.Nombre.localeCompare(b.Nombre)
    //   );
    //   this.loadIndicatorVisible = false;
    //   //console.log('DataSource', this.dataSourceUsers);

    //   this.datasourceServidores = [];

    //   for (let i = 0; i < this.dataSourceUsers.length; i++) {
    //     // this.datasourceServidores = this.dataSourceUsers.filter((user) => {
    //     //   // Convierte el rol a minúsculas para una comparación insensible a mayúsculas/minúsculas
    //     //   const userRole = user.Role ? user.Role.toLowerCase() : ''; // Manejo de caso si 'Role' es undefined/null

    //     //   // Verifica si el rol incluye 'alabanza'
    //     //   return userRole.includes('alabanza');
    //     // });

    //     this.datasourceServidores = this.dataSourceUsers
    //       .filter((user) => {
    //         const userRole = user.Role ? user.Role.toLowerCase() : '';
    //         return userRole.includes('alabanza');
    //       })
    //       .map((user) => ({
    //         ...user,
    //         id: user.id || user.uid, // usa el campo correcto de tu base
    //       }));
    //   }
    //   console.log('datasourceServidores', this.datasourceServidores);
    // });

    //console.log('filteredSundaySongs', this.filteredSundaySongs);
    this.songService.getSongs().subscribe((result) => {
      this.datasourceSongs = result.sort((a, b) =>
        a.Titulo.localeCompare(b.Titulo)
      );
      console.log('datasourceSongs', this.datasourceSongs);
      this.filteredSundaySongs = this.datasourceSongs.filter(
        (song) => song.usaDomingo === true
      );
      this.loadIndicatorVisible = false;

  //console.log('filteredSundaySongs', this.filteredSundaySongs);
    });

    this.userService.getUsers().subscribe((result) => {
      this.dataSourceUsers = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre)
      );
      // Llena una sola vez y asegura el campo 'id'
      // this.datasourceServidores = this.dataSourceUsers
      //   .filter((user) => {
      //     const userRole = user.Role ? user.Role.toLowerCase() : '';
      //     return userRole.includes('alabanza');
      //   })
      //   .map((user) => ({
      //   ...user,
      //   id: user.id || user.uid || user.ID || user.Id || Math.random().toString(36).substr(2, 9), // genera uno si no existe
      // }))
      //   .filter((user) => user.id); // elimina los que no tengan id

      // console.log('datasourceServidores', this.datasourceServidores);

      this.datasourceServidores = this.dataSourceUsers
        .filter((user) => {
          const userRole = user.Role ? user.Role.toLowerCase() : '';
          return userRole.includes('alabanza');
        })
        .map((user) => ({
          ...user,
          id:
            user.id ||
            user.uid ||
            user.ID ||
            user.Id ||
            Math.random().toString(36).substr(2, 9), // genera uno si no existe
        }))
        .filter((user) => user.id); // elimina los que no tengan id

        this.filteredServidores = this.datasourceServidores.filter(
        (servidor) => servidor.tocaDomingo === true

        //console.log('filteredServidores', this.filteredServidores);
      );
      console.log('filteredServidores', this.filteredServidores);
      this.loadIndicatorVisible = false;
    });
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
      this.songService.addSongs(cleanData).then((docRef) => {
        //console.log('Usuario agregado con ID:', docRef.id);
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
      // Limpia los campos no válidos
      const cleanData = { ...change.data };
      Object.keys(cleanData).forEach((key) => {
        if (/^__.*__$/.test(key)) {
          delete cleanData[key];
        }
      });
      this.songService.updateSongs(change.key.id, cleanData).then(() => {
        //console.log('Usuario actualizado');
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'Song Updated Successfully!',
        });
        // this.songService.getSongs().subscribe((result) => {
        //   this.datasourceSongs = result.sort((a, b) =>
        //     a.Nombre.localeCompare(b.Nombre)
        //   );
        // });
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

  onRowClick(e: any) {
    this.selectedSong = e.data;
    this.previewText = `Título: ${e.data.Titulo}\n \nAcordes: \n\n ${e.data.Acordes}\n \nLetra: \n\n ${e.data.Letra}`;
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
