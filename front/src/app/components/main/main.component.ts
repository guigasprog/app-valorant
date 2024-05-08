import { Component } from '@angular/core';
import { AsideComponent } from './components/aside/aside.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AsideComponent],
  template: `
    <header class="bg-head"><h1 class="text">Oie</h1></header>

    <main class="bg-content">
      <aside class="card"><app-aside (teste)="selecionando($event)" /></aside>
      <div class="center" style="color: white;">{{ teste }}</div>
    </main>
  `,
  styles: `
  header {
    width: 100%;
    height: 13%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  main {
    width: 100%;
    height: 87%;
    display: flex;
    aside {
        width: 20%;
        height: auto;
        border-radius: 15px;
        overflow: hidden;
    }
    div {
        width: 80%;
        height: 100%;
    }
  }`,
})
export class MainComponent {
  teste?: any;
  public selecionando(ev: any) {
    this.teste = ev;
  }
}
