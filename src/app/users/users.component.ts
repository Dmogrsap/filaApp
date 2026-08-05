import { Component, OnInit, ViewChild } from '@angular/core';
import { UsersService } from '../services/usersService.service';
import { DxDataGridComponent } from 'devextreme-angular';
import * as ExcelJS from 'exceljs';
import { exportDataGrid } from 'devextreme/excel_exporter';
import * as saveAs from 'file-saver';
import { RolesService } from '../services/rolesService.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  public dataSourceUsers: any[] = [];
  public dataSourceRoles: any[] = [];
  public dataSource: any[] = [];
  public usersAdmin: any[] = [];
  public usersMultimedia: any[] = [];
  loadIndicatorVisible = true;
  selectedUser: any;
  /*--------datasource--------*/
  customersData: any;
  refreshMode: string;
  editRowKey?: number;
  /*--------datasource--------*/

  @ViewChild(DxDataGridComponent, { static: false }) grid:
    | DxDataGridComponent
    | any;
  selectedRowIndex = -1;

  constructor(
    private userService: UsersService,
    private rolesService: RolesService
  ) {
    this.refreshMode = 'reshape';
  }

  ngOnInit() {
    this.userService.getUsers().subscribe((result) => {
      const normalizedUsers = result.map((user: any) => ({
        ...user,
        Role: this.normalizeRole(user.Role),
      }));

      this.dataSourceUsers = normalizedUsers.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre)
      );
      this.loadIndicatorVisible = false;
      //console.log('DataSource', this.dataSourceUsers);

      this.usersMultimedia = [];
      for (let i = 0; i < this.dataSourceUsers.length; i++) {
        // Filter users with the role of "Servidor Multimedia"
        if (this.dataSourceUsers[i].Role === 'Servidor Multimedia') {
          this.usersMultimedia.push(this.dataSourceUsers[i]);
        }
      }

      //console.log('usersMultimedia', this.usersMultimedia);
    });

    this.rolesService.getRoles().subscribe((result) => {
      this.dataSourceRoles = result.sort((a, b) => a.Role.localeCompare(b.Role));
      //console.log('dataSourceRoles', this.dataSourceRoles);
    });
  }

  normalizeRole(role: any) {
    if (Array.isArray(role)) {
      return role.filter((item) => typeof item === 'string').join(', ');
    }

    if (typeof role === 'object' && role !== null) {
      return role.Role || role.roleName || role.name || '';
    }

    return typeof role === 'string' ? role : '';
  }

  normalizeRoleField(data: any) {
    if (!data) {
      return data;
    }

    if (data.Role !== undefined) {
      data.Role = this.normalizeRole(data.Role);
    }

    return data;
  }

  valueChanged(data: any) {
    this.selectedUser = data.value;
    //console.log("this.selectedEmployee",this.selectedEmployee)
  }

  getDisplayExpr(item: any) {
    if (!item) {
      return '';
    }
    return `$ ${item.Nombre}, `;
  }

  getRoleValue(rowData: any) {
    const role = rowData?.Role;
    if (Array.isArray(role)) {
      return role.join(', ');
    }
    if (typeof role === 'object' && role !== null) {
      return role.Role || role.roleName || role.name || '';
    }
    return role || '';
  }

  calculateRoleFilterExpression(filterValue: any, selectedFilterOperation: string, target: any) {
    const roleValue = target;
    if (Array.isArray(roleValue)) {
      return roleValue.includes(filterValue);
    }

    if (typeof roleValue === 'object' && roleValue !== null) {
      const value = roleValue.Role || roleValue.roleName || roleValue.name || '';
      return value === filterValue;
    }

    return roleValue === filterValue;
  }

  // onSelectionChanged(
  //   selectedRowKeys: any,
  //   cellInfo: any,
  //   dropDownBoxComponent: any
  // ) {
  //   cellInfo.setValue(selectedRowKeys[0]);
  //   if (selectedRowKeys.length > 0) {
  //     dropDownBoxComponent.close();
  //   }
  // }

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
      this.normalizeRoleField(cleanData);

      this.userService.addUser(cleanData).then((docRef) => {
        //console.log('Usuario agregado con ID:', docRef.id);
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Added Successfully!',
        });

        this.userService.getUsers().subscribe((result) => {
          this.dataSourceUsers = result.sort((a, b) => a.Nombre.localeCompare(b.Nombre));;
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
      this.normalizeRoleField(cleanData);

      this.userService.updateUser(change.key.id, cleanData).then(() => {
        //console.log('Usuario actualizado');
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Updated Successfully!',
        });

        this.userService.getUsers().subscribe((result) => {
          this.dataSourceUsers = result.sort((a, b) => a.Nombre.localeCompare(b.Nombre));;
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
          this.dataSourceUsers = result.sort((a, b) => a.Nombre.localeCompare(b.Nombre));;
        });
      });
    }
    if (change.type == 'refresh') {
      this.userService.getUsers().subscribe((result) => {
        this.dataSourceUsers = result.sort((a, b) => a.Nombre.localeCompare(b.Nombre));;
      });
    }
  }

  onExporting(e: any) {
    /*const workbook = new ExcelJS.Workbook();
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
    e.cancel = true;*/
  }
}
