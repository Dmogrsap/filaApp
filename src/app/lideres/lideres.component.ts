import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/usersService.service';
import { RolesService } from '../services/rolesService.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lideres',
  templateUrl: './lideres.component.html',
  styleUrls: ['./lideres.component.css'],
})
export class LideresComponent implements OnInit {
  public dataSourceUsers: any[] = [];
  public dataSourceRoles: any[] = [];
  public datasourceLideres: any[] = [];
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
      //console.log('DataSource', this.dataSourceUsers);

      this.datasourceLideres = [];

      for (let i = 0; i < this.dataSourceUsers.length; i++) {
      
          this.datasourceLideres = this.dataSourceUsers.filter((user) => {
            // Convierte el rol a minúsculas para una comparación insensible a mayúsculas/minúsculas
            const userRole = user.Role ? user.Role.toLowerCase() : ''; // Manejo de caso si 'Role' es undefined/null

            // Verifica si el rol es 'pastor' (exacto) o si incluye 'lider'
            return userRole === 'pastor' || userRole.includes('lider');
          });
      }
      console.log('datasourceLideres', this.datasourceLideres);
    });


    this.rolesService.getRoles().subscribe((result) => {
      this.dataSourceRoles = result.sort((a, b) =>
        a.Role.localeCompare(b.Role)
      );
      //console.log('dataSourceRoles', this.dataSourceRoles);
    });
  }



  // Additional methods for the component can be added here
}
