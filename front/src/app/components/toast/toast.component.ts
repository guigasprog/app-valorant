import { Component } from '@angular/core';

@Component({
  selector: `toast`,
  standalone: true,
  template: ` <div class="card-success"></div>
    <div class="card-warning"></div>
    <div class="card-danger"></div>`,
  styles: `
  .card-success {
    width: 240px;
    height: 100px;
    position: absolute;
    z-index: 5000;
    bottom: 5px;
    right: 5px;
  }
  .card-warning {
    width: 240px;
    height: 100px;
    position: absolute;
    z-index: 5000;
    bottom: 245px;
    right: 5px;
  }
  .card-danger {
    width: 240px;
    height: 100px;
    position: absolute;
    z-index: 5000;
    bottom: 485px;
    right: 5px;
  }`,
})
export class ToastComponent {}
