import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: `testButton`,
  standalone: true,
  imports: [RouterLink, ToastComponent],
  template: `
    <toast />
    <div class="card">
      <main>
        <button class="primary" routerLink="/">Primary</button>
        <button class="secondary" routerLink="/">Secondary</button>
        <button class="warning" routerLink="/">Warning</button>
        <button class="danger" routerLink="/">Danger</button>
        <button class="danger" disabled="true" routerLink="/">Disabled</button>
      </main>
    </div>
  `,
  styles: `
    .card {
        width: 100%;
        height: 90%;
        display: flex;
        justify-content: center;
        align-items: center;
        main {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            gap: 40px;
        }
    }
  `,
})
export class ButtonComponent {}
