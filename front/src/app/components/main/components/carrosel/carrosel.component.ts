import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-carrosel',
  standalone: true,
  template: ` <main>@for (item of items; track $index) { }</main> `,
  styles: `
  main {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    
  }`,
})
export class CarroselComponent {
  items: string[] = ['a', 'b', 'c', 'b', 'c', 'b', 'c', 'b', 'c'];
}
