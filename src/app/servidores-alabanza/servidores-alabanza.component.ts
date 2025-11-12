import { Component, OnInit } from '@angular/core';
import { ServidoresAlabanzaService } from '../services/servidores-alabanza.service';
import { RolesService } from '../services/rolesService.service';
import { UsersService } from '../services/usersService.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-servidores-alabanza',
  templateUrl: './servidores-alabanza.component.html',
  styleUrls: ['./servidores-alabanza.component.css'],
})
export class ServidoresAlabanzaComponent implements OnInit {
  public dataSourceUsers: any[] = [];
  public dataSourceRoles: any[] = [];
  public datasourceServidores: any[] = [];
  public datasourceRolesLider: any[] = [];
  public loadIndicatorVisible = true;

  constructor(
    private servidoresAlabanzaService: ServidoresAlabanzaService,
    private userService: UsersService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((result) => {
      this.dataSourceUsers = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre)
      );
      this.loadIndicatorVisible = false;
      //console.log('DataSource', this.dataSourceUsers);

      this.datasourceServidores = [];

     for (let i = 0; i < this.dataSourceUsers.length; i++) {
        for (let j = 0; j < this.dataSourceUsers[i].Role.length; j++) {
          const userRole = this.dataSourceUsers[i].Role[j].toLowerCase();
          if (userRole.includes('alabanza') || userRole.includes('Alabanza') ) {
            this.datasourceServidores.push(this.dataSourceUsers[i]);
            break; // Si ya encontramos un rol coincidente, no necesitamos seguir buscando
          }
        }
      }
      console.log('datasourceServidores', this.datasourceServidores);
      //console.log('datasourceServidores', this.datasourceServidores);
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

          // Verifica si el rol es 'Lider Alabanzaor' (exacto) o si incluye 'Musico'
          return (
            liderRole === 'Lider Alabanza' || liderRole.includes('alabanza') 
          );
        });
      }
      //console.log('datasourceLideres', this.datasourceLideres);
    });
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

  getDisplayExpr(item: any) {
    if (!item) {
      return '';
    }
    return `$ ${item.Nombre}, `;
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
          text: 'Servidor Added Successfully!',
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
          text: 'Servidor Updated Successfully!',
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
          text: 'Servidor Eliminated',
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

  onExporting(e: any) {}
}
