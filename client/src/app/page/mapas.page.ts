import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DadosService } from '../services/dados.service';
import { ReservaDirective } from '../component/reserva.directive';
import { modoDoMapa, NOME_MODO, splashDe, type Mapa, type ModoMapa } from '../models/valorant';

/**
 * Os mapas onde se joga, separados por modo.
 *
 * A separação não é enfeite: os cinco de Duelo por Equipes não têm sítios A/B/C
 * e jogam nada parecido com os treze de partida padrão. Numa grade só, quem não
 * conhece o jogo acha que são todos a mesma coisa.
 */
@Component({
  selector: 'app-mapas',
  imports: [ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="envolve">
      <h1 class="vazado topo">Mapas</h1>

      @for (grupo of grupos(); track grupo.modo) {
        <section class="grupo">
          <div class="cabeca">
            <h2>{{ nomeDoModo(grupo.modo) }}</h2>
            <span class="risco" aria-hidden="true"></span>
            <span class="quantos">{{ grupo.mapas.length }}</span>
          </div>

          <ul class="grade">
            @for (mapa of grupo.mapas; track mapa.uuid) {
              <li class="card canto">
                <img
                  class="splash"
                  [src]="imagem(mapa)"
                  [reserva]="mapa.splash"
                  [alt]="'Mapa ' + mapa.displayName"
                  loading="lazy"
                  decoding="async"
                />
                <div class="texto">
                  <h3>{{ mapa.displayName }}</h3>
                  @if (mapa.tacticalDescription) {
                    <p class="sitios">{{ mapa.tacticalDescription }}</p>
                  }
                </div>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
  styles: `
    .topo {
      font-size: var(--t-titulo);
      margin-bottom: 2rem;
    }

    .grupo {
      margin-bottom: 2.75rem;
    }

    .cabeca {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      margin-bottom: 1rem;
    }

    .cabeca h2 {
      font-size: 1rem;
      letter-spacing: 0.1em;
    }

    .risco {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, var(--borda), transparent);
    }

    .quantos {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--cinza);
    }

    .grade {
      list-style: none;
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
    }

    .card {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--borda);
      aspect-ratio: 16 / 10;
      transition:
        transform 180ms ease,
        border-color 180ms ease;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: var(--vermelho);
      --cor-canto: var(--vermelho);
    }

    .splash {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 300ms ease;
    }

    .card:hover .splash {
      transform: scale(1.04);
    }

    .texto {
      position: absolute;
      inset: auto 0 0 0;
      padding: 2.5rem 1.1rem 1rem;
      background: linear-gradient(to top, rgba(15, 25, 35, 0.96) 40%, transparent);
    }

    .texto h3 {
      font-family: 'Druk Wide', sans-serif;
      font-size: 1.15rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .sitios {
      margin-top: 0.25rem;
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cinza);
    }
  `,
})
export class MapasPage {
  private readonly dados = inject(DadosService);

  /** A ordem é fixa: partida padrão primeiro, que é o modo principal. */
  private readonly ordem: ModoMapa[] = ['padrao', 'duelo'];

  readonly grupos = computed(() => {
    const mapas = this.dados.mapas();
    return this.ordem
      .map((modo) => ({
        modo,
        mapas: mapas
          .filter((m) => modoDoMapa(m) === modo)
          .sort((a: Mapa, b: Mapa) => a.displayName.localeCompare(b.displayName, 'pt-BR')),
      }))
      .filter((g) => g.mapas.length > 0);
  });

  nomeDoModo(modo: ModoMapa): string {
    return NOME_MODO[modo];
  }

  imagem = (m: Mapa) => splashDe(m);
}
