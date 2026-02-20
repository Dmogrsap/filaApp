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
import { ActivationEnd, Router, Routes } from '@angular/router';
import { MainMenuService } from 'src/app/services/main-menuService.service';
import { UsersService } from 'src/app/services/usersService.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';

// Definición de rutas con TODOS los roles (debe coincidir con app-routing.module.ts)
const ROUTE_ROLES: { [key: string]: string[] } = {
  '/access': ['Admin'],
  '/users': ['Admin'],
  '/lideres': ['Admin'],
  '/roles': ['Admin'],
  '/servidores-alabanza': ['Admin', 'Musico Alabanza', 'Lider Alabanza', 'Cantante alabanza'],
  '/edit-home': ['Admin'],
  '/song-manager': ['Admin', 'Musico Alabanza', 'Lider Alabanza', 'Cantante alabanza'],
  '/servidor-maestros': ['Admin', 'Maestra', 'Maestro', 'Lider Maestras', 'Lider Maestros'],
};

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
  public dataSourceMenusFiltered: any[] = [];
  public masterRoutes: any[] = [];
  public menu: any[] = [];
  public menuFila: any[] = [];
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
    this.router.navigate(['']);
  }

  @ViewChild(DxDrawerComponent, { static: false }) drawer:
    | DxDrawerComponent
    | undefined;

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
  public userRoles: string[] = [];

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
    });
  }

  getArgumentosRuta() {
    return this.router.events.pipe(
      filter((event) => event instanceof ActivationEnd),
      filter((event: any) => event.snapshot.firstChild === null),
      map((event: ActivationEnd) => event.snapshot.data),
    );
  }

  // Método para verificar si el usuario tiene acceso a una ruta
  hasAccessToRoute(route: string): boolean {
    const requiredRoles = ROUTE_ROLES[route];
    
    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Si el usuario no está logueado, no tiene acceso
    if (!this.AuthService.isLoggedIn()) {
      return false;
    }
    
    // Si el usuario no tiene roles asignados, denegar
    if (!this.userRoles || this.userRoles.length === 0) {
      return false;
    }
    
    // Verificar si el usuario tiene algún rol requerido
    return this.AuthService.hasAnyRoleFlexible(requiredRoles);
  }

  // Método para filtrar los menús según los roles del usuario
  filterMenusByRole() {
    if (!this.dataSourceMenus || this.dataSourceMenus.length === 0) {
      return;
    }
    
    this.dataSourceMenusFiltered = this.dataSourceMenus.map(group => {
      const filteredItems = group.items ? group.items.filter((item: any) => {
        return this.hasAccessToRoute(item.route);
      }) : [];
      
      return {
        ...group,
        items: filteredItems
      };
    }).filter(group => {
      return group.items && group.items.length > 0;
    });
  }

  ngOnInit(): void {
    // Suscribirse al estado de login
    this.AuthService.isLoged$.subscribe(status => {
      this.isLoged = status;
    });

    // Suscribirse a los roles del usuario
    this.AuthService.userRoles$.subscribe(roles => {
      this.userRoles = roles;
      if (this.dataSourceMenus.length > 0) {
        this.filterMenusByRole();
      }
    });

    // Cargar menus
    this.mainMenu.getMenusWithSubmenus().subscribe((data) => {
      this.menusSub = data;
    });

    this.mainMenu.getMenus().subscribe((result) => {
      this.dataSourceMenus = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      this.loadIndicatorVisible = false;

      this.mainMenu.getsubMenus().subscribe((data) => {
        this.menusSub = data;
        this.dataSourceMenus.forEach((menu) => {
          menu.items = [];
          const submenusRelacionados = this.menusSub.filter(
            (sub) => sub.nameMenu === menu.Nombre,
          );
          menu.items.push(...submenusRelacionados);
        });

        // Si el usuario tiene roles, filtrar; si no, mostrar todos
        if (this.userRoles && this.userRoles.length > 0) {
          this.filterMenusByRole();
        } else {
          this.dataSourceMenusFiltered = [...this.dataSourceMenus];
        }
      });
    });

    this.menuFila = this.menuFila;
    this.menu = this.menuFila;

    for (let i = 0; i < this.menu.length; i++) {
      this.menuCustom.push(this.menu[i]);
      this.menuCustom2.push(this.menu[i]);
    }

    if (this.menuCustom2.length > 0) {
      this.loadIndicatorVisible = false;
      this.loading = false;
    }
  }

  public ingresar() {
    this.userService.getUsers().subscribe((result) => {
      this.datasourceusers = result.sort((a, b) =>
        a.Nombre.localeCompare(b.Nombre),
      );
      this.loadIndicatorVisible = false;
    });
  }

  toggleGroup(index: number) {
    this.openGroupIndex = this.openGroupIndex === index ? null : index;
  }

  erasefilters() {
    window.location.reload();
  }

  OpenSideBar(event: any) {
    var sidebar = document.getElementById('sidebar');
    var main = document.getElementById('main');

    sidebar?.classList.toggle('active');
    main?.classList.toggle('active');

    event.stopPropagation();
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const sidebar = document.getElementById('sidebar');
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
