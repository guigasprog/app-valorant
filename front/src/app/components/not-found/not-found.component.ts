import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="bg-content">
      <h2 class="title">404</h2>
      <div class="background"><h1 class="text-secondary">404</h1></div>
    </main>
    <div class="card">
      <header><h2 class="body bold">Error 404</h2></header>
      <main>
        <h2 class="body">
          Page not found<br />Hit the button below to go back
        </h2>
        <button class="primary" routerLink="/">Back</button>
      </main>
    </div>
  `,
  styles: `
  .card {
    width: 30%;
    height: 35%;
    position: absolute;
    top: 1%;
    left: 0.5%;
    header {
        width: 100%;
        height: 20%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    main {
        width: 100%;
        height: 80%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        flex-direction: column;
        gap: 40px;
    }

  }
  .bg-content {
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: default;
    .background {
        position: absolute;
        font-size: 380px;
        top: 6%;
        left: 15%;
        color: rgba(85, 85, 85, 0.8);
        z-index: 0;
    }
    h2 {
        font-size: 80px;
        position: absolute;
        z-index: 1;
    }
  }`,
})
export class NotFoundComponent {}
