import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../services/dados.service';

/**
 * A página que não existia.
 *
 * Antes a raiz não tinha rota: quem abria o site via o cabeçalho e um retângulo
 * vazio. Esta é a primeira tela de quem chega, então ela responde três coisas
 * em ordem — que lugar é este, o que dá para ver aqui, e quanto tem de cada.
 */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="envolve">
      <section class="hero">
        <p class="sobrelinha">Riot Games</p>
        <h1 class="vazado">Valorant</h1>
        <p class="linha">
          Um catálogo dos agentes, mapas e armas, montado em cima da
          <a href="https://valorant-api.com" target="_blank" rel="noreferrer">
            valorant-api.com </a
          >. Tudo em português, direto da fonte que o jogo usa.
        </p>
      </section>

      <nav class="portais" aria-label="Seções">
        @for (portal of portais; track portal.rota) {
          <a [routerLink]="portal.rota" class="portal canto">
            <span class="contagem">{{ portal.quantos() }}</span>
            <h2>{{ portal.nome }}</h2>
            <p>{{ portal.descricao }}</p>
            <span class="seta" aria-hidden="true">→</span>
          </a>
        }
      </nav>
    </div>
  `,
  styles: `
    .hero {
      padding-block: clamp(2rem, 8vw, 6rem) clamp(2rem, 5vw, 3.5rem);
    }

    .sobrelinha {
      font-weight: 700;
      font-size: 0.72rem;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--vermelho);
      margin-bottom: 0.9rem;
    }

    .hero h1 {
      font-size: var(--t-titulao);
    }

    .linha {
      max-width: 46ch;
      margin-top: 1.5rem;
      line-height: 1.65;
      color: var(--cinza);
    }

    .linha a {
      color: var(--osso);
      border-bottom: 1px solid var(--vermelho);
    }

    .portais {
      display: grid;
      gap: 1rem;
      padding-bottom: 3rem;
      /* auto-fit com minmax em vez de uma media query por faixa: de uma coluna
         no celular a três no monitor, sem ponto de quebra escrito. */
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    }

    .portal {
      position: relative;
      display: block;
      padding: 1.6rem 1.5rem 1.8rem;
      background: var(--noite-alta);
      border: 1px solid var(--borda);
      transition:
        border-color 160ms ease,
        transform 160ms ease,
        background 160ms ease;
    }

    .portal:hover {
      background: var(--noite-card);
      border-color: var(--vermelho);
      /* O triângulo do canto acompanha a borda — senão ele fica cinza sobre um
         contorno vermelho e denuncia que são duas coisas. */
      --cor-canto: var(--vermelho);
      transform: translateY(-3px);
    }

    .contagem {
      display: block;
      font-family: 'Druk Wide', sans-serif;
      font-size: 2.4rem;
      line-height: 1;
      color: var(--vermelho);
    }

    .portal h2 {
      margin-top: 0.7rem;
      font-size: 1.1rem;
      letter-spacing: 0.06em;
    }

    .portal p {
      margin-top: 0.5rem;
      color: var(--cinza);
      line-height: 1.5;
      font-size: 0.88rem;
    }

    .seta {
      position: absolute;
      right: 1.4rem;
      top: 1.6rem;
      color: var(--vermelho);
      transition: transform 160ms ease;
    }

    .portal:hover .seta {
      transform: translateX(4px);
    }
  `,
})
export class InicioPage {
  private readonly dados = inject(DadosService);

  readonly portais = [
    {
      nome: 'Agentes',
      rota: '/agentes',
      descricao: 'Cada um com sua função e as quatro habilidades.',
      quantos: () => this.dados.agentes().length,
    },
    {
      nome: 'Mapas',
      rota: '/mapas',
      descricao: 'Os campos de batalha jogáveis, sem as salas de treino.',
      quantos: () => this.dados.mapas().length,
    },
    {
      nome: 'Armas',
      rota: '/armas',
      descricao: 'O arsenal inteiro, separado por categoria e com o preço.',
      quantos: () => this.dados.armas().length,
    },
  ];
}
