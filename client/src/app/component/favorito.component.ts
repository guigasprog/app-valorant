import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FavoritosService, TipoFavorito } from '../services/favoritos.service';

/**
 * Botão de estrela que alterna o estado de favorito para qualquer item.
 *
 * Uso: `<app-favorito tipo="agente" [uuid]="a.uuid" />`
 *
 * O ícone muda de contorno para preenchido quando ativo.
 */
@Component({
  selector: 'app-favorito',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="estrela"
      [class.ativa]="ativo()"
      [attr.aria-label]="ativo() ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
      [attr.aria-pressed]="ativo()"
      (click)="alternar($event)"
    >
      @if (ativo()) {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--vermelho)" stroke="var(--vermelho)" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      } @else {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      }
    </button>
  `,
  styles: `
    .estrela {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      color: var(--cinza);
      transition: color 140ms ease, transform 140ms ease;
    }

    .estrela:hover {
      color: var(--vermelho);
      transform: scale(1.15);
    }

    .estrela.ativa {
      color: var(--vermelho);
    }
  `,
})
export class FavoritoComponent {
  readonly tipo = input.required<TipoFavorito>();
  readonly uuid = input.required<string>();

  private readonly favoritos = inject(FavoritosService);

  readonly ativo = computed(() => this.favoritos.eFavorito(this.tipo(), this.uuid()));

  alternar(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritos.alternar(this.tipo(), this.uuid());
  }
}
