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

const routes: Routes = [
  { 

    path: '',
    
     component: MainMenuComponent,
     data: { title: 'Menu', url: '', allowedRoles:['']},
     children: [

      {
        path: '',
        component: HomeComponent,
        data: { title: 'Filadelfia CUU App', url: '', allowedRoles:['']}
      },

      {
        path: 'access',
        // canLoad:[HasRoleGuard],
        component: AccessComponent,
        data: { title: 'Accesos', url: 'access' }
      },

      // {
      //   path: 'activemenus',
      //   component: ActivemenusComponent,
      //   data: { title: 'Activate Menus', url: 'activemenus', allowedRoles:['Administrator, Developers']}
      // },

      // {
      //   path: 'permissions',
      //   //canLoad:[HasRoleGuard],
      //   component: PermissionsComponent,
      //   data: { title: 'Permissions', url: 'permissions', allowedRoles:['Administrator, Developers'] }
      // },

      {
        path: 'users',
        //canLoad:[HasRoleGuard],
        component: UsersComponent,
        data: { title: 'Usuarios', url: 'users' }
      },

      {
        path: 'lideres',
        //canLoad:[HasRoleGuard],
        component: LideresComponent,
        data: { title: 'Lideres', url: 'lideres' }
      },

      {
        path: 'roles',
        component: RolesComponent,
        //canLoad:[HasRoleGuard],
        data: { title: 'Roles', url: 'roles',  allowedRoles:['IAdministrator, Developers'] }
      },

      {
        path: 'servidores-alabanza',
        component: ServidoresAlabanzaComponent,
        data: { title: 'Servidores Alabanza', url: '/servidores-alabanza' }
      },

      // {
      //   path: 'unauthorized',
      //   component: UnauthorizedComponent,
      //   data: { title: 'Unauthorized System', url: 'unauthorized' }
      // },

      {
        path: 'song-manager',
        component: SongManagerComponent,
        data: { title: 'Letras y Acordes', url: '/song-manager'}
      },
      // {
      //   path: 'newsystems',
      //   component: NewsystemsComponent,
      //   data: { title: 'Systems Catalog', url: 'newsystems', allowedRoles:['Administrator, Developers']}
      // },
      // {
      //   path: 'newapplications',
      //   component: NewapplicationsComponent,
      //   data: { title: 'Applications Catalog', url: 'newapplications', allowedRoles:['Administrator, Developers']}
      // },
      // {
      //   path: 'newsqlconnections',
      //   component: NewsqlconnectionsComponent,
      //   data: { title: 'Add SQL Connections', url: 'newsqlconnections', allowedRoles:['Administrator, Developers']}
      // },
      // {
      //   path: 'newdatabases',
      //   component: NewdatabasesComponent,
      //   data: { title: 'Add Databases', url: 'newdatabases', allowedRoles:['Administrator, Developers']}
      // },
      // {
      //   path: 'newserver',
      //   component: NewserverComponent,
      //   data: { title: 'Servers Connections', url: 'newserver', allowedRoles:['Administrator, Developers']}
      // },
      // {
      //   path: 'sqlservicesaccount',
      //   component: SqlservicesaccountComponent,
      //   data: { title: 'SQL Service Accounts', url: 'sqlservicesaccount', allowedRoles:['Administrator, Developers']}
      // },
      // {
      //   path: 'files',
      //   component: FilesComponent,
      //   data: { title: 'Files', url: 'files', allowedRoles:['Administrator, Developers']}
      // },
      // {
      //   path: 'environments',
      //   component: NewenvironmentComponent,
      //   data: { title: 'Environments', url: 'environments', allowedRoles:['Administrator, Developers']}
      // },
    ]
    
  },
      
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
