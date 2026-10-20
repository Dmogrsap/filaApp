import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EdithomeService } from 'src/app/services/edithome.service';
import { SupabaseStorageService } from 'src/app/services/supabase-storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public hayTransmisionEnVivo = true;
  public dataSourceEnvivo: any [] = [];
  public facebookLiveUrl: SafeResourceUrl;
  public facebookLiveVideoLink = 'https://www.facebook.com/Iglesiafiladelfiach/videos/28160375423612066';
  // public itemsGaleria: Array<{ type: 'image'; url: string }> = [
  //   { type: 'image', url: 'assets/img/filaIntro1.jpg' },
  //   { type: 'image', url: 'assets/img/filaIntro.jpg' }
  // ];
  public itemsGaleria: Array<{ url: string }> = [];

  constructor(
    private sanitizer: DomSanitizer,
    private edithomeService: EdithomeService,
    private supabaseStorage: SupabaseStorageService,
  ) {
    this.facebookLiveUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(this.facebookLiveVideoLink)}&show_text=false&autoplay=true&width=1280&height=720`
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

    this.edithomeService.getEnvivo().subscribe({
      next: (data) => {
        this.dataSourceEnvivo = data;
        const config = data[0];
        this.hayTransmisionEnVivo = config?.envivo || false;

        // Si viene un enlace configurado en Firebase, actualizamos el reproductor
        if (config?.link) {
          this.actualizarUrlVideo(config.link);
        }

        console.log('Datos de transmisión en vivo:', this.hayTransmisionEnVivo);
      },
      error: (error) => {
        //console.error('Error al obtener la colección de transmisión en vivo:', error);
      },
    }); 

    this.cargarImagenesGaleria();
  }

  private async cargarImagenesGaleria(): Promise<void> {
    try {
      const images = await this.supabaseStorage.listFiles('home');
      this.itemsGaleria = images.map((image) => ({ url: image.url }));
    } catch (error) {
      console.error('Error al cargar imágenes de Supabase (images/home):', error);
    }
  }

  actualizarUrlVideo(link: string): void {
    if (!link || link === this.facebookLiveVideoLink) return;
    this.facebookLiveVideoLink = link;
    this.facebookLiveUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(link)}&show_text=false&autoplay=true&width=1280&height=720`
    );
  }

}
