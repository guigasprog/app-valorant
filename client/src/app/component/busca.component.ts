import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DadosService } from '../services/dados.service';
import { ReservaDirective } from './reserva.directive';
import { iconeDe, iconeDaArma, splashDe, categoriaDe } from '../models/valorant';

interface ResultadoBusca {
  tipo: 'Agente' | 'Mapa' | 'Arma';
  nome: string;
  icone: string;
  reserva: string;
  rota: string[];
  detalhe: string;
}

/**
 * Busca global no header — filtra agentes, mapas e armas em tempo real.
 *
 * Os dados já estão carregados no DadosService, então a busca é um computed
 * sobre os três arrays: sem pedidos à rede, sem debounce necessário.
 */
@Component({
  selector: 'app-busca',
  imports: [RouterLink, ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="busca-container">
      <button
        type="button"
        class="botao-busca"
        aria-label="Buscar"
        (click)="abrir()"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      @if (visivel()) {
        <div class="painel">
          <div class="campo-container">
            <svg class="campo-icone" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              #campoBusca
              type="text"
              class="campo"
              placeholder="Buscar agente, mapa ou arma…"
              [value]="termo()"
              (input)="termo.set(campoBusca.value)"
              (keydown.escape)="fechar()"
              (keydown.enter)="irParaPrimeiro()"
            />
            @if (termo().length > 0) {
              <button type="button" class="limpar" (click)="termo.set(''); campoBusca.focus()">✕</button>
            }
          </div>

          @if (termo().length >= 2) {
            <ul class="resultados" role="listbox">
              @for (r of resultados(); track r.rota.join('/')) {
                <li>
                  <a
                    [routerLink]="r.rota"
                    class="resultado"
                    role="option"
                    (click)="fechar()"
                  >
                    <img
                      [src]="r.icone"
                      [reserva]="r.reserva"
                      [alt]="''"
                      aria-hidden="true"
                      loading="lazy"
                    />
                    <div class="resultado-texto">
                      <span class="resultado-nome">{{ r.nome }}</span>
                      <span class="resultado-tipo">{{ r.detalhe }}</span>
                    </div>
                  </a>
                </li>
              } @empty {
                <li class="sem-resultado">Nenhum resultado para "{{ termo() }}"</li>
              }
            </ul>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .busca-container {
      position: relative;
    }

    .botao-busca {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      color: var(--cinza);
      border: 1px solid var(--borda);
      transition: color 140ms ease, border-color 140ms ease;
    }

    .botao-busca:hover {
      color: var(--osso);
      border-color: var(--cinza);
    }

    .painel {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: min(24rem, 92vw);
      background: var(--noite);
      border: 1px solid var(--borda);
      z-index: 30;
      animation: busca-in 150ms ease both;
    }

    @keyframes busca-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .campo-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 0.8rem;
      border-bottom: 1px solid var(--borda);
    }

    .campo-icone {
      flex-shrink: 0;
      color: var(--cinza);
    }

    .campo {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: var(--osso);
      font: inherit;
      font-size: 0.88rem;
    }

    .campo::placeholder {
      color: var(--cinza);
    }

    .limpar {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      display: grid;
      place-items: center;
      font-size: 0.7rem;
      color: var(--cinza);
      border: 1px solid var(--borda);
      transition: color 140ms ease;
    }

    .limpar:hover {
      color: var(--osso);
    }

    .resultados {
      list-style: none;
      max-height: 20rem;
      overflow-y: auto;
    }

    .resultado {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.8rem;
      transition: background 120ms ease;
    }

    .resultado:hover {
      background: var(--noite-alta);
    }

    .resultado img {
      width: 36px;
      height: 36px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .resultado-texto {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .resultado-nome {
      font-weight: 700;
      font-size: 0.88rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .resultado-tipo {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--cinza);
    }

    .sem-resultado {
      padding: 1.5rem 0.8rem;
      text-align: center;
      color: var(--cinza);
      font-size: 0.86rem;
    }
  `,
})
export class BuscaComponent {
  private readonly el = inject(ElementRef);
  private readonly dados = inject(DadosService);
  private readonly router = inject(Router);

  readonly visivel = signal(false);
  readonly termo = signal('');

  readonly resultados = computed<ResultadoBusca[]>(() => {
    const t = this.termo().toLowerCase().trim();
    if (t.length < 2) return [];

    const lista: ResultadoBusca[] = [];

    for (const a of this.dados.agentes()) {
      if (a.displayName.toLowerCase().includes(t) || a.role.displayName.toLowerCase().includes(t)) {
        lista.push({
          tipo: 'Agente',
          nome: a.displayName,
          icone: iconeDe(a),
          reserva: a.displayIcon,
          rota: ['/agentes', a.uuid],
          detalhe: `Agente — ${a.role.displayName}`,
        });
      }
    }

    for (const m of this.dados.mapas()) {
      if (m.displayName.toLowerCase().includes(t)) {
        lista.push({
          tipo: 'Mapa',
          nome: m.displayName,
          icone: splashDe(m),
          reserva: m.splash,
          rota: ['/mapas', m.uuid],
          detalhe: 'Mapa',
        });
      }
    }

    for (const a of this.dados.armas()) {
      if (a.displayName.toLowerCase().includes(t) || categoriaDe(a).toLowerCase().includes(t)) {
        lista.push({
          tipo: 'Arma',
          nome: a.displayName,
          icone: iconeDaArma(a),
          reserva: a.displayIcon,
          rota: ['/armas', a.uuid],
          detalhe: `Arma — ${categoriaDe(a)}`,
        });
      }
    }

    return lista.slice(0, 12);
  });

  @HostListener('document:click', ['$event'])
  fecharFora(event: MouseEvent): void {
    if (this.visivel() && !this.el.nativeElement.contains(event.target)) {
      this.fechar();
    }
  }

  @HostListener('document:keydown', ['$event'])
  atalho(event: KeyboardEvent): void {
    // Ctrl+K ou Cmd+K abre a busca, como em muitos sites modernos.
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.abrir();
    }
  }

  abrir(): void {
    this.visivel.set(true);
    // Focar o input no próximo ciclo, depois do Angular renderizar.
    setTimeout(() => {
      const input = this.el.nativeElement.querySelector('.campo');
      input?.focus();
    });
  }

  fechar(): void {
    this.visivel.set(false);
    this.termo.set('');
  }

  irParaPrimeiro(): void {
    const r = this.resultados();
    if (r.length > 0) {
      this.router.navigate(r[0].rota);
      this.fechar();
    }
  }
}
