import { Component } from '@angular/core';

@Component({
  selector: `toast`,
  standalone: true,
  template: ` <div class="card-success"></div>`,
  styles: `
  .card-success {
    width: 240px;
    height: 100px;
    position: absolute;
    z-index: 5000;
    bottom: 5px;
    right: 5px;
  }
  `,
})
export class ToastComponent {}
