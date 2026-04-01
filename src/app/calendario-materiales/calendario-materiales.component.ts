
import { Component, OnInit } from '@angular/core';
import { SupabaseStorageService } from '../services/supabase-storage.service';
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
  selectedFile: File | null = null;
  selectedFileUrl: any = null;
  selectedFileType: string = '';
  officeViewerUrl: string = '';
  subiendoArchivo: boolean = false;
  archivoUrlSupabase: string = '';
  archivoTipoSupabase: string = '';
  officeViewerUrlSupabase: string = '';
  archivosSubidos: { path: string; url: string; name?: string; created_at?: string | null }[] = [];
    tabs = [
    { text: 'Calendario' },
    { text: 'Visor de Archivos' }
  ];
  selectedTabIndex = 0;

  constructor(
    private userService: UsersService,
    private rolesService: RolesService,
    private supabaseStorage: SupabaseStorageService
  ) {}

  ngOnInit() {
    this.cargarArchivosSubidos();
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

  async cargarArchivosSubidos() {
    try {
      this.archivosSubidos = await this.supabaseStorage.listFiles('documentos');
    } catch (err) {
      this.archivosSubidos = [];
    }
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

  onFileSelected(event: any) {
    const file = event.value[0];
    this.archivoUrlSupabase = '';
    this.archivoTipoSupabase = '';
    this.officeViewerUrlSupabase = '';
    if (!file) {
      this.selectedFile = null;
      this.selectedFileUrl = null;
      this.selectedFileType = '';
      this.officeViewerUrl = '';
      return;
    }
    this.selectedFile = file;
    const fileType = file.type;
    // Detectar tipo de archivo
    if (fileType.startsWith('image/')) {
      this.selectedFileType = 'image';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      this.officeViewerUrl = '';
    } else if (fileType === 'application/pdf') {
      this.selectedFileType = 'pdf';
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFileUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      this.officeViewerUrl = '';
    } else if (
      file.name.endsWith('.doc') || file.name.endsWith('.docx') ||
      file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ||
      file.name.endsWith('.ppt') || file.name.endsWith('.pptx')
    ) {
      this.selectedFileType = 'office';
      this.selectedFileUrl = '';
      this.officeViewerUrl = '';
    } else {
      this.selectedFileType = 'other';
      this.selectedFileUrl = '';
      this.officeViewerUrl = '';
    }
  }

  async subirArchivo() {
    if (!this.selectedFile) return;
    this.subiendoArchivo = true;
    try {
      const { url } = await this.supabaseStorage.uploadFile(this.selectedFile, 'documentos');
      this.archivoUrlSupabase = url;
      // Detectar tipo para previsualización
      const file = this.selectedFile;
      if (file.type.startsWith('image/')) {
        this.archivoTipoSupabase = 'image';
      } else if (file.type === 'application/pdf') {
        this.archivoTipoSupabase = 'pdf';
      } else if (
        file.name.endsWith('.doc') || file.name.endsWith('.docx') ||
        file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ||
        file.name.endsWith('.ppt') || file.name.endsWith('.pptx')
      ) {
        this.archivoTipoSupabase = 'office';
        this.officeViewerUrlSupabase = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(url);
      } else {
        this.archivoTipoSupabase = 'other';
      }
      await this.cargarArchivosSubidos();
    } catch (err) {
      alert('Error al subir archivo a Supabase');
    } finally {
      this.subiendoArchivo = false;
    }
  }

  verArchivoSubido(archivo: { path: string; url: string; name?: string }) {
    this.archivoUrlSupabase = archivo.url;
    this.archivoTipoSupabase = '';
    this.officeViewerUrlSupabase = '';
    // Detectar tipo por extensión
    const name = archivo.name || '';
    if (name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      this.archivoTipoSupabase = 'image';
    } else if (name.match(/\.pdf$/i)) {
      this.archivoTipoSupabase = 'pdf';
    } else if (name.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i)) {
      this.archivoTipoSupabase = 'office';
      this.officeViewerUrlSupabase = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(archivo.url);
    } else {
      this.archivoTipoSupabase = 'other';
    }
  }
}


