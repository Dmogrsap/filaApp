import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/usersService.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { RolesService } from '../services/rolesService.service';

@Component({
  selector: 'app-calendario-materiales',
  templateUrl: './calendario-materiales.component.html',
  styleUrls: ['./calendario-materiales.component.css']
})
export class CalendarioMaterialesComponent implements OnInit {
  dataSourceUsers: any[] = [];
  datasourceServidores: any[] = [];
  dataSourceRoles: any[] = [];
  datasourceRolesLider: any[] = [];
  calendario: any[] = [];
  fechas: string[] = [];
  nuevaFecha: string = '';
  participantes: any[] = [];
  loadIndicatorVisible: boolean = true;

  constructor(private userService: UsersService, private rolesService: RolesService) {}

  ngOnInit() {
    // Cargar maestros/maestras
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
            if (userRole.includes('Maestra (o)') || userRole.includes('Maestro') ) {
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
              liderRole === 'Lider Maestras (os)' || liderRole.includes('Maestra (o)') 
            );
          });
        }
        //console.log('datasourceLideres', this.datasourceLideres);
      });

    // Inicializar calendario vacío
    this.calendario = [];
  }

  agregarFecha() {
    if (this.nuevaFecha && !this.fechas.includes(this.nuevaFecha)) {
      this.fechas.push(this.nuevaFecha);
      this.calendario.push({ fecha: this.nuevaFecha, participantes: [] });
      this.nuevaFecha = '';
    }
  }

  asignarParticipantes(event: any, data: any) {
    data.participantes = event.value;
  }
}


