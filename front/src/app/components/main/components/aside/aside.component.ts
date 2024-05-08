import { NgStyle } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [NgStyle],
  template: `
    <main>
      @for (item of items; track $index) {
      <div
        [ngStyle]="{ 'border-radius': item.selected ? '10px' : '15px' }"
        class="row center card"
        (click)="selecionando(item)"
      >
        <div
          [ngStyle]="{ 'margin-left': item.selected ? '-20px' : '0px' }"
          class="icon"
        ></div>
        <div
          [ngStyle]="{ 'margin-left': item.selected ? '-20px' : '0px' }"
          class="content center"
        >
          {{ item.name }}
        </div>
      </div>
      }
    </main>
  `,
  styles: `
  main {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    .card {
      height: 10%;
      border-radius: 15px;
      border: 2px solid white;
      overflow: hidden;
      transition: 500ms;
      .icon {
        transition: 500ms;
        width: 30%;
        height: 100%;
        background-color: red;
      }
      .content {
        transition: 500ms;
        width: 70%;
        height: 100%;
        background-color: yellow;
      }
    }
    .card:hover {
      border-radius: 10px !important;
      .icon {
        margin-left: -20px !important;
      }
      .content {
        margin-left: -20px !important;
      }
    }
  }`,
})
export class AsideComponent {
  items: any[] = [
    { name: 'Omen', selected: false },
    { name: 'Yoru', selected: false },
    { name: 'Killjoy', selected: false },
    { name: 'Sova', selected: false },
    { name: 'Iso', selected: false },
    { name: 'Jett', selected: false },
    { name: 'Cypher', selected: false },
  ];
  @Output() teste = new EventEmitter<any>();

  public selecionando(ev: any) {
    this.items.forEach((item) => {
      item != ev ? (item.selected = false) : (item.selected = true);
    });
    this.teste.emit(ev);
  }
}
