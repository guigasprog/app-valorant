import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      style="width: 100%;height: 100%; overflow: hidden!important; position: relative"
    >
      <div
        class="faixa center"
        style="position: absolute; width: 110%; height: 25%; background-color: #f7c846;
        left: -10%; top: 5%; rotate: -5deg;"
      >
        <h2 style="font-size: 11rem;">SORRY</h2>
      </div>
      <div
        class="card card-3x4 card-yellow"
        style="position: absolute; top: 30px; left: 30px; z-index: 5000; height: 210px; padding-bottom: 0"
      >
        <div class="content" style="overflow: hidden;">
          <h1>Page Not Found</h1>
          <p>
            Requested page Not Found or undergoing maintenance, please wait, it
            is recommended to return to the main menu by pressing the button
            below!
          </p>
          <div class="card center" style="background-color: transparent;">
            <button class="danger">Voltar</button>
          </div>
        </div>
      </div>

      <div
        class="center"
        style="width: 100%;height: 100%; position: absolute; z-index: 1000;"
      >
        <h2 style="font-size: 4rem; color: #f0f0f0; cursor: default">404</h2>
      </div>
      <div
        class="center"
        style="width: 100%;height: 100%; position: absolute; left: 20%; top: 20%"
      >
        <h2 style="font-size: 50rem; color: #f0f0f01c">404</h2>
      </div>
    </div>
  `,
  styles: `
  `,
})
export class NotFoundComponent {}
//font-size: 50rem; color: #f0f0f01c"
//font-size: 2.5rem; color: #f0f0f0"
