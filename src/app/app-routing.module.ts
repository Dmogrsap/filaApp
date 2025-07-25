import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './Navigation/main-menu/main-menu.component';
import { HeaderComponent } from './Navigation/header/header.component';
import { HomeComponent } from './Navigation/home/home.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';

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

      // {
      //   path: 'accesses',
      //   // canLoad:[HasRoleGuard],
      //   component: AccessesComponent,
      //   data: { title: 'Accesses', url: 'accesses', allowedRoles:['Administrator, Developers'] }
      // },

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
        path: 'roles',
        component: RolesComponent,
        //canLoad:[HasRoleGuard],
        data: { title: 'Roles', url: 'roles',  allowedRoles:['IAdministrator, Developers'] }
      },

      // {
      //   path: 'Lideres',
      //   component: UsersComponent,
      //   data: { title: 'Lideres', url: 'users' }
      // },

      // {
      //   path: 'unauthorized',
      //   component: UnauthorizedComponent,
      //   data: { title: 'Unauthorized System', url: 'unauthorized' }
      // },

      // {
      //   path: 'generalcatalog',
      //   component: GeneralcatalogComponent,
      //   data: { title: 'General Catalog', url: 'generalcatalog', allowedRoles:['Administrator, Developers']}
      // },
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
