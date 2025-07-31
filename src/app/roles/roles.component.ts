import { Component, OnInit } from '@angular/core';
import { RolesService } from '../services/rolesService.service';
import Swal from 'sweetalert2';
import { exportDataGrid } from 'devextreme/excel_exporter';
import * as saveAs from 'file-saver';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})
export class RolesComponent implements OnInit {
  customersData: any;
  refreshMode: string | undefined;
  userInformation: string = 'Daniel Ortega';

  public dataSourceRoles: any[] = [];
  loadIndicatorVisible = true;

  constructor(private rolesService: RolesService) {
    this.refreshMode = 'reshape';
  }

  ngOnInit(): void {
    this.rolesService.getRoles().subscribe((result) => {
      this.dataSourceRoles = result.sort((a, b) =>
        a.Role.localeCompare(b.Role)
      );
      this.loadIndicatorVisible = false;
      //console.log('Roles', this.dataSourceRoles);
    });
      
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

      this.rolesService.addRoles(cleanData).then((docRef) => {
        //console.log('Usuario agregado con ID:', docRef.id);
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Added Successfully!',
        });

        this.rolesService.getRoles().subscribe((result) => {
          this.dataSourceRoles = result.sort((a, b) =>
            a.Role.localeCompare(b.Role)
          );
          console.log('Roles', this.dataSourceRoles);
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

      this.rolesService.updateRoles(change.key.id, cleanData).then(() => {
        //console.log('Usuario actualizado');
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Updated Successfully!',
        });

        this.rolesService.getRoles().subscribe((result) => {
          this.dataSourceRoles = result.sort((a, b) =>
            a.Role.localeCompare(b.Role)
          );
          //console.log('Roles', this.dataSourceRoles);
        });
      });
    }

    if (change.type == 'remove') {
      const id = typeof change.key === 'string' ? change.key : change.key.id;
      this.rolesService.deleteRoles(id).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'success',
          text: 'User Eliminated',
        });
        this.rolesService.getRoles().subscribe((result) => {
          this.dataSourceRoles = result.sort((a, b) =>
            a.Role.localeCompare(b.Role)
          );
          console.log('Roles', this.dataSourceRoles);
        });
      });
    }
    if (change.type == 'refresh') {
      this.rolesService.getRoles().subscribe((result) => {
        this.dataSourceRoles = result.sort((a, b) =>
          a.Role.localeCompare(b.Role)
        );
      });
    }
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
}
