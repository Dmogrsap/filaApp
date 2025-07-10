import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  ngOnInit(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Be Patient!!!',
      text: 'This App Is Under Construction',
      imageUrl: 'assets/img/Underconstruction.jpg',
      imageWidth: 600,
      imageHeight: 300,
      width: 600,
      

      // imageAlt: 'Custom image',
    });
  }

}
