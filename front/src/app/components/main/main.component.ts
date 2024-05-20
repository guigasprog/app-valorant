import { Component, OnInit } from '@angular/core';
import { AsideComponent } from './components/aside/aside.component';
import { MainService } from '../../services/main.service';
import { Agent, Agents } from '../../domain/agent/agent.model';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AsideComponent],
  template: `
    <div class="container">
      <header class="bg-head"><h1 class="text">Oie</h1></header>

      <main class="bg-content">
        <aside class="card">
          @if(agents) {
          <app-aside
            [agents]="agents"
            (selectedAgent)="selectingAgent($event)"
          />
          }
        </aside>
        <div class="center" style="color: white;">
          {{ selectedAgent.displayName }}
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
      div {
          width: 80%;
          height: 100%;
      }
    }
  }
  `,
})
export class MainComponent implements OnInit {
  agents!: Agents;
  selectedAgent?: any;

  constructor(private mainService: MainService) {}

  public selectingAgent(agent: Agent) {
    this.selectedAgent = agent;
  }

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
