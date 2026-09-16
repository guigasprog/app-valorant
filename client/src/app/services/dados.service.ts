import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import {
  modoDoMapa,
  type Agente,
  type Arma,
  type Mapa,
  type Resposta,
  type Tier,
} from '../models/valorant';

export type Estado = 'carregando' | 'pronto' | 'erro';

/**
 * A única fonte de dados do app.
 *
 * Substitui o arranjo anterior, em que o AppComponent buscava tudo, gravava no
 * localStorage e cada página lia de lá. Três defeitos nasciam disso:
 *
 * 1. As duas chamadas eram independentes e a tela destravava assim que a
 *    PRIMEIRA terminava. Se os mapas chegassem antes dos agentes, a página de
 *    agentes renderizava e lia um localStorage ainda vazio — lista em branco,
 *    sem erro nenhum. `forkJoin` acaba com isso: ou vem tudo, ou é erro.
 * 2. Nenhum `subscribe` tinha tratamento de erro, e `carregando` só virava
 *    falso no caminho de sucesso. Offline ou API fora, a splash "VALORANT"
 *    ficava para sempre. Agora existe o estado `erro`, com botão de tentar de
 *    novo.
 * 3. O localStorage era escrito e relido para atravessar o app, servindo de
 *    canal entre componentes. Signals fazem isso sem tocar no disco e sem a
 *    janela de corrida entre gravar e ler.
 */
@Injectable({ providedIn: 'root' })
export class DadosService {
  private readonly http = inject(HttpClient);
  private readonly base = 'https://valorant-api.com/v1';

  readonly estado = signal<Estado>('carregando');
  readonly agentes = signal<Agente[]>([]);
  readonly mapas = signal<Mapa[]>([]);
  /** Cinco edições (Deluxe, Premium, Ultra…), cada uma com sua cor. */
  readonly tiers = signal<Map<string, Tier>>(new Map());

  /**
   * As armas têm estado próprio porque têm peso próprio.
   *
   * O endpoint devolve 3,44 MB: as 1405 skins do jogo vêm embutidas na mesma
   * resposta dos 20 nomes e preços, e não há como pedir sem elas. Junto no
   * forkJoin, a splash segurava a tela até esse download terminar — inclusive
   * para quem só ia olhar os agentes e sair.
   *
   * Agora o pedido sai junto, mas não bloqueia: a tela abre com agentes e
   * mapas, e as armas chegam quando chegarem. Quem for direto para /armas vê
   * um aviso de carregando em vez de uma lista vazia.
   */
  readonly estadoArmas = signal<Estado>('carregando');
  readonly armas = signal<Arma[]>([]);

  /** Um mapa sorteado serve de fundo para a tela inteira. */
  readonly mapaDeFundo = signal<Mapa | null>(null);

  readonly pronto = computed(() => this.estado() === 'pronto');

  carregar(): void {
    this.estado.set('carregando');
    this.carregarArmas();

    forkJoin({
      agentes: this.http.get<Resposta<Agente[]>>(
        `${this.base}/agents?isPlayableCharacter=true&language=pt-BR`,
      ),
      mapas: this.http.get<Resposta<Mapa[]>>(`${this.base}/maps?language=pt-BR`),
      tiers: this.http.get<Resposta<Tier[]>>(`${this.base}/contenttiers?language=pt-BR`),
    }).subscribe({
      next: ({ agentes, mapas, tiers }) => {
        // Ordem alfabética, e não por `releaseDate`: a API devolve
        // "1970-01-01" para praticamente todo agente, então ordenar por data
        // era uma comparação entre iguais que não ordenava nada.
        this.agentes.set(
          [...agentes.data].sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR')),
        );

        // Das 26 entradas que o endpoint devolve, só 18 são lugares onde se
        // joga — ver `modoDoMapa`, que explica por que o filtro não é o campo
        // `coordinates`, que parece o óbvio.
        const jogaveis = mapas.data.filter((m) => modoDoMapa(m) !== null);
        this.mapas.set(jogaveis);
        this.sortearFundo(jogaveis);

        this.tiers.set(new Map(tiers.data.map((t) => [t.uuid, t])));
        this.estado.set('pronto');
      },
      error: () => this.estado.set('erro'),
    });
  }

  /** Um agente pelo uuid da rota, ou `undefined` enquanto os dados não chegaram. */
  agentePorUuid(uuid: string): Agente | undefined {
    return this.agentes().find((a) => a.uuid === uuid);
  }

  /** Separado de `carregar` para o botão de "tentar de novo" poder repetir só isto. */
  carregarArmas(): void {
    this.estadoArmas.set('carregando');

    this.http.get<Resposta<Arma[]>>(`${this.base}/weapons?language=pt-BR`).subscribe({
      next: ({ data }) => {
        this.armas.set(data);
        this.estadoArmas.set('pronto');
      },
      error: () => this.estadoArmas.set('erro'),
    });
  }

  mapaPorUuid(uuid: string): Mapa | undefined {
    return this.mapas().find((m) => m.uuid === uuid);
  }

  armaPorUuid(uuid: string): Arma | undefined {
    return this.armas().find((a) => a.uuid === uuid);
  }

  /** Troca o fundo. Chamado a cada navegação, para a tela nunca repetir. */
  sortearFundo(candidatos: Mapa[] = this.mapas()): void {
    const comSplash = candidatos.filter((m) => m.splash);
    if (comSplash.length === 0) return;

    const atual = this.mapaDeFundo();
    const outros = comSplash.filter((m) => m.uuid !== atual?.uuid);
    const lista = outros.length > 0 ? outros : comSplash;
    this.mapaDeFundo.set(lista[Math.floor(Math.random() * lista.length)]);
  }
}
