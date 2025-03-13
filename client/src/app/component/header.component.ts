import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 60px;">
        <img src="riot-games.svg" style="height: 28px; cursor: pointer"
        (click)="navegar('')" alt="Riot Games" />
        <div style="width: 2px; height: 30px; background: white; border-radius: 2px"></div>
        <img src="logo.svg" style="height: 28px;" alt="logo" />
      </div>
      <h5>GAME</h5>
      <h5 (click)="navegar('agents')">AGENTES</h5>
      <h5>PATCH NOTES</h5>
      <h5>SHOP</h5>
      <div style="width: 30%"></div>
    </header>
  `,
  styles: `
    header {
      width: 100svw;
      height: 10dvh;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 65px;
    }
    h5 {
      cursor: pointer
    }
  `
})
export class HeaderComponent {

  @Output() navegou = new EventEmitter<boolean>();

  constructor(private router: Router) { }

  navegar(rota: string) {
    if(this.router.url != `/${rota}`) {
      this.router.navigate([`/${rota}`]);
      this.navegou.emit(true);
    }
  }

}
