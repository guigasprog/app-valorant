import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Agent, Agents } from '../../../../domain/agent/agent.model';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [NgStyle],
  template: `
    <main>
      @for (agent of agents; track $index) { @if(agent.isPlayableCharacter) {
      <div
        class="row center card"
        (click)="selectedAgent.emit(agent)"
        style="background-image: linear-gradient(to right, #{{
          agent.backgroundGradientColors[0]
        }}, #{{ agent.backgroundGradientColors[1] }}
        , #{{ agent.backgroundGradientColors[2] }}
        , #{{ agent.backgroundGradientColors[3] }});"
      >
        <div class="icon">
          <img src="{{ agent.displayIconSmall }}" alt="icon-agent" />
        </div>
        <div class="content caracter">
          <img src="{{ agent.background }}" />
        </div>
      </div>
      } }
    </main>
  `,
  styles: `
  main {
    width: 100%;
    height: 100%;
    overflow: hidden;
    overflow-y: scroll;
    margin: 0 auto;
    .card {
      margin: 10px;
      display: flex;
      width: 95%;
      height: auto;
      border-radius: 10px;
      position: relative;
      .icon {
        width: 25%;
        height: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        border-radius: 100%;
        overflow: hidden;
        margin-left: 10%;
        img {
          width: 100%;
        }
      }
      .caracter {
        width: 70%;
        height: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        img {
          width: 100%;
          height: auto;
        }
      }
      transition: 300ms;
    }
    .card:hover {
      scale: 1.05;
    }
  }
  `,
})
export class AsideComponent {
  @Input() agents!: Agents;
  @Output() selectedAgent = new EventEmitter<Agent>();
}
