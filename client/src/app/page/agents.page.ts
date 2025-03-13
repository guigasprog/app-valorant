import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-agents',
  template: `
    <div class="agents-container">
      <div style="flex: 0 0 auto;
      width: 20%;
      height: 85%;
      display: flex;
      justify-content: flex-start;
      align-items: center; position: relative;">
        <h1 style="transform: rotate(90deg);
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px #ffffff;">AGENTES</h1>
        <img src="logo (1).svg" style="height: 3em; position: absolute; bottom: 1%; left: 45%" >
        <img src="line.svg" style="height: 0.258em; position: absolute; bottom: -6%; left: 45%" >
      </div>
      @for(agent of agents; track $index) {
        <div class="agent" [attr.data-index]="$index">

          <div class="card-corner"></div>
          <h3 style="transform: rotate(90deg);
          text-align: left;
          width: 100%;
          position: absolute;
          left: -36%;
          top: 35.3%;">{{ agent.role.displayName }}</h3>
          <h2 style="transform: rotate(90deg);
          font-size: 40px;
          text-transform: uppercase;
          text-align: left;
          color: transparent;
          -webkit-text-stroke: 1px #ffffff;
          width: 100%;
          position: absolute;
          left: -49%;
          top: 33%;">{{ agent.displayName }}</h2>
          <div style="width: 100%; height: 100%; display: flex;
            justify-content: center; align-items: start; overflow: hidden;">
            <img src="{{agent.bustPortrait}}" style="height: 150%;
              margin-top: -20%;">
          </div>


          <div class="skills">
            @for(ability of agent.abilities; track $index) {
              <img src="{{ability.displayIcon}}" style="width: 19%;">
            }
          </div>
          <img src="quadre.svg" style="height: 1.5em; position: absolute; bottom: 4%; right: -18%" >

        </div>
      }

    </div>
  `,
  styles: [`
    .agents-container {
      height: 90%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      overflow-x: auto;
      gap: 100px;
      padding-bottom: 1em;
    }

    .agent {
      flex: 0 0 auto;
      width: 22%;
      height: 90%;
      background-image: url('public/stroke.svg');
      background-size: cover;
      background-repeat: no-repeat;
      position: relative;
      overflow: visible;
      .skills {
        width: 80%;
        height: 15%;
        background: #1F2326;
        border: 2px solid #F8F8F8;
        position: absolute;
        bottom: -1em;
        right: -2em;
        z-index: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5%;
      }
    }

    .agent h2 {
      font-size: 1.5em;
      margin-bottom: 10px;
    }

    .agent p {
      font-size: 1.1em;
      line-height: 1.4;
    }
  `]
})
export class AgentsPage implements OnInit {
  agents: any[] = [];

  ngOnInit() {
    // Safe retrieval of data from localStorage
    const agentsFromStorage = localStorage.getItem('agents');
    this.agents = agentsFromStorage ? JSON.parse(agentsFromStorage) : [];
  }
}
