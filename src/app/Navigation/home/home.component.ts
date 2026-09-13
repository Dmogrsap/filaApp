import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FirebaseStorageService } from 'src/app/services/image.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public datasoureimages: any | null = null;
  public hayTransmisionEnVivo = true;
  public facebookLiveUrl: SafeResourceUrl;
  public facebookLiveVideoLink = 'https://www.facebook.com/Iglesiafiladelfiach/videos/28160375423612066';
  public itemsGaleria: Array<{ type: 'image'; url: string }> = [
    { type: 'image', url: 'assets/img/filaIntro1.jpg' },
    { type: 'image', url: 'assets/img/filaIntro.jpg' }
  ];

  constructor(
    private FirebaseStorageService: FirebaseStorageService,
    private sanitizer: DomSanitizer
  ) {
    this.facebookLiveUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(this.facebookLiveVideoLink)}&show_text=false&autoplay=false&width=1280&height=720`
    );
  }

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



//   async onFileSelected(event: any) {
//   const file = event.target.files[0];
//   if (file) {
//     await this.imageService.uploadAndSave(file, 'Nombre de la imagen',);
//     Swal.fire({
//       icon: 'success',
//       title: 'Image Uploaded Successfully',
//       text: 'Your image has been uploaded.',
//       imageUrl: 'assets/img/success.png',
//       imageWidth: 600,
//       imageHeight: 300,
//       width: 600,
      

//       // imageAlt: 'Custom image',
//     });
//   }
// }

}
