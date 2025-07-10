import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  customersData: any;
  refreshMode: string | undefined; 
  userInformation: string = "Daniel Ortega";

  constructor() {
    this.refreshMode = 'reshape';
   }

  ngOnInit(): void {
    this.customersData = [
      { id: 1, name: 'Administrator', description: 'Full access to the system',createdBy: '',modifiedBy:'',createdDate:'',modifiedDate:'',isActive: true },
      { id: 2, name: 'Pastor', description: 'Full access to displays',createdBy: '',modifiedBy:'',createdDate:'',modifiedDate:'',isActive: true  },
      { id: 3, name: 'Alabanza Lider', description: 'Limited access to the system',createdBy: '',modifiedBy:'',createdDate:'',modifiedDate:'',isActive: true  },
      { id: 4, name: 'Alabanza', description: 'Read-only access to the system',createdBy: '',modifiedBy:'',createdDate:'',modifiedDate:'',isActive: true  },
      { id: 5, name: 'Multimedia Lider', description: 'Limited access to the system',createdBy: '',modifiedBy:'',createdDate:'',modifiedDate:'',isActive: true  },
      { id: 6, name: 'Multimedia', description: 'Read-only access to the system',createdBy: '',modifiedBy:'',createdDate:'',modifiedDate:'',isActive: true  }
    ];
    this.refreshMode = "Manual";
  }

}
