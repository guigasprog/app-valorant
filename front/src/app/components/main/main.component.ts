import { Agent } from './../../domain/agent/agent.model';
import { Component, OnInit } from '@angular/core';
import { AsideComponent } from './components/aside/aside.component';
import { CarroselComponent } from './components/carrosel/carrosel.component';
import { Agents } from '../../domain/agent/agent.model';
import { MainService } from '../../services/main.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AsideComponent, CarroselComponent],
  template: `
    <div class="full-container">
      <main>
        <aside class="card card-aside">
          @if (agents) {
          <app-aside [agents]="agents" />
          }
        </aside>
      </main>
    </div>
  `,
  styles: `
  .full-container {
    width: 100%;
    height: 100%;
    main {
      width: 100%;
      height: 100%;
      display: flex;
      aside {
          width: 20%;
          height: auto;
          border-radius: 20px;
          overflow: hidden;
          background-color: #f0f0f01c;
          padding: 0;
      }
    }
  }

  `,
})
export class MainComponent implements OnInit {
  public agents!: Agents;

  constructor(private apiService: MainService) {}

  ngOnInit(): void {
    this.apiService
      .getAgents()
      .subscribe((agents: any) => (this.agents = agents.data));
  }
}
