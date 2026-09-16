import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConsentimentoService } from '../services/consentimento.service';

@Component({
  selector: 'app-consentimento',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (consentimento.escolha() === null) {
      <div class="aviso canto" role="dialog" aria-label="Aviso de cookies">
        <p>
          Este site exibe anúncios para se manter no ar. Aceitando, eles podem
          ser personalizados; recusando, você vê anúncios genéricos.
          <a routerLink="/privacidade">Privacidade</a>
        </p>
        <div class="botoes">
          <button type="button" class="recusar" (click)="consentimento.decidir('recusado')">
            Recusar
          </button>
          <button type="button" class="aceitar canto" (click)="consentimento.decidir('aceito')">
            Aceitar
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .aviso {
      position: fixed;
      inset-inline: clamp(0.75rem, 3vw, 2rem);
      bottom: clamp(0.75rem, 3vw, 2rem);
      z-index: 60;
      max-width: 48rem;
      margin-inline: auto;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      padding: 1rem 1.2rem;
      background: rgba(31, 35, 38, 0.97);
      border: 1px solid var(--borda);
      backdrop-filter: blur(8px);
    }

    @media (min-width: 640px) {
      .aviso {
        flex-direction: row;
        align-items: center;
        gap: 1.5rem;
      }
    }

    p {
      flex: 1;
      font-size: 0.84rem;
      line-height: 1.5;
      color: rgba(236, 232, 225, 0.75);
    }

    p a {
      color: var(--osso);
      border-bottom: 1px solid var(--vermelho);
    }

    .botoes {
      display: flex;
      gap: 0.6rem;
      flex-shrink: 0;
    }

    button {
      padding: 0.55rem 1.1rem;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .recusar {
      color: var(--cinza);
      border: 1px solid var(--borda);
    }

    .recusar:hover {
      color: var(--osso);
      border-color: var(--cinza);
    }

    .aceitar {
      --cor-canto: rgba(0, 0, 0, 0.45);
      background: var(--vermelho);
      color: var(--noite);
    }

    .aceitar:hover {
      background: var(--vermelho-claro);
    }
  `,
})
export class ConsentimentoComponent {
  readonly consentimento = inject(ConsentimentoService);
}
