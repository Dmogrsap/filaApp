import { Component, OnInit } from '@angular/core';
import { SongManagerService } from '../services/song-manager.service';
import { DataType } from 'devextreme/common';

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

  // columns =  [
  //   { dataField: 'title', caption: 'Título' },
  //   { dataField: 'selectedForSunday', caption: 'Domingo', dataType: 'boolean' }
  // ];

  constructor(private songService: SongManagerService) {}

  ngOnInit() {
    this.songService.getSongs().subscribe((result) => {
      this.datasourceSongs = result.sort((a, b) =>
        a.Titulo.localeCompare(b.Titulo)
      );
      this.loadIndicatorVisible = false;
      console.log('datasourceSongs', this.datasourceSongs);
    });
  }

  onAdd(e: any) {
    this.songService.addSongs(e.data);
  }

  onUpdate(e: any) {
    this.songService.updateSongs(e.data.id, e.data);
  }

  onDelete(e: any) {
    this.songService.deleteSongs(e.data.id);
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

  onSaving(e: any) {
    // const change = e.changes[0];
    // if (change) {
    //   e.cancel = false;
    // }
    // if (change.type == 'insert') {
    //   // Limpia los campos no válidos
    //   const cleanData = { ...change.data };
    //   Object.keys(cleanData).forEach((key) => {
    //     if (/^__.*__$/.test(key)) {
    //       delete cleanData[key];
    //     }
    //   });
    //   this.userService.addUser(cleanData).then((docRef) => {
    //     //console.log('Usuario agregado con ID:', docRef.id);
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'success',
    //       text: 'User Added Successfully!',
    //     });
    //     this.userService.getUsers().subscribe((result) => {
    //       this.dataSourceUsers = result.sort((a, b) =>
    //         a.Nombre.localeCompare(b.Nombre)
    //       );
    //     });
    //   });
    // }
    // if (change.type == 'update') {
    //   // Limpia los campos no válidos
    //   const cleanData = { ...change.data };
    //   Object.keys(cleanData).forEach((key) => {
    //     if (/^__.*__$/.test(key)) {
    //       delete cleanData[key];
    //     }
    //   });
    //   this.userService.updateUser(change.key.id, cleanData).then(() => {
    //     //console.log('Usuario actualizado');
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'success',
    //       text: 'User Updated Successfully!',
    //     });
    //     this.userService.getUsers().subscribe((result) => {
    //       this.dataSourceUsers = result.sort((a, b) =>
    //         a.Nombre.localeCompare(b.Nombre)
    //       );
    //     });
    //   });
    // }
    // if (change.type == 'remove') {
    //   const id = typeof change.key === 'string' ? change.key : change.key.id;
    //   this.userService.deleteUser(id).then(() => {
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'success',
    //       text: 'User Eliminated',
    //     });
    //     this.userService.getUsers().subscribe((result) => {
    //       this.dataSourceUsers = result.sort((a, b) =>
    //         a.Nombre.localeCompare(b.Nombre)
    //       );
    //     });
    //   });
    // }
    // if (change.type == 'refresh') {
    //   this.userService.getUsers().subscribe((result) => {
    //     this.dataSourceUsers = result.sort((a, b) =>
    //       a.Nombre.localeCompare(b.Nombre)
    //     );
    //   });
    // }
  }

  onRowClick(e: any) {
    this.selectedSong = e.data;
    this.previewText = `Título: ${e.data.Titulo}\nAcordes: ${e.data.Acordes}\nLetra:\n${e.data.Letra}`;
  }

  onSelect(e: any) {
    this.selectedSong = e.selectedRowsData[0];
    this.previewText = '';
  }

  get filteredSongs() {
    return this.showOnlySunday
      ? this.datasourceSongs.filter((song) => song.isActive)
      : this.datasourceSongs;
  }
}
