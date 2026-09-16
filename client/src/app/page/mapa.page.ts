import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../services/dados.service';
import { ReservaDirective } from '../component/reserva.directive';
import {
  calloutsPorRegiao,
  minimapaDe,
  modoDoMapa,
  NOME_MODO,
  splashDe,
  type Mapa,
} from '../models/valorant';

/**
 * A página de um mapa: a planta vista de cima e os callouts.
 *
 * O splash é bonito e não ajuda ninguém a jogar; o que se olha de perto é o
 * minimapa, e o que se decora são os nomes das áreas — é por eles que um time
 * se comunica. Por isso a planta ganha a maior parte da tela e os callouts vêm
 * agrupados por sítio, do jeito que se fala em partida.
 *
 * Os 5 mapas de Duelo por Equipes não têm callouts na API; nesses, a seção
 * simplesmente não aparece em vez de mostrar um bloco vazio.
 */
@Component({
  selector: 'app-mapa',
  imports: [RouterLink, ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (mapa(); as m) {
      <div class="envolve">
        <nav class="migalha">
          <a routerLink="/mapas">← Todos os mapas</a>
        </nav>

        <header class="topo">
          <div>
            <p class="modo">{{ modo(m) }}</p>
            <h1 class="vazado">{{ m.displayName }}</h1>
            <dl class="ficha">
              @if (m.tacticalDescription) {
                <div>
                  <dt>Sítios</dt>
                  <dd>{{ m.tacticalDescription }}</dd>
                </div>
              }
              @if (m.coordinates) {
                <div>
                  <dt>Coordenadas</dt>
                  <dd>{{ m.coordinates }}</dd>
                </div>
              }
            </dl>
          </div>

          <img
            class="splash canto"
            [src]="splash(m)"
            [reserva]="m.splash"
            [alt]="'Vista de ' + m.displayName"
            decoding="async"
          />
        </header>

        @if (m.displayIcon) {
          <section class="planta">
            <h2>Planta</h2>
            <div class="quadro canto">
              <img
                [src]="minimapa(m)"
                [reserva]="m.displayIcon"
                [alt]="'Planta de ' + m.displayName"
                loading="lazy"
                decoding="async"
              />
            </div>
          </section>
        }

        @if (regioes().length > 0) {
          <section class="callouts">
            <h2>Callouts</h2>
            <p class="explica">
              Os nomes que os times usam para marcar posição. Agrupados pelo sítio
              a que pertencem.
            </p>

            <div class="regioes">
              @for (g of regioes(); track g.regiao) {
                <div class="regiao">
                  <h3>{{ g.regiao }}</h3>
                  <ul>
                    @for (nome of g.nomes; track nome) {
                      <li>{{ nome }}</li>
                    }
                  </ul>
                </div>
              }
            </div>
          </section>
        }
      </div>
    } @else {
      <div class="envolve ausente">
        <h1 class="vazado">Mapa não encontrado</h1>
        <a routerLink="/mapas" class="voltar canto">Ver todos os mapas</a>
      </div>
    }
  `,
  styles: `
    .migalha a {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--cinza);
      transition: color 140ms ease;
    }

    .migalha a:hover {
      color: var(--osso);
    }

    .topo {
      display: grid;
      gap: 2rem;
      align-items: center;
      margin-top: 1.5rem;
    }

    @media (min-width: 880px) {
      .topo {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
      }
    }

    .modo {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--vermelho);
    }

    .topo h1 {
      margin-top: 0.5rem;
      font-size: var(--t-titulao);
    }

    .ficha {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
      margin-top: 1.75rem;
    }

    .ficha dt {
      font-size: 0.64rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--cinza);
    }

    .ficha dd {
      margin-top: 0.3rem;
      font-family: 'Druk Wide', sans-serif;
      font-size: 1.1rem;
    }

    .splash {
      width: 100%;
      border: 1px solid var(--borda);
    }

    h2 {
      font-size: 1rem;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }

    .planta {
      margin-top: 3rem;
    }

    /*
     * A planta vem com fundo transparente e traços claros: sobre o fundo do
     * site ela some. O quadro dá o contraste sem precisar mexer na imagem.
     */
    .quadro {
      display: grid;
      place-items: center;
      padding: clamp(1rem, 3vw, 2rem);
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--borda);
    }

    .quadro img {
      width: 100%;
      max-width: 42rem;
      height: auto;
    }

    .callouts {
      margin-top: 3rem;
      padding-bottom: 3rem;
    }

    .explica {
      margin-top: -0.5rem;
      margin-bottom: 1.5rem;
      color: var(--cinza);
      max-width: 52ch;
    }

    .regioes {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
    }

    .regiao {
      padding: 1.1rem 1.2rem;
      background: var(--noite-alta);
      border: 1px solid var(--borda);
    }

    .regiao h3 {
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      color: var(--vermelho);
    }

    .regiao ul {
      list-style: none;
      margin-top: 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .regiao li {
      font-size: 0.86rem;
      color: rgba(236, 232, 225, 0.75);
    }

    .ausente {
      padding-block: clamp(3rem, 12vw, 8rem);
    }

    .ausente h1 {
      font-size: var(--t-titulo);
    }

    .voltar {
      --cor-canto: rgba(0, 0, 0, 0.45);

      display: inline-block;
      margin-top: 2rem;
      padding: 0.7rem 1.6rem;
      background: var(--vermelho);
      color: var(--noite);
      font-weight: 700;
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `,
})
export class MapaPage {
  readonly uuid = input.required<string>();

  private readonly dados = inject(DadosService);

  readonly mapa = computed(() => this.dados.mapaPorUuid(this.uuid()));

  readonly regioes = computed(() => {
    const m = this.mapa();
    return m ? calloutsPorRegiao(m) : [];
  });

  splash = (m: Mapa) => splashDe(m);
  minimapa = (m: Mapa) => minimapaDe(m);

  modo(m: Mapa): string {
    const modo = modoDoMapa(m);
    return modo ? NOME_MODO[modo] : '';
  }
}
