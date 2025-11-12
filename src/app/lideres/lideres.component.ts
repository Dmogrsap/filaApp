import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/usersService.service';
import { RolesService } from '../services/rolesService.service';
import Swal from 'sweetalert2';
import { exportDataGrid } from 'devextreme/excel_exporter';
import * as saveAs from 'file-saver';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-lideres',
  templateUrl: './lideres.component.html',
  styleUrls: ['./lideres.component.css'],
})
export class LideresComponent implements OnInit {
  public dataSourceUsers: any[] = [];
  public dataSourceRoles: any[] = [];
  public datasourceLideres: any[] = [];
  public datasourceRolesLider: any[] = [];
  public loadIndicatorVisible = true;

  constructor(
    private userService: UsersService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((result) => {
      this.dataSourceUsers = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre)
      );
      this.loadIndicatorVisible = false;
      //console.log('dataSourceUsers', this.dataSourceUsers);

      this.datasourceLideres = [];

      for (let i = 0; i < this.dataSourceUsers.length; i++) {
        for (let j = 0; j < this.dataSourceUsers[i].Role.length; j++) {
          const userRole = this.dataSourceUsers[i].Role[j].toLowerCase();
          if (userRole.includes('pastor') || userRole.includes('Pastor') || userRole.includes('lider') || userRole.includes('Lider')) {
            this.datasourceLideres.push(this.dataSourceUsers[i]);
            break; // Si ya encontramos un rol coincidente, no necesitamos seguir buscando
          }
        }
      }
      console.log('datasourceLideres', this.datasourceLideres);
    });

    this.rolesService.getRoles().subscribe((result) => {
      this.dataSourceRoles = result.sort((a, b) =>
        a.Role.localeCompare(b.Role)
      );
      //console.log('dataSourceRoles', this.dataSourceRoles);
    for (let i = 0; i < this.dataSourceRoles.length; i++) {
        this.datasourceRolesLider = this.dataSourceRoles.filter((role) => {
          // Convierte el rol a minúsculas para una comparación insensible a mayúsculas/minúsculas
          const liderRole = role.Role ? role.Role.toLowerCase() : ''; // Manejo de caso si 'Role' es undefined/null

          // Verifica si el rol es 'pastor' (exacto) o si incluye 'lider'
          return liderRole === 'pastor' || liderRole.includes('lider');
        });
      }
      //console.log('datasourceLideres', this.datasourceLideres);
    });

  }
  // Additional methods for the component can be added here

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

  getDisplayExpr(item: any) {
    if (!item) {
      return '';
    }
    return `$ ${item.Nombre}, `;
  }

  onExporting(e: any) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');
    exportDataGrid({
      component: e.component,
      worksheet: worksheet,
      customizeCell: function (options) {
        options.excelCell.font = { name: 'Segoe UI light', size: 12 };
        options.excelCell.alignment = { horizontal: 'center' };
      },
    }).then(function () {
      workbook.xlsx.writeBuffer().then(function (buffer: BlobPart) {
        saveAs(
          new Blob([buffer], { type: 'application/octet-stream' }),
          'Users.xlsx'
        );
      });
    });
    e.cancel = true;
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

      this.userService.addUser(cleanData).then((docRef) => {
        //console.log('Usuario agregado con ID:', docRef.id);
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Added Successfully!',
        });

        this.userService.getUsers().subscribe((result) => {
          this.dataSourceUsers = result.sort((a, b) =>
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

      this.userService.updateUser(change.key.id, cleanData).then(() => {
        //console.log('Usuario actualizado');
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Updated Successfully!',
        });

        this.userService.getUsers().subscribe((result) => {
          this.dataSourceUsers = result.sort((a, b) =>
            a.Nombre.localeCompare(b.Nombre)
          );
        });
      });
    }

    if (change.type == 'remove') {
      const id = typeof change.key === 'string' ? change.key : change.key.id;
      this.userService.deleteUser(id).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Eliminated',
        });
        this.userService.getUsers().subscribe((result) => {
          this.dataSourceUsers = result.sort((a, b) =>
            a.Nombre.localeCompare(b.Nombre)
          );
        });
      });
    }
    if (change.type == 'refresh') {
      this.userService.getUsers().subscribe((result) => {
        this.dataSourceUsers = result.sort((a, b) =>
          a.Nombre.localeCompare(b.Nombre)
        );
      });
    }
  }
}
