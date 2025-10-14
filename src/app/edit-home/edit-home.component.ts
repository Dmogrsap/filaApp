import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { ImageService } from '../services/image.service';
import { async, Observable } from 'rxjs';
import { collectionData, collection, Firestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-edit-home',
  templateUrl: './edit-home.component.html',
  styleUrls: ['./edit-home.component.css'],
})
export class EditHomeComponent {

  imagenes$: Observable<any[]> | undefined;
  public imagenes: any[] = [];

  constructor(private imageService: ImageService,  private firestore: Firestore) { }


  ngOnInit() {
  const imagenesRef = collection(this.firestore, 'imagenes');
  this.imagenes$ = collectionData(imagenesRef, { idField: 'id' });
  
}

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      await this.imageService.uploadImage(
        file,
        'Nombre de la imagen',
        'Descripción opcional'
      );
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


