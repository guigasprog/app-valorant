import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DadosService } from '../services/dados.service';
import { categoriaDe, type Arma } from '../models/valorant';

/** A ordem da loja no jogo — alfabética aqui não diria nada a ninguém. */
const ORDEM = [
  'Pistolas',
  'Submetralhadoras',
  'Escopetas',
  'Rifles',
  'Snipers',
  'Pesadas',
  'Corpo a corpo',
];

@Component({
  selector: 'app-armas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="envolve">
      <h1 class="vazado topo">Armas</h1>

      @for (grupo of grupos(); track grupo.nome) {
        <section class="grupo">
          <div class="cabeca">
            <h2>{{ grupo.nome }}</h2>
            <span class="risco" aria-hidden="true"></span>
            <span class="quantas">{{ grupo.armas.length }}</span>
          </div>

          <ul class="grade">
            @for (arma of grupo.armas; track arma.uuid) {
              <li class="card canto">
                <img
                  [src]="arma.displayIcon"
                  [alt]="arma.displayName"
                  loading="lazy"
                  decoding="async"
                />
                <div class="rodape">
                  <h3>{{ arma.displayName }}</h3>
                  <!-- A faca não tem preço: não é comprada. -->
                  @if (arma.shopData; as loja) {
                    <p class="preco">{{ loja.cost }}</p>
                  } @else {
                    <p class="preco sem">—</p>
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
      color: var(--osso);
    }

    .risco {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, var(--borda), transparent);
    }

    .quantas {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--cinza);
    }

    .grade {
      list-style: none;
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
    }

    .card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.9rem;
      padding: 1rem;
      background: var(--noite-alta);
      border: 1px solid var(--borda);
      transition:
        border-color 160ms ease,
        background 160ms ease;
    }

    .card:hover {
      background: var(--noite-card);
      border-color: var(--vermelho);
    }

    /* A arte das armas vem em proporções bem diferentes — uma faca e uma
       Odin não cabem na mesma caixa sem altura fixa e object-fit contain. */
    .card img {
      width: 100%;
      height: 72px;
      object-fit: contain;
      object-position: center;
    }

    .rodape {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.6rem;
    }

    .rodape h3 {
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
    }

    .preco {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--vermelho);
      font-variant-numeric: tabular-nums;
    }

    .preco.sem {
      color: var(--cinza);
    }
  `,
})
export class ArmasPage {
  private readonly dados = inject(DadosService);

  readonly grupos = computed(() => {
    const porCategoria = new Map<string, Arma[]>();

    for (const arma of this.dados.armas()) {
      const nome = categoriaDe(arma);
      const lista = porCategoria.get(nome);
      if (lista) lista.push(arma);
      else porCategoria.set(nome, [arma]);
    }

    for (const lista of porCategoria.values()) {
      lista.sort((a, b) => (a.shopData?.cost ?? 0) - (b.shopData?.cost ?? 0));
    }

    // Categorias que a API traga no futuro e que não estejam em ORDEM caem no
    // fim, em vez de sumirem da tela.
    return [...porCategoria.entries()]
      .map(([nome, armas]) => ({ nome, armas }))
      .sort((a, b) => {
        const ia = ORDEM.indexOf(a.nome);
        const ib = ORDEM.indexOf(b.nome);
        return (ia === -1 ? ORDEM.length : ia) - (ib === -1 ? ORDEM.length : ib);
      });
  });
}
