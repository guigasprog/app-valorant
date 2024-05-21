import { Component, OnInit } from '@angular/core';
import { AsideComponent } from './components/aside/aside.component';
import { MainService } from '../../services/main.service';
import { Agent, Agents } from '../../domain/agent/agent.model';
import { CarroselComponent } from './components/carrosel/carrosel.component';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AsideComponent, CarroselComponent, ToastComponent],
  template: `
    <toast />
    <div class="container">
      <header class="bg-head"><h1 class="title">Oie</h1></header>

      <main
        class="bg-content"
        [style]="
          selectedAgent != undefined
            ? {
                backgroundImage:
                  'linear-gradient(' +
                  randomDeg +
                  'deg, #' +
                  selectedAgent.backgroundGradientColors[0] +
                  ', #' +
                  selectedAgent.backgroundGradientColors[1] +
                  '
        , #' +
                  selectedAgent.backgroundGradientColors[2] +
                  '
        , #' +
                  selectedAgent.backgroundGradientColors[3] +
                  ')'
              }
            : null
        "
      >
        <aside class="card">
          @if(agents) {
          <app-aside
            [agents]="agents"
            (selectedAgent)="selectingAgent($event)"
          />
          }
        </aside>
        <div class="content">
          @if(selectedAgent) {
          <app-carrosel [agents]="agents" [agent]="selectedAgent" />
          }
        </div>
      </main>
    </div>
  `,
  styles: `
  .container {
    width: 100%;
    height: 100%;
      header {
      width: 100%;
      height: 13%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    main {
      width: 100%;
      height: 87%;
      display: flex;
      aside {
          width: 25%;
          height: 96.5%;
          border-radius: 20px;
          overflow: hidden;
      }
      .content {
          width: 75%;
          height: 100%;
      }
    }
  }
  `,
})
export class MainComponent implements OnInit {
  agents!: Agents;
  selectedAgent?: Agent;
  randomDeg?: number;

  constructor(private mainService: MainService) {}

  public selectingAgent(agent: Agent) {
    console.log(this.selectedAgent);
    this.selectedAgent = agent;
    this.randomDeg = Math.floor(Math.random() * (360 - 0) + 0);
    console.log(this.randomDeg);
  }

  // style="background-image: linear-gradient('+randomDeg+'deg, #'+
  //   selectedAgent.backgroundGradientColors[0]
  // +', #'+ selectedAgent.backgroundGradientColors[1] +'
  // , #'+ selectedAgent.backgroundGradientColors[2] +'
  // , #'+ selectedAgent.backgroundGradientColors[3] +');"

  ngOnInit(): void {
    this.getAgents();
  }

  public getAgents() {
    this.mainService.getAgents().subscribe(
      (success: any) => {
        this.agents = success.data;
        console.log(this.agents);
      },
      (error) => console.log(error)
    );
  }
}
