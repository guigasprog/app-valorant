import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { HeaderComponent } from './component/header.component';
import { ReservaDirective } from './component/reserva.directive';
import { DadosService } from './services/dados.service';
import { splashDe, type Mapa } from './models/valorant';

/**
 * A casca: splash enquanto os dados vêm, erro quando não vêm, e o fundo.
 *
 * O que saiu daqui: o pré-carregamento de imagens. A versão anterior baixava
 * os retratos dos 32 agentes e os splashes de todos os mapas ANTES de mostrar
 * qualquer coisa — perto de cem imagens de alta resolução segurando a tela.
 * Agora a splash espera só o JSON, que é rápido, e cada imagem chega quando a
 * sua vez de aparecer chega, via `loading="lazy"`.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (dados.estado()) {
      @case ('carregando') {
        <div class="splash">
          <h1 class="vazado pulsando">VALORANT</h1>
        </div>
      }

      @case ('erro') {
        <div class="splash">
          <h1 class="vazado-vermelho">SEM SINAL</h1>
          <p>
            Não deu para falar com a valorant-api.com. Pode ser a sua conexão ou
            um soluço do serviço.
          </p>
          <button type="button" class="canto" (click)="dados.carregar()">
            Tentar de novo
          </button>
        </div>
      }

      @default {
        <app-header />
        <div class="palco">
          @if (dados.mapaDeFundo(); as mapa) {
            <img
              class="fundo"
              [src]="fundo(mapa)"
              [reserva]="mapa.splash"
              alt=""
              aria-hidden="true"
            />
          }
          <main>
            <router-outlet />
          </main>
        </div>
      }
    }
  `,
  styles: `
    .splash {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1.25rem;
      text-align: center;
      padding: 2rem;
    }

    .splash h1 {
      font-size: var(--t-titulao);
    }

    .splash p {
      max-width: 34ch;
      color: var(--cinza);
      line-height: 1.6;
    }

    .splash button {
      /* Num botão preenchido o triângulo do canto não pode ser a cor da borda:
         seria uma cunha cinza sobre o vermelho. Uma sombra do próprio botão lê
         como dobra. */
      --cor-canto: rgba(0, 0, 0, 0.45);

      padding: 0.7rem 1.6rem;
      background: var(--vermelho);
      color: var(--noite);
      font-weight: 700;
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      transition: background 140ms ease;
    }

    .splash button:hover {
      background: var(--vermelho-claro);
    }

    @keyframes respirar {
      0%,
      100% {
        opacity: 0.35;
      }
      50% {
        opacity: 1;
      }
    }

    .pulsando {
      animation: respirar 1.8s ease-in-out infinite;
    }

    .palco {
      position: relative;
      min-height: calc(100dvh - 57px);
      isolation: isolate;
    }

    /*
     * O fundo é uma img e não background-image por dois motivos: o navegador
     * decodifica fora da thread principal, e o alt vazio com aria-hidden diz
     * ao leitor de tela que ali não há conteúdo.
     */
    .fundo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.16;
      z-index: -1;
      pointer-events: none;
    }

    main {
      position: relative;
      padding-block: clamp(1.75rem, 4vw, 3.5rem);
    }
  `,
})
export class AppComponent {
  readonly dados = inject(DadosService);
  private readonly router = inject(Router);

  fundo = (m: Mapa) => splashDe(m);

  constructor() {
    this.dados.carregar();

    // Fundo novo a cada navegação. Antes isso vinha de um `@Output` que o
    // cabeçalho emitia no clique — o que significava que trocar de página pela
    // barra de endereços ou pelo botão "voltar" não trocava nada.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.dados.sortearFundo());
  }
}
