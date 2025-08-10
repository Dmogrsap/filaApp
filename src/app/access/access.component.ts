import { Component, OnInit } from '@angular/core';
import { MainMenuService } from '../services/main-menuService.service';
import { AccessService } from '../services/access.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.css'],
})
export class AccessComponent implements OnInit {
  public dataSourceMenus: any[] = [];
  public dataSourcesubMenus: any[] = [];
  public dataSourceMenusTab: any[] = [];
  loadIndicatorVisible = true;
  selectedRows: [] = [];

  constructor(private mainMenu: MainMenuService, private accessService: AccessService) {}

  ngOnInit(): void {
    this.dataSourceMenusTab = [{ Nombre: 'Add/ Edit Menus' }, { Nombre: 'Add/ Edit subMenus' }];

    this.accessService.getMenus().subscribe((result) => {
      this.dataSourceMenus = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre)
      );
      this.loadIndicatorVisible = false;
      //console.log('DataSource', this.dataSourceMenus);
    });

    this.accessService.getsubMenus().subscribe((result) => {
      this.dataSourcesubMenus = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre)
      );
      this.loadIndicatorVisible = false;
      //console.log('DataSourceSubMenus', this.dataSourcesubMenus);
    });
  }

  onSaving(e: any) {
    const change = e.changes[0];
    // this.userService.getUsers().subscribe((result) => {
    //   this.dataSourceUsers = result;
    // });
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
      this.accessService.addMenus(cleanData).then((docRef) => {
        //console.log('Usuario agregado con ID:', docRef.id);
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Added Successfully!',
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
      this.accessService.updateMenus(change.key.id, cleanData).then(() => {
        //console.log('Usuario actualizado');
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Updated Successfully!',
        });
      });
    }
    if (change.type == 'remove') {
      const id = typeof change.key === 'string' ? change.key : change.key.id;
      this.accessService.deleteMenus(id).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Eliminated',
        });
      });
    }
    if (change.type == 'refresh') {
      this.accessService.getMenus().subscribe((result) => {
        this.dataSourceMenus = result.sort((a, b) =>
          a.Role.localeCompare(b.Role)
        );
      });
    }
  }

  onSaving1(e: any) {
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
      this.accessService.addSubMenus(cleanData).then((docRef) => {
        //console.log('Usuario agregado con ID:', docRef.id);
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Added Successfully!',
        });
      });
    }
    // if (change.type == 'update') {
    //   // Limpia los campos no válidos
    //   const cleanData = { ...change.data };
    //   Object.keys(cleanData).forEach((key) => {
    //     if (/^__.*__$/.test(key)) {
    //       delete cleanData[key];
    //     }
    //   });
    //   this.rolesService.updateRoles(change.key.id, cleanData).then(() => {
    //     //console.log('Usuario actualizado');
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'success',
    //       text: 'User Updated Successfully!',
    //     });
    //     this.rolesService.getRoles().subscribe((result) => {
    //       this.dataSourceRoles = result.sort((a, b) =>
    //         a.Role.localeCompare(b.Role)
    //       );
    //       //console.log('Roles', this.dataSourceRoles);
    //     });
    //   });
    // }
    // if (change.type == 'remove') {
    //   const id = typeof change.key === 'string' ? change.key : change.key.id;
    //   this.rolesService.deleteRoles(id).then(() => {
    //     Swal.fire({
    //       icon: 'success',
    //       title: 'success',
    //       text: 'User Eliminated',
    //     });
    //     this.rolesService.getRoles().subscribe((result) => {
    //       this.dataSourceRoles = result.sort((a, b) =>
    //         a.Role.localeCompare(b.Role)
    //       );
    //       console.log('Roles', this.dataSourceRoles);
    //     });
    //   });
    // }
    // if (change.type == 'refresh') {
    //   this.rolesService.getRoles().subscribe((result) => {
    //     this.dataSourceRoles = result.sort((a, b) =>
    //       a.Role.localeCompare(b.Role)
    //     );
    //   });
    // }
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
    //   }
    // }).then(function () {
    //   workbook.xlsx.writeBuffer()
    //     .then(function (buffer: BlobPart) {
    //       saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Accesses.xlsx');
    //     });
    // });
    // e.cancel = true;
  }
}
