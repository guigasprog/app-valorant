import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="bg-content">
      <h2 class="text">404</h2>
      <div class="background"><h1>404</h1></div>
    </main>
    <div class="card">
      <header><h2 class="text">Error 404</h2></header>
      <main>
        <h2 class="text">
          Page not found<br />Hit the button below to go back
        </h2>
        <button routerLink="/">Back</button>
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
        height: 30%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    main {
        width: 100%;
        height: 70%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        flex-direction: column;
        button {
            margin-top: 10px;
            width: 180px;
            height: 60px;
            border-radius: 15px;
            border: 0;
            transition: 100ms;
        }
        button:hover {
            border-radius: 10px;
            background-color: rgba(231, 231, 231, 0.9);
        }
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
        top: 5%;
        left: 25%;
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
