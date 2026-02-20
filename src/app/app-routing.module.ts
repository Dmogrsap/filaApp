import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './Navigation/main-menu/main-menu.component';
import { HeaderComponent } from './Navigation/header/header.component';
import { HomeComponent } from './Navigation/home/home.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { LideresComponent } from './lideres/lideres.component';
import { AccessComponent } from './access/access.component';
import { ServidoresAlabanzaService } from './services/servidores-alabanza.service';
import { ServidoresAlabanzaComponent } from './servidores-alabanza/servidores-alabanza.component';
import { SongManagerComponent } from './song-manager/song-manager.component';
import { EditHomeComponent } from './edit-home/edit-home.component';
import { ServidorMaestrosComponent } from './servidor-maestros/servidor-maestros.component';
import { LoginPopupComponent } from './login-popup/login-popup.component';
import { RoleGuard } from './guards/role.guard';

const routes: Routes = [
  { 

    path: '',
    
     component: MainMenuComponent,
     data: { title: 'Menu', url: '', allowedRoles: []},
     children: [

      {
        path: '',
        component: HomeComponent,
        data: { title: 'Filadelfia CUU App', url: '', allowedRoles: [] },
        
      },

      {
        path: 'access',
        component: AccessComponent,
        data: { title: 'Accesos', url: 'access', allowedRoles: ['Admin','Pastor'] },
        canActivate: [RoleGuard]
      },

      {
        path: 'login',
        component: LoginPopupComponent,
        data: { title: 'Login', url: 'login', allowedRoles: [] }
      },

      {
        path: 'users',
        component: UsersComponent,
        data: { title: 'Usuarios', url: 'users', allowedRoles: ['Admin','Pastor'] },
        canActivate: [RoleGuard]
      },

      {
        path: 'lideres',
        component: LideresComponent,
        data: { title: 'Lideres', url: 'lideres', allowedRoles: ['Admin','Pastor'] },
        canActivate: [RoleGuard]
      },

      {
        path: 'roles',
        component: RolesComponent,
        data: { title: 'Roles', url: 'roles', allowedRoles: ['Admin','Pastor'] },
        canActivate: [RoleGuard]
      },

      {
        path: 'servidores-alabanza',
        component: ServidoresAlabanzaComponent,
        data: { title: 'Servidores Alabanza', url: '/servidores-alabanza', allowedRoles: ['Admin', 'Lider Alabanza', 'Pastor'] },
        canActivate: [RoleGuard]
      },

      {
        path: 'edit-home',
        component: EditHomeComponent,
        data: { title: 'Edicion de Portada', url: '/edit-home', allowedRoles: ['Admin','Pastor'] },
        canActivate: [RoleGuard]
      },

      {
        path: 'song-manager',
        component: SongManagerComponent,
        data: { title: 'Letras y Acordes', url: '/song-manager', allowedRoles: ['Admin','Pastor', 'Lider Alabanza', 'Musico Alabanza','Cantante alabanza'] },
        canActivate: [RoleGuard]
      },

      {
        path: 'servidor-maestros',
        component: ServidorMaestrosComponent,
        data: { title: 'Maestros', url: '/servidor-maestros', allowedRoles: ['Admin','Pastor', 'Maestra', 'Maestro', 'Lider Maestras', 'Lider Maestros','Servidor Maestro'] },
        canActivate: [RoleGuard]
      },
     
    ]
    
  },
      
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
