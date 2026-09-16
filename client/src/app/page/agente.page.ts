import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../services/dados.service';
import { ReservaDirective } from '../component/reserva.directive';
import {
  gradienteDe,
  habilidadesOrdenadas,
  iconeDaFuncao,
  iconeDe,
  iconeDaHabilidade,
  retratoDe,
  teclaDe,
  type Agente,
  type Habilidade,
} from '../models/valorant';

/**
 * A página de um agente: retrato grande, elenco inteiro numa coluna rolável à
 * direita, e as habilidades embaixo com o texto completo de cada uma.
 *
 * Não há vídeo de habilidade. Varri a base inteira: os campos de habilidade são
 * `slot`, `displayName`, `description` e `displayIcon`, e nada mais — os vídeos
 * do site oficial não passam por esta API. Em vez do vídeo, cada habilidade
 * mostra a tecla com que é acionada no jogo, que a API também não dá pronta
 * (ela devolve "Grenade" e "Ability1"; ver `teclaDe`).
 */
@Component({
  selector: 'app-agente',
  imports: [RouterLink, ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (agente(); as a) {
      <article class="palco" [style.background]="gradiente(a)">
        @if (a.background) {
          <img class="marca" [src]="a.background" alt="" aria-hidden="true" />
        }

        <div class="conteudo">
          <div class="coluna">
            <nav class="migalha">
              <a routerLink="/agentes">← Todos os agentes</a>
            </nav>

            <p class="funcao">
              <img
                [src]="iconeFuncao(a)"
                [reserva]="a.role.displayIcon"
                alt=""
                aria-hidden="true"
              />
              {{ a.role.displayName }}
            </p>

            <h1 class="vazado">{{ a.displayName }}</h1>
            <p class="bio">{{ a.description }}</p>

            <section class="habilidades" aria-label="Habilidades">
              <ul class="teclas" role="tablist">
                @for (h of habilidades(a); track h.slot) {
                  <li role="presentation">
                    <button
                      type="button"
                      role="tab"
                      [attr.aria-selected]="h.slot === escolhida()?.slot"
                      [class.ativa]="h.slot === escolhida()?.slot"
                      (click)="slot.set(h.slot)"
                    >
                      <img
                        [src]="iconeHabilidade(a, h)"
                        [reserva]="h.displayIcon"
                        [alt]="h.displayName"
                      />
                      @if (tecla(h); as t) {
                        <span class="tecla" aria-hidden="true">{{ t }}</span>
                      }
                    </button>
                  </li>
                }
              </ul>

              @if (escolhida(); as h) {
                <div class="detalhe" role="tabpanel">
                  <h2>{{ h.displayName }}</h2>
                  <p>{{ h.description }}</p>
                </div>
              }
            </section>
          </div>

          <div class="retrato">
            <img
              [src]="retrato(a)"
              [reserva]="a.fullPortrait ?? a.bustPortrait"
              [alt]="a.displayName"
              decoding="async"
            />
          </div>
        </div>

        <!-- O elenco inteiro, rolável, como no site do jogo: dá para pular de
             agente em agente sem voltar para a grade. -->
        <nav class="elenco" aria-label="Escolher agente">
          <ul>
            @for (outro of elenco(); track outro.uuid) {
              <li>
                <a
                  [routerLink]="['/agentes', outro.uuid]"
                  [class.atual]="outro.uuid === a.uuid"
                  [attr.aria-current]="outro.uuid === a.uuid ? 'page' : null"
                  [title]="outro.displayName"
                >
                  <img
                    [src]="icone(outro)"
                    [reserva]="outro.displayIcon"
                    [alt]="outro.displayName"
                    loading="lazy"
                  />
                </a>
              </li>
            }
          </ul>
        </nav>
      </article>
    } @else {
      <div class="envolve ausente">
        <h1 class="vazado">Agente não encontrado</h1>
        <p>Esse identificador não bate com nenhum agente da lista.</p>
        <a routerLink="/agentes" class="voltar canto">Ver todos os agentes</a>
      </div>
    }
  `,
  styles: `
    .palco {
      position: relative;
      overflow: hidden;
      min-height: calc(100dvh - 57px);
      margin-block: calc(clamp(1.75rem, 4vw, 3.5rem) * -1);
    }

    /* A arte de fundo do agente, quase apagada: dá textura sem disputar com o
       retrato, que é o que se veio ver. */
    .marca {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.18;
      mix-blend-mode: overlay;
      pointer-events: none;
    }

    .conteudo {
      position: relative;
      display: grid;
      gap: 2rem;
      align-items: center;
      width: 100%;
      max-width: 82rem;
      margin-inline: auto;
      /* A faixa da direita é do elenco; o padding evita que o retrato passe
         por baixo dele em telas largas. */
      padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2.5rem);
      padding-right: clamp(1rem, 4vw, 7rem);
    }

    @media (min-width: 900px) {
      .conteudo {
        grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
      }
    }

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

    .funcao {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--vermelho);
    }

    .funcao img {
      width: 16px;
      height: 16px;
    }

    h1 {
      margin-top: 0.5rem;
      font-size: var(--t-titulao);
      line-height: 0.9;
    }

    .bio {
      max-width: 44ch;
      margin-top: 1.25rem;
      line-height: 1.7;
      color: rgba(236, 232, 225, 0.75);
    }

    /* ── Habilidades ── */
    .habilidades {
      margin-top: 2.5rem;
    }

    .teclas {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .teclas button {
      position: relative;
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(236, 232, 225, 0.2);
      transition:
        background 150ms ease,
        border-color 150ms ease;
    }

    .teclas button:hover {
      border-color: var(--osso);
    }

    .teclas button.ativa {
      background: var(--osso);
      border-color: var(--osso);
    }

    .teclas img {
      width: 28px;
      height: 28px;
      transition: filter 150ms ease;
    }

    /* Os ícones vêm brancos; sobre o fundo claro do estado ativo eles sumiriam. */
    .teclas button.ativa img {
      filter: invert(1);
    }

    .tecla {
      position: absolute;
      right: 3px;
      bottom: 1px;
      font-size: 0.6rem;
      font-weight: 700;
      color: var(--cinza);
    }

    .teclas button.ativa .tecla {
      color: var(--noite);
    }

    .detalhe {
      margin-top: 1.5rem;
      min-height: 8rem;
      max-width: 46ch;
    }

    .detalhe h2 {
      font-size: 1.15rem;
      letter-spacing: 0.06em;
    }

    .detalhe p {
      margin-top: 0.6rem;
      line-height: 1.7;
      color: rgba(236, 232, 225, 0.75);
    }

    /* ── Retrato ── */
    .retrato {
      display: flex;
      justify-content: center;
    }

    .retrato img {
      width: 100%;
      max-width: 34rem;
      height: auto;
      filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.6));
    }

    @media (max-width: 899px) {
      .retrato {
        order: -1;
      }
      .retrato img {
        max-width: 20rem;
      }
    }

    /* ── Elenco ── */
    .elenco {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 5rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      background: rgba(15, 25, 35, 0.55);
      border-left: 1px solid rgba(236, 232, 225, 0.12);
      backdrop-filter: blur(6px);
    }

    .elenco ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
      gap: 0.35rem;
    }

    .elenco a {
      display: block;
      border: 1px solid transparent;
      opacity: 0.55;
      transition:
        opacity 140ms ease,
        border-color 140ms ease;
    }

    .elenco a:hover {
      opacity: 1;
      border-color: rgba(236, 232, 225, 0.4);
    }

    .elenco a.atual {
      opacity: 1;
      border-color: var(--vermelho);
    }

    .elenco img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }

    /* No celular não há canto direito que sobre: o elenco vira uma fita
       horizontal presa embaixo. */
    @media (max-width: 899px) {
      .elenco {
        position: sticky;
        top: auto;
        bottom: 0;
        left: 0;
        width: 100%;
        height: auto;
        overflow-x: auto;
        overflow-y: hidden;
        border-left: none;
        border-top: 1px solid rgba(236, 232, 225, 0.12);
      }

      .elenco ul {
        flex-direction: row;
      }

      .elenco li {
        flex: 0 0 3.25rem;
      }
    }

    /* ── Ausente ── */
    .ausente {
      padding-block: clamp(3rem, 12vw, 8rem);
    }

    .ausente h1 {
      font-size: var(--t-titulo);
    }

    .ausente p {
      margin-top: 1rem;
      color: var(--cinza);
    }

    .voltar {
      /* Botão preenchido: o canto vira sombra, não a cor da borda. */
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
export class AgentePage {
  /** Vem do parâmetro da rota, via `withComponentInputBinding`. */
  readonly uuid = input.required<string>();

  private readonly dados = inject(DadosService);

  readonly agente = computed(() => this.dados.agentePorUuid(this.uuid()));
  readonly elenco = computed(() => this.dados.agentes());

  /** Slot escolhido. Nulo significa "a primeira da lista". */
  readonly slot = signal<string | null>(null);

  readonly escolhida = computed<Habilidade | null>(() => {
    const a = this.agente();
    if (!a) return null;

    const lista = habilidadesOrdenadas(a);
    const alvo = this.slot();
    return lista.find((h) => h.slot === alvo) ?? lista[0] ?? null;
  });

  constructor() {
    // Trocar de agente pela coluna da direita volta para a primeira habilidade.
    // Sem isto, quem estava lendo a ultimate de um agente cairia na ultimate do
    // seguinte — que não foi o que pediu ao clicar.
    effect(() => {
      this.uuid();
      this.slot.set(null);
    });
  }

  gradiente = (a: Agente) => gradienteDe(a);
  retrato = (a: Agente) => retratoDe(a);
  icone = (a: Agente) => iconeDe(a);
  iconeFuncao = (a: Agente) => iconeDaFuncao(a);
  iconeHabilidade = (a: Agente, h: Habilidade) => iconeDaHabilidade(a, h);
  habilidades = (a: Agente) => habilidadesOrdenadas(a);
  tecla = (h: Habilidade) => teclaDe(h);
}
