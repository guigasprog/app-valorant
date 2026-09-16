import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../services/dados.service';
import { ReservaDirective } from '../component/reserva.directive';
import {
  arteDaSkin,
  categoriaDe,
  iconeDaArma,
  skinsDe,
  traduzirEnum,
  videoDaSkin,
  type Arma,
  type Skin,
} from '../models/valorant';

/**
 * A página de uma arma: a tabela de dano e as estatísticas.
 *
 * O dano é o número que decide compra em partida — quantos tiros para matar, e
 * a que distância isso muda. A API entrega isso em `damageRanges`, uma faixa
 * por trecho de distância, e algumas armas têm três: o mesmo tiro que mata de
 * cabeça a 10 metros pode não matar a 30.
 *
 * A faca é a única sem `weaponStats`: não é comprada nem tem alcance. Em vez de
 * mostrar uma tabela vazia, a página diz isso.
 */
@Component({
  selector: 'app-arma',
  imports: [RouterLink, ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (arma(); as a) {
      <div class="envolve">
        <nav class="migalha">
          <a routerLink="/armas">← Todas as armas</a>
        </nav>

        <header class="topo">
          <div class="identidade">
            <p class="categoria">{{ categoria(a) }}</p>
            <h1 class="vazado">{{ a.displayName }}</h1>
            @if (a.shopData; as loja) {
              <p class="preco">
                <span class="numero">{{ loja.cost }}</span>
                <span class="moeda">créditos</span>
              </p>
            } @else {
              <p class="preco sem">Não é comprada</p>
            }
          </div>

          <img
            class="arte"
            [src]="imagem(a)"
            [reserva]="a.displayIcon"
            [alt]="a.displayName"
            decoding="async"
          />
        </header>

        <div class="abas" role="tablist">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="aba() === 'ficha'"
            [class.ativa]="aba() === 'ficha'"
            (click)="aba.set('ficha')"
          >
            Ficha
          </button>
          @if (skins().length > 0) {
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="aba() === 'skins'"
              [class.ativa]="aba() === 'skins'"
              (click)="aba.set('skins')"
            >
              Skins <span class="quantas">{{ skins().length }}</span>
            </button>
          }
        </div>

        @if (aba() === 'skins') {
          <section class="skins" role="tabpanel">
            @if (aberta(); as skin) {
              <div class="visor">
                <button type="button" class="fechar" (click)="abrir(null)">
                  ← Voltar às skins
                </button>
                <h2>{{ skin.displayName }}</h2>

                @if (video(skin); as url) {
                  <!-- Com controles e sem autoplay: é um vídeo pesado vindo da
                       CDN da Riot, e ninguém pediu para ele tocar sozinho. -->
                  <video
                    class="clipe canto"
                    [src]="url"
                    controls
                    preload="none"
                    playsinline
                    [poster]="arte(skin) ?? ''"
                  ></video>
                } @else {
                  <img class="clipe canto" [src]="arte(skin) ?? ''" [alt]="skin.displayName" />
                  <p class="sem-video">Esta skin não tem vídeo de inspeção na API.</p>
                }

                @if (skin.chromas.length > 1) {
                  <div class="cromas">
                    <span class="rotulo">Variantes</span>
                    <ul>
                      @for (c of skin.chromas; track c.uuid) {
                        <li>
                          @if (c.swatch) {
                            <img [src]="c.swatch" [alt]="c.displayName" loading="lazy" />
                          }
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            } @else {
              <ul class="grade-skins">
                @for (s of skins(); track s.uuid) {
                  <li>
                    <button
                      type="button"
                      class="skin canto"
                      [style.--cor-tier]="corDoTier(s)"
                      (click)="abrir(s)"
                    >
                      <img [src]="arte(s) ?? ''" [alt]="s.displayName" loading="lazy" />
                      <span class="nome">{{ s.displayName }}</span>
                      <span class="marcas">
                        @if (nomeDoTier(s); as t) {
                          <span class="tier">{{ t }}</span>
                        }
                        @if (video(s)) {
                          <span class="tem-video" title="Tem vídeo de inspeção">▶</span>
                        }
                      </span>
                    </button>
                  </li>
                }
              </ul>
            }
          </section>
        } @else {
          <!-- Aninhado em vez de uma cadeia com else-if: o Angular só aceita a
               captura "as" no @if principal da cadeia. -->
          @if (a.weaponStats; as s) {
          <section class="dano">
            <h2>Dano por distância</h2>
            <div class="rolagem">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Distância</th>
                    <th scope="col">Cabeça</th>
                    <th scope="col">Corpo</th>
                    <th scope="col">Perna</th>
                  </tr>
                </thead>
                <tbody>
                  @for (f of s.damageRanges; track f.rangeStartMeters) {
                    <tr>
                      <th scope="row">{{ f.rangeStartMeters }}–{{ f.rangeEndMeters }} m</th>
                      <td class="cabeca">{{ arredondar(f.headDamage) }}</td>
                      <td>{{ arredondar(f.bodyDamage) }}</td>
                      <td>{{ arredondar(f.legDamage) }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="nota">
              Um agente tem 100 de vida e 50 de escudo.
              @if (matamDeUmTiro(s.damageRanges[0].headDamage)) {
                Na primeira faixa, um tiro na cabeça mata mesmo com escudo cheio.
              }
            </p>
          </section>

          <section class="fichas">
            <h2>Ficha</h2>
            <dl>
              @for (linha of ficha(s); track linha.rotulo) {
                <div>
                  <dt>{{ linha.rotulo }}</dt>
                  <dd>{{ linha.valor }}</dd>
                </div>
              }
            </dl>
          </section>
        } @else {
          <p class="sem-ficha">
            Esta arma não tem tabela de dano na API — não é comprada nem tem
            alcance para medir.
          </p>
          }
        }
      </div>
    } @else {
      <div class="envolve ausente">
        <h1 class="vazado">Arma não encontrada</h1>
        <a routerLink="/armas" class="voltar canto">Ver todas as armas</a>
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
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
      }
    }

    .categoria {
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

    .preco {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-top: 1.25rem;
    }

    .numero {
      font-family: 'Druk Wide', sans-serif;
      font-size: 2rem;
      color: var(--osso);
    }

    .moeda {
      font-size: 0.72rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--cinza);
    }

    .preco.sem {
      color: var(--cinza);
      font-size: 0.9rem;
    }

    /*
     * 420px é o tamanho REAL do maior arquivo que a API oferece para a arma:
     * displayIcon e shopData.newImage são o mesmo 420x128. Esticar além disso
     * não revela detalhe nenhum, só borra. A qualidade ruim vinha daqui, não
     * da compressão.
     */
    .arte {
      width: 100%;
      max-width: 420px;
      height: auto;
      justify-self: center;
      filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6));
    }

    h2 {
      font-size: 1rem;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }

    .dano {
      margin-top: 3rem;
    }

    /* A tabela tem quatro colunas e não encolhe bem: no celular ela rola
       sozinha em vez de espremer os números até ficarem ilegíveis. */
    .rolagem {
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 26rem;
      border-collapse: collapse;
      border: 1px solid var(--borda);
    }

    th,
    td {
      padding: 0.7rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--borda);
      font-variant-numeric: tabular-nums;
    }

    thead th {
      font-size: 0.64rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--cinza);
      background: var(--noite-alta);
    }

    tbody th {
      font-weight: 700;
      font-size: 0.86rem;
      color: rgba(236, 232, 225, 0.8);
    }

    tbody td {
      font-size: 1rem;
    }

    .cabeca {
      color: var(--vermelho);
      font-weight: 700;
    }

    .nota {
      margin-top: 0.9rem;
      font-size: 0.82rem;
      color: var(--cinza);
      max-width: 54ch;
      line-height: 1.6;
    }

    .fichas {
      margin-top: 3rem;
      padding-bottom: 3rem;
    }

    .fichas dl {
      display: grid;
      gap: 1px;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 12rem), 1fr));
      background: var(--borda);
      border: 1px solid var(--borda);
    }

    .fichas dl > div {
      padding: 1rem 1.1rem;
      background: var(--noite-alta);
    }

    .fichas dt {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--cinza);
    }

    .fichas dd {
      margin-top: 0.35rem;
      font-size: 1rem;
      font-variant-numeric: tabular-nums;
    }

    .sem-ficha {
      margin-top: 2.5rem;
      padding-bottom: 3rem;
      color: var(--cinza);
      max-width: 52ch;
      line-height: 1.7;
    }

    /* ── Abas ── */
    .abas {
      display: flex;
      gap: 0.5rem;
      margin-top: 2.5rem;
      border-bottom: 1px solid var(--borda);
    }

    .abas button {
      padding: 0.7rem 1.1rem;
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--cinza);
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 140ms ease;
    }

    .abas button:hover {
      color: var(--osso);
    }

    .abas button.ativa {
      color: var(--osso);
      border-bottom-color: var(--vermelho);
    }

    .quantas {
      color: var(--vermelho);
    }

    /* ── Skins ── */
    .skins {
      margin-top: 2rem;
      padding-bottom: 3rem;
    }

    .grade-skins {
      list-style: none;
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
    }

    .skin {
      --cor-canto: var(--cor-tier, var(--borda));

      display: flex;
      flex-direction: column;
      gap: 0.7rem;
      width: 100%;
      padding: 1rem;
      text-align: left;
      background: var(--noite-alta);
      border: 1px solid var(--cor-tier, var(--borda));
      transition:
        background 150ms ease,
        transform 150ms ease;
    }

    .skin:hover {
      background: var(--noite-card);
      transform: translateY(-3px);
    }

    /* A arte da skin vem em proporções diferentes por categoria — faca e Odin
       não cabem na mesma caixa sem altura fixa e contain. */
    .skin img {
      width: 100%;
      height: 68px;
      object-fit: contain;
    }

    .nome {
      font-size: 0.82rem;
      font-weight: 700;
      line-height: 1.3;
    }

    .marcas {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .tier {
      font-size: 0.6rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cor-tier, var(--cinza));
    }

    .tem-video {
      font-size: 0.6rem;
      color: var(--cinza);
    }

    /* ── Visor de uma skin ── */
    .fechar {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--cinza);
    }

    .fechar:hover {
      color: var(--osso);
    }

    .visor h2 {
      margin-top: 1rem;
      font-size: var(--t-secao);
    }

    .clipe {
      width: 100%;
      max-width: 52rem;
      margin-top: 1.25rem;
      background: #000;
      border: 1px solid var(--borda);
    }

    .sem-video {
      margin-top: 0.8rem;
      font-size: 0.84rem;
      color: var(--cinza);
    }

    .cromas {
      margin-top: 1.5rem;
    }

    .cromas .rotulo {
      display: block;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--cinza);
      margin-bottom: 0.6rem;
    }

    .cromas ul {
      list-style: none;
      display: flex;
      gap: 0.5rem;
    }

    .cromas img {
      width: 34px;
      height: 34px;
      object-fit: cover;
      border: 1px solid var(--borda);
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
export class ArmaPage {
  readonly uuid = input.required<string>();

  private readonly dados = inject(DadosService);

  readonly arma = computed(() => this.dados.armaPorUuid(this.uuid()));

  readonly aba = signal<'ficha' | 'skins'>('ficha');
  readonly aberta = signal<Skin | null>(null);

  readonly skins = computed(() => {
    const a = this.arma();
    return a ? skinsDe(a) : [];
  });

  constructor() {
    // Trocar de arma volta para a ficha e fecha a skin aberta: continuar numa
    // skin da arma anterior não seria o que o clique pediu.
    effect(() => {
      this.uuid();
      this.aba.set('ficha');
      this.aberta.set(null);
    });
  }

  abrir(skin: Skin | null): void {
    this.aberta.set(skin);
  }

  arte = (s: Skin) => arteDaSkin(s);
  video = (s: Skin) => videoDaSkin(s);

  nomeDoTier(skin: Skin): string | null {
    if (!skin.contentTierUuid) return null;
    return this.dados.tiers().get(skin.contentTierUuid)?.displayName ?? null;
  }

  corDoTier(skin: Skin): string | null {
    if (!skin.contentTierUuid) return null;
    const cor = this.dados.tiers().get(skin.contentTierUuid)?.highlightColor;
    // A API devolve hex de 8 dígitos com alfa; o alfa costuma vir baixo e
    // apagaria a borda.
    return cor ? `#${cor.slice(0, 6)}` : null;
  }

  imagem = (a: Arma) => iconeDaArma(a);
  categoria = (a: Arma) => categoriaDe(a);

  /** O dano vem com casas decimais que não interessam a ninguém em partida. */
  arredondar = (n: number) => Math.round(n);

  /** 100 de vida + 50 de escudo. */
  matamDeUmTiro = (danoNaCabeca: number) => danoNaCabeca >= 150;

  ficha(s: NonNullable<Arma['weaponStats']>): { rotulo: string; valor: string }[] {
    const linhas: { rotulo: string; valor: string }[] = [
      { rotulo: 'Cadência', valor: `${s.fireRate} tiros/s` },
      { rotulo: 'Carregador', valor: `${s.magazineSize} balas` },
      { rotulo: 'Recarga', valor: `${s.reloadTimeSeconds} s` },
      { rotulo: 'Saque', valor: `${s.equipTimeSeconds} s` },
      { rotulo: 'Velocidade ao correr', valor: `${s.runSpeedMultiplier}x` },
    ];

    if (s.shotgunPelletCount > 0) {
      linhas.push({ rotulo: 'Bagos por tiro', valor: String(s.shotgunPelletCount) });
    }

    // Os enums só aparecem quando existem: a maioria das armas tem `feature` e
    // `altFireType` nulos, e uma ficha cheia de "—" não informa nada.
    const opcionais: [string, string | null][] = [
      ['Penetração', traduzirEnum(s.wallPenetration)],
      ['Disparo', traduzirEnum(s.fireMode)],
      ['Tiro alternativo', traduzirEnum(s.altFireType)],
      ['Característica', traduzirEnum(s.feature)],
    ];

    for (const [rotulo, valor] of opcionais) {
      if (valor) linhas.push({ rotulo, valor });
    }

    return linhas;
  }
}
