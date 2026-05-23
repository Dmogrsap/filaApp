import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filastore',
  templateUrl: './filastore.component.html',
  styleUrls: ['./filastore.component.css'],
})
export class FilastoreComponent implements OnInit {
  public dataSourceMenusTab: any[] = [];

  // KPIs
  totalOrders = 0;
  totalRevenue = 0;

  // Charts
  salesByCoffee: any[] = [];
  ordersByStatus: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.dataSourceMenusTab = [
      { Nombre: 'Fila Store' },
      { Nombre: 'Fila Coffee' },
    ];
  }
}
