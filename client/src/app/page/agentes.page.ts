import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../services/dados.service';
import { ReservaDirective } from '../component/reserva.directive';
import {
  gradienteDe,
  iconeDaFuncao,
  iconeDaHabilidade,
  habilidadesOrdenadas,
  retratoDe,
  type Agente,
  type Habilidade,
} from '../models/valorant';

/**
 * A grade de agentes, que é o índice: cada card abre a página do agente.
 *
 * A versão anterior era uma fita horizontal de cards com `width: 22%` e
 * `gap: 100px`, e os nomes girados 90° posicionados com `left: -49%; top: 33%`.
 * Bonito na largura em que foi ajustado, desmontado em qualquer outra.
 *
 * Cada card usa o `backgroundGradientColors` do próprio agente — um par de
 * cores que a API já entregava e ninguém estava usando. É o que faz uma grade
 * de 29 retratos não virar 29 retângulos iguais.
 */
@Component({
  selector: 'app-agentes',
  imports: [RouterLink, ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="envolve">
      <header class="topo">
        <h1 class="vazado">Agentes</h1>
        <div class="funcoes" role="group" aria-label="Filtrar por função">
          <button type="button" [class.ativa]="funcao() === null" (click)="funcao.set(null)">
            Todos
          </button>
          @for (f of funcoes(); track f) {
            <button type="button" [class.ativa]="funcao() === f" (click)="funcao.set(f)">
              {{ f }}
            </button>
          }
        </div>
      </header>

      <ul class="grade">
        @for (agente of visiveis(); track agente.uuid) {
          <li>
            <a
              [routerLink]="['/agentes', agente.uuid]"
              class="card canto"
              [style.background]="gradiente(agente)"
            >
              <div class="retrato">
                <img
                  [src]="retrato(agente)"
                  [reserva]="agente.bustPortrait"
                  [alt]="agente.displayName"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div class="texto">
                <p class="funcao">
                  <img
                    [src]="iconeFuncao(agente)"
                    [reserva]="agente.role.displayIcon"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                  {{ agente.role.displayName }}
                </p>
                <h2>{{ agente.displayName }}</h2>

                <ul class="habilidades" aria-hidden="true">
                  @for (h of habilidades(agente); track h.slot) {
                    <li>
                      <img
                        [src]="iconeHabilidade(agente, h)"
                        [reserva]="h.displayIcon"
                        alt=""
                        loading="lazy"
                      />
                    </li>
                  }
                </ul>
              </div>
            </a>
          </li>
        } @empty {
          <li class="vazio">Nenhum agente com essa função.</li>
        }
      </ul>
    </div>
  `,
  styles: `
    .topo {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .topo h1 {
      font-size: var(--t-titulo);
    }

    .funcoes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .funcoes button {
      padding: 0.4rem 0.9rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--cinza);
      border: 1px solid var(--borda);
      transition:
        color 140ms ease,
        border-color 140ms ease;
    }

    .funcoes button:hover {
      color: var(--osso);
      border-color: var(--cinza);
    }

    .funcoes button.ativa {
      color: var(--noite);
      background: var(--osso);
      border-color: var(--osso);
    }

    .grade {
      list-style: none;
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr));
      padding-bottom: 3rem;
    }

    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      border: 1px solid var(--borda);
      transition:
        transform 180ms ease,
        border-color 180ms ease;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: var(--osso);
      --cor-canto: var(--osso);
    }

    .retrato {
      position: relative;
      aspect-ratio: 3 / 4;
      overflow: hidden;
    }

    .retrato img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      transition: transform 260ms ease;
    }

    .card:hover .retrato img {
      transform: scale(1.05);
    }

    /* O texto fica sobre o fim do retrato, não abaixo dele: o degradê garante
       contraste sem uma faixa sólida cortando a arte. */
    .texto {
      position: relative;
      margin-top: -3.5rem;
      padding: 0 1rem 1rem;
      background: linear-gradient(to top, rgba(15, 25, 35, 0.95) 55%, transparent);
    }

    .funcao {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cinza);
    }

    .funcao img {
      width: 13px;
      height: 13px;
      opacity: 0.6;
    }

    .texto h2 {
      margin-top: 0.25rem;
      font-size: 1.05rem;
      letter-spacing: 0.04em;
    }

    .habilidades {
      list-style: none;
      display: flex;
      gap: 0.4rem;
      margin-top: 0.8rem;
    }

    .habilidades li {
      width: 26px;
      height: 26px;
      display: grid;
      place-items: center;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--borda);
    }

    .habilidades img {
      width: 16px;
      height: 16px;
    }

    .vazio {
      grid-column: 1 / -1;
      padding: 3rem 0;
      text-align: center;
      color: var(--cinza);
    }
  `,
})
export class AgentesPage {
  private readonly dados = inject(DadosService);

  readonly funcao = signal<string | null>(null);

  readonly funcoes = computed(() =>
    [...new Set(this.dados.agentes().map((a) => a.role.displayName))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    ),
  );

  readonly visiveis = computed(() => {
    const f = this.funcao();
    const todos = this.dados.agentes();
    return f === null ? todos : todos.filter((a) => a.role.displayName === f);
  });

  gradiente = (a: Agente) => gradienteDe(a);
  retrato = (a: Agente) => retratoDe(a);
  iconeFuncao = (a: Agente) => iconeDaFuncao(a);
  iconeHabilidade = (a: Agente, h: Habilidade) => iconeDaHabilidade(a, h);
  habilidades = (a: Agente) => habilidadesOrdenadas(a);
}
