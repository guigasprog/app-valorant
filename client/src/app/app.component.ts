import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './component/header.component';
import { ApiService } from './services/api.service';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgStyle],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiService],
})
export class AppComponent  {
  title = 'client';

  agents: any[] = [];
  maps: any[] = [];
  mapRandom: any;
  carregando: boolean = true;

  chamadasPreload: number = 0;
  chamadasPreloadTerminadas: number = 0;

  constructor(private api: ApiService) {
    this.api.getAgents().subscribe(data => {
      this.agents = data.data.sort((a: any, b: any) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
      this.chamadasPreload++;
      this.preloadImages(this.agents.flatMap(agent => [
        agent.displayIcon,
        agent.bustPortrait,
        agent.background
      ].filter(Boolean)));
      localStorage.setItem('agents', JSON.stringify(data.data));
    });

    this.api.getMaps().subscribe(data => {
      this.maps = data.data;
      this.mapRandom = this.maps[Math.floor(Math.random() * this.maps.length)];
      this.chamadasPreload++;
      this.preloadImages(this.maps.map(map => map.splash).filter(Boolean));
      localStorage.setItem('maps', JSON.stringify(data.data));
    });


  }

  preloadImages(imageUrls: string[]) {
    let loadedCount = 0;
    const totalImages = imageUrls.length;

    imageUrls.forEach(url => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.chamadasPreloadTerminadas++; // Incrementa ao final
          this.verificarCarregamentoCompleto();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          this.chamadasPreloadTerminadas++; // Incrementa ao final
          this.verificarCarregamentoCompleto();
        }
      };
      img.src = url;
    });
  }

  verificarCarregamentoCompleto() {
    this.carregando = false;
  }

  trocarMapa(ev: any) {
    this.mapRandom = this.maps[Math.floor(Math.random() * this.maps.length)];
  }

}
