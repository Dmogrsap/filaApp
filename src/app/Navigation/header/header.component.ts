import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  public title = "";
  public titleSubs$: Subscription
  public blnFooter: boolean = false;

  public isLogin: boolean = true;
  public permissionIt: boolean = true;
  //public userName: string = "";
  public userName:string = "MyUser";
  public userBadge: string = "";
  public currentViewSelected: string = "";

  public badge: string = "";
  public employeeName: string []= [];
  public employeelastName: string []= [];
  public employeelastName2: string []= [];

  loadIndicatorVisible = true;

  constructor(
    //private breakpointObserver: BreakpointObserver,
    // private userService: UsersService,
    private router: Router,
    // public snackBar: MatSnackBar,
    // public service: MainMenuService,
    
  ) { 
    this.titleSubs$ = this.getArgumentosRuta().subscribe(({ title }) => {
      this.blnFooter = title != "Filadelfia CUU App";
      this.title = title;
      //console.log("title", title)
    });
  }

  getArgumentosRuta() {
    return this.router.events
      .pipe(
        filter(event => event instanceof ActivationEnd),
        filter((event: any) => event.snapshot.firstChild === null),
        map((event: ActivationEnd) => event.snapshot.data)
      )
  
  }
 

  @Output() OpenSideBar: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
      this.loadIndicatorVisible = false;
    // this.service.getCurrentUser().subscribe(result => {
    //   // this.badge = result.data
    //   this.badge = result.badge.badgeNumber
    //   //this.badge = "v71228"
    //   //this.badge = "v46637"
    //   //console.log("result", this.badge)
    //   this.isLogin = true;
    //   this.service.getEmployeesByBadge(this.badge).subscribe(result => {
    //     this.employeeName= result.nombre
    //     this.employeelastName = result.apellido1
    //     this.employeelastName2 = result.apellido2
    //     this.loadIndicatorVisible = false;
    //    //console.log('employee',result)
    //   });
    // });
    // //console.log("title",this.title)
    this.userName = localStorage.getItem("userName_MSAD") || "";

    if (localStorage.getItem("jwt_MSAD") != null && localStorage.getItem("idUser_MSAD") != null) {
      this.isLogin = true;
      this.userName = localStorage.getItem("userName_MSAD") || "";
      this.userBadge = localStorage.getItem("userBadge_MSAD") || "";
    }

    var stringView = window.location.pathname.toString().replace('/', '');
    var stringViewCustom = stringView.charAt(0).toUpperCase() + stringView.slice(1);
    this.currentViewSelected = stringViewCustom;
  }

  SendEvent(event:any){
    this.OpenSideBar.emit(event);
  }



}
