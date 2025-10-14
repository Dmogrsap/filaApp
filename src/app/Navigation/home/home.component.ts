import { Component, OnInit } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private imageService: ImageService) { }

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

  async onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    await this.imageService.uploadImage(file, 'Nombre de la imagen', 'Descripción opcional');
    Swal.fire({
      icon: 'success',
      title: 'Image Uploaded Successfully',
      text: 'Your image has been uploaded.',
      imageUrl: 'assets/img/success.png',
      imageWidth: 600,
      imageHeight: 300,
      width: 600,
      

      // imageAlt: 'Custom image',
    });
  }
}

}
