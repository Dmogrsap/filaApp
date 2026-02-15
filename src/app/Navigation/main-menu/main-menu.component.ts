import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { filter, map, Observable, shareReplay, Subscription } from 'rxjs';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { DxDrawerComponent } from 'devextreme-angular';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { ActivationEnd, Router } from '@angular/router';
import { MainMenuService } from 'src/app/services/main-menuService.service';
import { UsersService } from 'src/app/services/usersService.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenuComponent implements OnInit {
  public badge: string = '';
  public employeeName: string[] = [];
  public employeelastName: string[] = [];
  public employeelastName2: string[] = [];
  public datasourceusers: any[] = [];
  public datasourceroles: any[] = [];
  public dataSourceMenus: any[] = [];
  public masterRoutes: any[] = [];
  // public masterRoutes2: any []= [];
  public menu: any[] = [];
  public menuFila: any[] = [];
  // public menuFila: any [] = [
  //    {
  //   "idMenu": 1,
  //   "nameMenu": "Alabanza",
  //   "iconMenu": null,
  //   "active": true,
  //   "hasAccess": true,
  //   "idAccesses": 0,
  //   "description": null,
  //   "nameView": null,
  //   "route": null,
  //   "icons": null,
  //   "active1": false,
  //   "canModify": null,
  //   "orderBy": null,
  //   "sectionMenuName": null,
  //   "idPermissions": 0,
  //   "idRole": 0,
  //   "hasAccess1": false,
  //   "isActive": false,
  //   "parentId": null,
  //   "canModifyPer": null,
  //   "id": null,
  //   "items": [
  //     {
  //       "idAccesses": 2,
  //       "description": null,
  //       "nameView": "Accesses",
  //       "route": "/accesses",
  //       "icons": "meeting_room",
  //       "idMenu": 1,
  //       "active": true,
  //       "hasAccess": true,
  //       "canModify": true,
  //       "orderBy": 2,
  //       "nameMenu": null,
  //       "idPermissions": 0,
  //       "idRolePer": 0,
  //       "idAccessesPer": 0,
  //       "hasAccessPer": false,
  //       "canModifyPer": false,
  //       "activePer": false,
  //       "permissions": []
  //     },
  //     {
  //       "idAccesses": 16,
  //       "description": null,
  //       "nameView": "Menu",
  //       "route": "/activemenus",
  //       "icons": "storage",
  //       "idMenu": 1,
  //       "active": true,
  //       "hasAccess": true,
  //       "canModify": true,
  //       "orderBy": 1,
  //       "nameMenu": null,
  //       "idPermissions": 0,
  //       "idRolePer": 0,
  //       "idAccessesPer": 0,
  //       "hasAccessPer": false,
  //       "canModifyPer": false,
  //       "activePer": false,
  //       "permissions": []
  //     },
  //   ]
  //   },
  //   {
  //     "idMenu": 4,
  //     "nameMenu": "Multimedia",
  //     "iconMenu": "",
  //     "active": true,
  //     "hasAccess": true,
  //     "idAccesses": 0,
  //     "description": null,
  //     "nameView": null,
  //     "route": null,
  //     "icons": null,
  //     "active1": false,
  //     "canModify": null,
  //     "orderBy": null,
  //     "sectionMenuName": null,
  //     "idPermissions": 0,
  //     "idRole": 0,
  //     "hasAccess1": false,
  //     "isActive": false,
  //     "parentId": null,
  //     "canModifyPer": null,
  //     "id": null,
  //     // "items": [
  //     //   {
  //     //     "idAccesses": 21,
  //     //     "description": null,
  //     //     "nameView": "Add SQL Connection",
  //     //     "route": "/newsqlconnections",
  //     //     "icons": "cloud",
  //     //     "idMenu": 4,
  //     //     "active": true,
  //     //     "hasAccess": true,
  //     //     "canModify": true,
  //     //     "orderBy": 12,
  //     //     "nameMenu": null,
  //     //     "idPermissions": 0,
  //     //     "idRolePer": 0,
  //     //     "idAccessesPer": 0,
  //     //     "hasAccessPer": false,
  //     //     "canModifyPer": false,
  //     //     "activePer": false,
  //     //     "permissions": []
  //     //   },
  //     //   {
  //     //     "idAccesses": 20,
  //     //     "description": null,
  //     //     "nameView": "Applications Catalog",
  //     //     "route": "/newapplications",
  //     //     "icons": "apps",
  //     //     "idMenu": 4,
  //     //     "active": true,
  //     //     "hasAccess": true,
  //     //     "canModify": true,
  //     //     "orderBy": 10,
  //     //     "nameMenu": null,
  //     //     "idPermissions": 0,
  //     //     "idRolePer": 0,
  //     //     "idAccessesPer": 0,
  //     //     "hasAccessPer": false,
  //     //     "canModifyPer": false,
  //     //     "activePer": false,
  //     //     "permissions": []
  //     //   }
  //     // ]
  //   }
  // ];
  public menu2: any[] = [];
  public menuCustom: any[] = [];
  public menuCustom2: any[] = [];
  public menuCustom3: any[] = [];
  public submenu: any[] = [];

  public getMenu: any[] = [];

  events: string[] = [];
  opened: boolean = true;
  continue: boolean = false;

  public isNavBarOpened = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  goToHome() {
    //this.router.navigate('');
    this.router.navigate(['']);
  }

  // menu: Menu[] | undefined;

  @ViewChild(DxDrawerComponent, { static: false }) drawer:
    | DxDrawerComponent
    | undefined;
  //  @Output()OpenSideBar: EventEmitter<any> = new EventEmitter<any>();
  // navigation: List[];

  showSubmenuModes: string[] = ['slide', 'expand'];

  positionModes: string[] = ['left', 'right'];

  showModes: string[] = ['push', 'shrink', 'overlap'];

  selectedOpenMode = 'push';

  selectedPosition = 'right';

  selectedRevealMode = 'slide';

  public isDrawerOpen = true;

  elementAttr: any;

  public title = '';
  public titleSubs$: Subscription;
  public blnFooter: boolean = false;

  //public isLogin: boolean = false;
  public isLogin: boolean = true;
  public isLoged: boolean = false;
  public canView: boolean = false;
  public permissionIt: boolean = true;
  public userName: string = '';
  public userBadge: string = '';
  public currentViewSelected: string = '';

  public horizontalOptions: MatSnackBarHorizontalPosition = 'center';
  public verticalOptions: MatSnackBarVerticalPosition = 'top';
  public loading = true;
  loadIndicatorVisible = true;

  public masterRoutes2: any[] = [];
  public masterRoutes3: any[] = [];
  listData: any;
  itemDeleteMode = 'toggle';
  public openGroupIndex: number | null = null;

  public menusSub: any[] = [];
  // public title: any;
  // public titleSubs$: Subscription

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    public snackBar: MatSnackBar,
    private mainMenu: MainMenuService,
    private userService: UsersService,
    private AuthService: AuthServiceService
  ) {
    this.titleSubs$ = this.getArgumentosRuta().subscribe(({ title }) => {
      this.blnFooter = title != 'Filadelfia CUU App';
      this.title = title;
      //console.log("title", this.title)
    });
  }

  getArgumentosRuta() {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      filter((event: any) => event.snapshot.firstChild === null),
      map((event: ActivationEnd) => event.snapshot.data),
    );
  }

  ngOnInit(): void {
    this.AuthService.isLoged$.subscribe(status => {
    this.isLoged = status;
    console.log('El estado en MainMenu cambió a:', this.isLoged);
  });

    this.mainMenu.getMenusWithSubmenus().subscribe((data) => {
      this.menusSub = data;
      //console.log('this.submenu', this.menusSub);
    });

    this.mainMenu.getMenus().subscribe((result) => {
      this.dataSourceMenus = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      this.loadIndicatorVisible = false;
      //console.log('DataSource', this.dataSourceMenus);
    });

    this.mainMenu.getMenus().subscribe((result) => {
      this.dataSourceMenus = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      this.loadIndicatorVisible = false;
      //console.log('DataSource', this.dataSourceMenus);

      this.mainMenu.getsubMenus().subscribe((data) => {
        this.menusSub = data;
        // 💡 Asociar submenús a cada menú
        this.dataSourceMenus.forEach((menu) => {
          // Inicializa el arreglo 'items' si no existe
          menu.items = [];

          // Filtra los submenús cuyo nameMenu coincide con el Nombre del menú
          const submenusRelacionados = this.menusSub.filter(
            (sub) => sub.nameMenu === menu.Nombre,
          );

          // Asigna los submenús filtrados al campo 'items' del menú
          menu.items.push(...submenusRelacionados);
        });

        //console.log('Menús con submenús:', this.dataSourceMenus);
      });
    });

    this.menuFila = this.menuFila;
    this.menu = this.menuFila;

    for (let i = 0; i < this.menu.length; i++) {
      // if(this.menu[i].hasAccess == true){
      this.menuCustom.push(this.menu[i]);
      this.menuCustom2.push(this.menu[i]);

      // }
    } // Oculta el indicador de carga cuando los datos estén listos

    //console.log("menuCustom",this.menuCustom2);

    if (this.menuCustom2.length > 0) {
      this.loadIndicatorVisible = false;
      this.loading = false;
    }

    //console.log("menu",this.menuCustom2);
  }

  public ingresar() {
    this.userService.getUsers().subscribe((result) => {
      this.datasourceusers = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      this.loadIndicatorVisible = false;
      if (this.datasourceusers.length > 0) {
        //console.log('DataSource', this.datasourceusers);
      }
    });
  }

  toggleGroup(index: number) {
    this.openGroupIndex = this.openGroupIndex === index ? null : index;
  }

  erasefilters() {
    window.location.reload();
  }

  OpenSideBar(event: any) {
    //console.log("document",event)
    var sidebar = document.getElementById('sidebar');
    var main = document.getElementById('main');

    sidebar?.classList.toggle('active');
    main?.classList.toggle('active');

    event.stopPropagation(); // Evita que el clic propague al documento
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const sidebar = document.getElementById('sidebar');
    // Si el sidebar está abierto y el clic fue fuera del sidebar y fuera del botón de hamburguesa
    if (
      this.sidebarOpen &&
      sidebar &&
      !sidebar.contains(event.target as Node) &&
      !(event.target as HTMLElement).closest('.open-btn')
    ) {
      this.sidebarOpen = false;
    }
  }

  sidebarOpen = false;
}
