import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DadosService } from '../services/dados.service';
import { FavoritosService } from '../services/favoritos.service';
import { FavoritoComponent } from '../component/favorito.component';
import { ReservaDirective } from '../component/reserva.directive';
import {
  gradienteDe,
  iconeDaFuncao,
  retratoDe,
  iconeDaArma,
  categoriaDe,
  splashDe,
  type Agente,
  type Arma,
  type Mapa,
} from '../models/valorant';

/**
 * Página que lista todos os itens que o usuário marcou como favorito.
 *
 * Se não há favoritos, mostra uma mensagem convidando a explorar.
 * Os dados vêm do DadosService filtrados pelos UUIDs do FavoritosService.
 */
@Component({
  selector: 'app-favoritos',
  imports: [RouterLink, FavoritoComponent, ReservaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="envolve">
      <h1 class="vazado topo">Favoritos</h1>

      @if (total() === 0) {
        <div class="vazio">
          <p>Nenhum favorito ainda.</p>
          <p class="dica">Clique na estrela em qualquer agente, mapa ou arma para salvar aqui.</p>
        </div>
      }

      @if (agentes().length > 0) {
        <section class="grupo">
          <div class="cabeca">
            <h2>Agentes</h2>
            <span class="risco" aria-hidden="true"></span>
            <span class="quantos">{{ agentes().length }}</span>
          </div>
          <ul class="grade-agentes">
            @for (a of agentes(); track a.uuid) {
              <li>
                <a
                  class="card-agente canto"
                  [routerLink]="['/agentes', a.uuid]"
                  [style.background]="gradiente(a)"
                >
                  <app-favorito tipo="agente" [uuid]="a.uuid" />
                  <img
                    class="retrato"
                    [src]="retrato(a)"
                    [reserva]="a.bustPortrait"
                    [alt]="a.displayName"
                    loading="lazy"
                  />
                  <div class="texto">
                    <p class="funcao">
                      <img [src]="iconeFuncao(a)" [reserva]="a.role.displayIcon" alt="" aria-hidden="true" />
                      {{ a.role.displayName }}
                    </p>
                    <h3>{{ a.displayName }}</h3>
                  </div>
                </a>
              </li>
            }
          </ul>
        </section>
      }

      @if (mapas().length > 0) {
        <section class="grupo">
          <div class="cabeca">
            <h2>Mapas</h2>
            <span class="risco" aria-hidden="true"></span>
            <span class="quantos">{{ mapas().length }}</span>
          </div>
          <ul class="grade-mapas">
            @for (m of mapas(); track m.uuid) {
              <li>
                <a class="card-mapa canto" [routerLink]="['/mapas', m.uuid]">
                  <app-favorito tipo="mapa" [uuid]="m.uuid" />
                  <img
                    class="splash"
                    [src]="splash(m)"
                    [reserva]="m.splash"
                    [alt]="m.displayName"
                    loading="lazy"
                  />
                  <div class="texto-mapa">
                    <h3>{{ m.displayName }}</h3>
                  </div>
                </a>
              </li>
            }
          </ul>
        </section>
      }

      @if (armas().length > 0) {
        <section class="grupo">
          <div class="cabeca">
            <h2>Armas</h2>
            <span class="risco" aria-hidden="true"></span>
            <span class="quantos">{{ armas().length }}</span>
          </div>
          <ul class="grade-armas">
            @for (a of armas(); track a.uuid) {
              <li>
                <a class="card-arma canto" [routerLink]="['/armas', a.uuid]">
                  <app-favorito tipo="arma" [uuid]="a.uuid" />
                  <img
                    [src]="iconeArma(a)"
                    [reserva]="a.displayIcon"
                    [alt]="a.displayName"
                    loading="lazy"
                  />
                  <div class="rodape">
                    <h3>{{ a.displayName }}</h3>
                    <span class="cat">{{ categoria(a) }}</span>
                  </div>
                </a>
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

    .vazio {
      padding-block: 4rem;
      text-align: center;
    }

    .vazio p {
      color: var(--cinza);
      font-size: 1.1rem;
    }

    .dica {
      margin-top: 0.5rem;
      font-size: 0.88rem !important;
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

    /* ── Agentes ── */
    .grade-agentes {
      list-style: none;
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr));
    }

    .card-agente {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      border: 1px solid var(--borda);
      transition: transform 180ms ease, border-color 180ms ease;
    }

    .card-agente:hover {
      transform: translateY(-4px);
      border-color: var(--osso);
      --cor-canto: var(--osso);
    }

    .card-agente app-favorito {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 2;
    }

    .retrato {
      aspect-ratio: 3 / 4;
      width: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .texto {
      position: relative;
      margin-top: -3.5rem;
      padding: 0 1rem 1rem;
      background: linear-gradient(to top, rgba(15, 25, 35, 0.95) 55%, transparent);
    }

    .funcao {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--cinza);
    }

    .funcao img {
      width: 13px;
      height: 13px;
      opacity: 0.6;
    }

    .texto h3 {
      margin-top: 0.25rem;
      font-size: 1.05rem;
      letter-spacing: 0.04em;
    }

    /* ── Mapas ── */
    .grade-mapas {
      list-style: none;
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
    }

    .card-mapa {
      display: block;
      position: relative;
      overflow: hidden;
      border: 1px solid var(--borda);
      aspect-ratio: 16 / 10;
      transition: transform 180ms ease, border-color 180ms ease;
    }

    .card-mapa:hover {
      transform: translateY(-4px);
      border-color: var(--vermelho);
      --cor-canto: var(--vermelho);
    }

    .card-mapa app-favorito {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 2;
    }

    .splash {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .texto-mapa {
      position: absolute;
      inset: auto 0 0 0;
      padding: 2.5rem 1.1rem 1rem;
      background: linear-gradient(to top, rgba(15, 25, 35, 0.96) 40%, transparent);
    }

    .texto-mapa h3 {
      font-family: 'Druk Wide', sans-serif;
      font-size: 1.15rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* ── Armas ── */
    .grade-armas {
      list-style: none;
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
    }

    .card-arma {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.9rem;
      padding: 1rem;
      background: var(--noite-alta);
      border: 1px solid var(--borda);
      transition: border-color 160ms ease, background 160ms ease;
    }

    .card-arma:hover {
      background: var(--noite-card);
      border-color: var(--vermelho);
      --cor-canto: var(--vermelho);
    }

    .card-arma app-favorito {
      position: absolute;
      top: 0.3rem;
      right: 0.3rem;
      z-index: 2;
    }

    .card-arma img {
      width: 100%;
      height: 72px;
      object-fit: contain;
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

    .cat {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--cinza);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
  `,
})
export class FavoritosPage {
  private readonly dados = inject(DadosService);
  private readonly favs = inject(FavoritosService);

  readonly total = this.favs.total;

  readonly agentes = computed(() =>
    this.dados.agentes().filter((a) => this.favs.eFavorito('agente', a.uuid)),
  );

  readonly mapas = computed(() =>
    this.dados.mapas().filter((m) => this.favs.eFavorito('mapa', m.uuid)),
  );

  readonly armas = computed(() =>
    this.dados.armas().filter((a) => this.favs.eFavorito('arma', a.uuid)),
  );

  gradiente = (a: Agente) => gradienteDe(a);
  retrato = (a: Agente) => retratoDe(a);
  iconeFuncao = (a: Agente) => iconeDaFuncao(a);
  splash = (m: Mapa) => splashDe(m);
  iconeArma = (a: Arma) => iconeDaArma(a);
  categoria = (a: Arma) => categoriaDe(a);
}
