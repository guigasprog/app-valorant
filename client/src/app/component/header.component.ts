import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * O menu. Antes eram `<h5>` com `cursor: pointer`, três dos quais não faziam
 * nada — GAME, PATCH NOTES e SHOP pareciam clicáveis e não eram. Agora todo
 * item do menu leva a uma página que existe.
 *
 * `routerLink` e não `router.navigate()` no clique: link de verdade abre em
 * nova aba com o botão do meio, aparece na barra de status ao passar o mouse e
 * é lido como link por um leitor de tela. Nada disso um `<h5>` dava.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <a routerLink="/" class="marca" aria-label="Início">
        <img src="riot-games.svg" alt="Riot Games" height="24" />
        <span class="risco" aria-hidden="true"></span>
        <img src="logo.svg" alt="VALORANT" height="24" />
      </a>

      <button
        type="button"
        class="sanduiche"
        [attr.aria-expanded]="aberto()"
        aria-label="Abrir menu"
        (click)="aberto.set(!aberto())"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <nav [class.aberto]="aberto()">
        @for (item of itens; track item.rota) {
          <a
            [routerLink]="item.rota"
            routerLinkActive="ativo"
            [routerLinkActiveOptions]="{ exact: item.rota === '/' }"
            (click)="aberto.set(false)"
          >
            {{ item.nome }}
          </a>
        }
      </nav>
    </header>
  `,
  styles: `
    header {
      position: relative;
      display: flex;
      align-items: center;
      gap: clamp(1rem, 4vw, 3.5rem);
      padding: 1rem clamp(1rem, 4vw, 2.5rem);
      border-bottom: 1px solid var(--borda);
      background: var(--noite);
    }

    .marca {
      display: flex;
      align-items: center;
      gap: clamp(0.75rem, 2vw, 1.75rem);
      flex-shrink: 0;
    }

    .marca img {
      height: 22px;
      width: auto;
    }

    .risco {
      width: 2px;
      height: 24px;
      border-radius: 2px;
      background: var(--osso);
    }

    nav {
      display: flex;
      align-items: center;
      gap: clamp(1rem, 3vw, 2.75rem);
    }

    nav a {
      font-weight: 700;
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--cinza);
      padding-block: 0.35rem;
      border-bottom: 2px solid transparent;
      transition:
        color 140ms ease,
        border-color 140ms ease;
      white-space: nowrap;
    }

    nav a:hover {
      color: var(--osso);
    }

    /* A rota atual é a única informação que o menu antigo não dava: você
       clicava e nada no cabeçalho mudava. */
    nav a.ativo {
      color: var(--osso);
      border-bottom-color: var(--vermelho);
    }

    .sanduiche {
      display: none;
      margin-left: auto;
      flex-direction: column;
      gap: 5px;
      padding: 0.4rem;
    }

    .sanduiche span {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--osso);
    }

    /* Abaixo de 720px o menu não cabe ao lado da marca: vira painel. Antes não
       havia ponto de quebra nenhum e os itens simplesmente saíam da tela. */
    @media (max-width: 720px) {
      .sanduiche {
        display: flex;
      }

      nav {
        display: none;
        position: absolute;
        inset-inline: 0;
        top: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        background: var(--noite);
        border-bottom: 1px solid var(--borda);
        z-index: 20;
      }

      nav.aberto {
        display: flex;
      }

      nav a {
        padding: 0.9rem clamp(1rem, 4vw, 2.5rem);
        border-bottom: 1px solid var(--borda);
      }

      nav a.ativo {
        border-bottom-color: var(--vermelho);
      }
    }
  `,
})
export class HeaderComponent {
  readonly aberto = signal(false);

  readonly itens = [
    { nome: 'Início', rota: '/' },
    { nome: 'Agentes', rota: '/agentes' },
    { nome: 'Mapas', rota: '/mapas' },
    { nome: 'Armas', rota: '/armas' },
  ];
}
