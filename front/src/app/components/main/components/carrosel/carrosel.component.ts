import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Agent } from '../../../../domain/agent/agent.model';

@Component({
  selector: 'app-carrosel',
  standalone: true,
  template: `
    <main>
      @if(agent) {
      <div class="left options">
        <img src="assets/imgs/right-arrow.png" style="rotate: 180deg;" />
      </div>
      <div class="container">
        <img id="person" src="{{ agent.bustPortrait }}" />
        <img class="name" src="{{ agent.background }}" />
      </div>
      <div class="right options"><img src="assets/imgs/right-arrow.png" /></div>
      }
    </main>
  `,
  styles: `
  main {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .options {
      width: 80px;
      height: 100%;
      margin: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1;
      img {
        width: 80%;
        filter: invert(1);
      }
    }
    .container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      position: relative;
      .name {
        height: 100%;
        position: absolute;
        scale: 1.4;
        z-index: 0;
      }
      #person {
        height: 100%;
        position: absolute;
        z-index: 1;
      }
    }
  }`,
})
export class CarroselComponent {
  @Input() agent!: Agent;
}
