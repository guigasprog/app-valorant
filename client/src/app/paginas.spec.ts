import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, type Type } from '@angular/core';
import { DadosService } from './services/dados.service';
import { InicioPage } from './page/inicio.page';
import { AgentesPage } from './page/agentes.page';
import { AgentePage } from './page/agente.page';
import { MapaPage } from './page/mapa.page';
import { ArmaPage } from './page/arma.page';
import { MapasPage } from './page/mapas.page';
import { ArmasPage } from './page/armas.page';
import { HeaderComponent } from './component/header.component';
import {
  calloutsPosicionados,
  categoriaDe,
  gradienteDe,
  modoDoMapa,
  skinsDe,
  videoDaSkin,
  type Agente,
  type Arma,
  type Mapa,
} from './models/valorant';

/**
 * Testes de fumaça: cada página monta e mostra o que promete.
 *
 * Existem porque `strictTemplates` pega binding errado em tempo de build, mas
 * não pega o que só quebra rodando — um `computed` que estoura, um campo nulo
 * que o template não previu. Os dados abaixo copiam a forma real da API,
 * incluindo as partes chatas: gradiente com alfa `00` no fim, habilidade sem
 * ícone, faca sem `shopData`, mapa de Duelo sem `tacticalDescription`.
 */

const AGENTES: Agente[] = [
  {
    uuid: 'a1',
    displayName: 'Jett',
    description: 'Duelista veloz.',
    displayIcon: 'jett.png',
    displayIconSmall: 'jett-pequeno.png',
    bustPortrait: 'jett-busto.png',
    fullPortrait: 'jett-inteiro.png',
    background: 'jett-fundo.png',
    // A última parada vem transparente na API — é o caso que apagaria o card.
    backgroundGradientColors: ['371c5cff', '0f1923ff', '3a2656ff', '0f192300'],
    role: { uuid: 'r1', displayName: 'Duelista', description: '', displayIcon: 'duelista.png' },
    abilities: [
      { slot: 'Ability1', displayName: 'Corrente Ascendente', description: '', displayIcon: 'q.png' },
      // Passiva sem ícone: precisa ser filtrada, senão vira quadrado vazio.
      { slot: 'Passive', displayName: 'Impulso', description: '', displayIcon: null },
    ],
  },
  {
    uuid: 'a2',
    displayName: 'Sage',
    description: 'Sentinela de suporte.',
    displayIcon: 'sage.png',
    displayIconSmall: null,
    bustPortrait: null,
    fullPortrait: null,
    background: null,
    backgroundGradientColors: [],
    role: { uuid: 'r2', displayName: 'Sentinela', description: '', displayIcon: 'sentinela.png' },
    abilities: [],
  },
];

const MAPAS: Mapa[] = [
  {
    uuid: 'm1',
    displayName: 'Ascent',
    coordinates: '45.0000° N',
    displayIcon: 'ascent.png',
    splash: 'ascent-splash.png',
    tacticalDescription: 'A/B',
    assetPath: '/Game/Maps/Ascent/Ascent_PrimaryAsset',
    // Multiplicadores reais do Ascent.
    xMultiplier: 0.00007,
    yMultiplier: -0.00007,
    xScalarToAdd: 0.813895,
    yScalarToAdd: 0.573242,
    callouts: [
      { regionName: 'Árvore', superRegionName: 'A', location: { x: 3980.9, y: -5938.75 } },
      { regionName: 'Mercado', superRegionName: 'Meio', location: { x: 0, y: 0 } },
      // Vem como fragmento de frase na API — vira título de grupo aqui.
      { regionName: 'Pátio', superRegionName: 'no Lado Atacante', location: { x: 100, y: 100 } },
    ],
  },
  {
    uuid: 'm2',
    displayName: 'District',
    coordinates: null,
    displayIcon: null,
    splash: 'district-splash.png',
    tacticalDescription: null,
    assetPath: '/Game/Maps/HURM_Alley/HURM_Alley_PrimaryAsset',
    // Os mapas de Duelo por Equipes não têm callouts nem multiplicadores.
    callouts: null,
    xMultiplier: null,
    yMultiplier: null,
    xScalarToAdd: null,
    yScalarToAdd: null,
  },
];

const ARMAS: Arma[] = [
  {
    uuid: 'w1',
    displayName: 'Vandal',
    category: 'EEquippableCategory::Rifle',
    displayIcon: 'vandal.png',
    defaultSkinUuid: 's0',
    skins: [
      // A primeira é a arma sem skin: não entra na grade.
      { uuid: 's0', displayName: 'Vandal Padrão', contentTierUuid: null, displayIcon: 'v.png', chromas: [], levels: [] },
      {
        uuid: 's1',
        displayName: 'Vandal RGX 11z Pro',
        contentTierUuid: 't1',
        displayIcon: 'rgx.png',
        chromas: [{ uuid: 'c1', displayName: 'RGX', displayIcon: null, fullRender: 'rgx-full.png', swatch: 'rgx-sw.png', streamedVideo: null }],
        levels: [{ uuid: 'l1', displayName: 'RGX', displayIcon: 'rgx.png', streamedVideo: 'rgx.mp4' }],
      },
      // Sem imagem nenhuma: viraria quadrado vazio, então é descartada.
      { uuid: 's2', displayName: 'Fantasma', contentTierUuid: null, displayIcon: null, chromas: [], levels: [] },
    ],
    weaponStats: {
      fireRate: 9.75,
      magazineSize: 25,
      runSpeedMultiplier: 5.4,
      equipTimeSeconds: 1,
      reloadTimeSeconds: 2.5,
      firstBulletAccuracy: 0,
      shotgunPelletCount: 0,
      wallPenetration: 'EWallPenetrationDisplayType::Medium',
      feature: null,
      fireMode: null,
      altFireType: 'EWeaponAltFireDisplayType::ADS',
      damageRanges: [
        { rangeStartMeters: 0, rangeEndMeters: 50, headDamage: 160, bodyDamage: 40, legDamage: 34 },
      ],
    },
    shopData: { cost: 2900, categoryText: 'Rifles' },
  },
  // A faca não é comprada: shopData nulo.
  {
    uuid: 'w2',
    displayName: 'Confronto',
    category: 'EEquippableCategory::Melee',
    displayIcon: 'faca.png',
    defaultSkinUuid: 'k0',
    skins: [],
    weaponStats: null,
    shopData: null,
  },
];

function servicoFalso() {
  // As listas ficam em locais para as buscas lerem o SINAL, e não o array
  // original. É o que o serviço real faz — e sem isso a dublê acharia uma arma
  // que, de verdade, ainda não chegou.
  const agentes = signal(AGENTES);
  const mapas = signal(MAPAS);
  const armas = signal(ARMAS);

  return {
    agentes,
    mapas,
    armas,
    agentePorUuid: (uuid: string) => agentes().find((a) => a.uuid === uuid),
    mapaPorUuid: (uuid: string) => mapas().find((m) => m.uuid === uuid),
    armaPorUuid: (uuid: string) => armas().find((a) => a.uuid === uuid),
    estado: signal<'carregando' | 'pronto' | 'erro'>('pronto'),
    tiers: signal(new Map([['t1', { uuid: 't1', displayName: 'Edição Premium', highlightColor: 'd1548dff', displayIcon: 't.png' }]])),
    mapaDeFundo: signal<Mapa | null>(MAPAS[0]),
    pronto: signal(true),
    estadoArmas: signal<'carregando' | 'pronto' | 'erro'>('pronto'),
    carregar: () => {},
    carregarArmas: () => {},
    sortearFundo: () => {},
  };
}

async function montar<T>(componente: Type<T>) {
  await TestBed.configureTestingModule({
    imports: [componente],
    providers: [provideRouter([]), { provide: DadosService, useValue: servicoFalso() }],
  }).compileComponents();

  const fixture = TestBed.createComponent(componente);
  fixture.detectChanges();
  return fixture;
}

describe('Regras de leitura da API', () => {
  it('descarta o alfa do gradiente, para a última parada não apagar o card', () => {
    expect(gradienteDe(AGENTES[0])).toContain('#0f1923');
    expect(gradienteDe(AGENTES[0])).not.toContain('00,');
    expect(gradienteDe(AGENTES[0])).not.toContain('ff');
  });

  it('cai num gradiente padrão quando o agente não traz cores', () => {
    expect(gradienteDe(AGENTES[1])).toContain('linear-gradient');
  });

  it('traduz a categoria interna da arma', () => {
    expect(categoriaDe(ARMAS[0])).toBe('Rifles');
    expect(categoriaDe(ARMAS[1])).toBe('Corpo a corpo');
  });

  it('separa mapa de partida padrão de mapa de Duelo', () => {
    expect(modoDoMapa(MAPAS[0])).toBe('padrao');
    expect(modoDoMapa(MAPAS[1])).toBe('duelo');
  });

  it('descarta o que não é mapa de jogar', () => {
    const treino: Mapa = {
      uuid: 'm3',
      displayName: 'The Range',
      coordinates: '0° N',
      displayIcon: null,
      splash: 'range.png',
      tacticalDescription: null,
      assetPath: '/Game/Maps/Poveglia/Range_PrimaryAsset',
      callouts: null,
      xMultiplier: null,
      yMultiplier: null,
      xScalarToAdd: null,
      yScalarToAdd: null,
    };
    expect(modoDoMapa(treino)).toBeNull();
  });
});

describe('Início', () => {
  it('mostra um portal por seção, com a contagem de cada uma', async () => {
    const fixture = await montar(InicioPage);
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('Agentes');
    expect(texto).toContain('Mapas');
    expect(texto).toContain('Armas');
    // 2 agentes, 2 mapas, 2 armas nos dados de teste.
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.portal').length).toBe(3);
  });
});

describe('Agentes', () => {
  it('lista os agentes e monta o filtro a partir das funções presentes', async () => {
    const fixture = await montar(AgentesPage);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.card').length).toBe(2);
    expect(el.textContent).toContain('Jett');
    expect(el.textContent).toContain('Duelista');
    expect(el.textContent).toContain('Sentinela');
  });

  it('não desenha quadrado para habilidade sem ícone', async () => {
    const fixture = await montar(AgentesPage);
    const el = fixture.nativeElement as HTMLElement;

    // Jett tem duas habilidades, uma sem ícone; Sage não tem nenhuma.
    expect(el.querySelectorAll('.habilidades li').length).toBe(1);
  });

  it('aponta para a mídia local, não para os PNGs de 2048px da API', async () => {
    const fixture = await montar(AgentesPage);
    const imagens = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('.retrato img'),
    ];

    expect(imagens.length).toBe(2);
    expect(imagens[0].getAttribute('src')).toBe('/midia/agentes/a1-retrato.webp');
  });

  it('cai na URL da API quando a cópia local não existe', async () => {
    const fixture = await montar(AgentesPage);
    const img = (fixture.nativeElement as HTMLElement).querySelector<HTMLImageElement>(
      '.retrato img',
    )!;

    // É o que acontece com um agente lançado depois da última execução do
    // script de mídia: o arquivo local dá 404 e o <img> emite `error`.
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img.getAttribute('src')).toContain('jett-busto.png');
  });
});

describe('Página do agente', () => {
  async function abrir(uuid: string) {
    await TestBed.configureTestingModule({
      imports: [AgentePage],
      providers: [provideRouter([]), { provide: DadosService, useValue: servicoFalso() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AgentePage);
    fixture.componentRef.setInput('uuid', uuid);
    fixture.detectChanges();
    return fixture;
  }

  it('mostra nome, função e descrição do agente da rota', async () => {
    const el = (await abrir('a1')).nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('Jett');
    expect(el.textContent).toContain('Duelista');
    expect(el.textContent).toContain('Duelista veloz.');
  });

  it('lista as habilidades com a tecla do jogo e abre a primeira', async () => {
    const el = (await abrir('a1')).nativeElement as HTMLElement;

    // Só a que tem ícone: a passiva de Jett vem sem, e viraria botão vazio.
    const botoes = el.querySelectorAll('.teclas button');
    expect(botoes.length).toBe(1);
    expect(el.querySelector('.tecla')?.textContent?.trim()).toBe('Q');

    // A primeira já vem aberta, para o painel nunca nascer vazio.
    expect(el.querySelector('.detalhe h2')?.textContent).toContain('Corrente Ascendente');
  });

  it('traz o elenco inteiro na coluna, marcando o atual', async () => {
    const el = (await abrir('a1')).nativeElement as HTMLElement;

    expect(el.querySelectorAll('.elenco a').length).toBe(2);
    expect(el.querySelectorAll('.elenco a.atual').length).toBe(1);
    expect(el.querySelector('.elenco a.atual')?.getAttribute('href')).toContain('a1');
  });

  it('avisa em vez de quebrar quando o uuid não existe', async () => {
    const el = (await abrir('uuid-inventado')).nativeElement as HTMLElement;

    expect(el.textContent).toContain('Agente não encontrado');
    expect(el.querySelector('.elenco')).toBeNull();
  });
});

describe('Mapas', () => {
  it('separa em dois grupos e nomeia cada modo', async () => {
    const fixture = await montar(MapasPage);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.grupo').length).toBe(2);
    expect(el.textContent).toContain('Partida padrão');
    expect(el.textContent).toContain('Duelo por Equipes');
    expect(el.textContent).toContain('Ascent');
    expect(el.textContent).toContain('District');
  });
});

describe('Armas', () => {
  it('agrupa por categoria e mostra travessão onde não há preço', async () => {
    const fixture = await montar(ArmasPage);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Rifles');
    expect(el.textContent).toContain('2900');
    expect(el.querySelector('.preco.sem')?.textContent?.trim()).toBe('—');
  });

  it('põe rifles antes de corpo a corpo, como na loja do jogo', async () => {
    const fixture = await montar(ArmasPage);
    const titulos = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.cabeca h2')].map(
      (h) => h.textContent?.trim(),
    );
    expect(titulos).toEqual(['Rifles', 'Corpo a corpo']);
  });
});

describe('Página do mapa', () => {
  async function abrir(uuid: string) {
    await TestBed.configureTestingModule({
      imports: [MapaPage],
      providers: [provideRouter([]), { provide: DadosService, useValue: servicoFalso() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MapaPage);
    fixture.componentRef.setInput('uuid', uuid);
    fixture.detectChanges();
    return fixture;
  }

  it('agrupa os callouts por sítio e tira a preposição do título', async () => {
    const el = (await abrir('m1')).nativeElement as HTMLElement;

    const titulos = [...el.querySelectorAll('.regiao h3')].map((h) => h.textContent?.trim());
    expect(titulos).toContain('A');
    expect(titulos).toContain('Meio');
    // "no Lado Atacante" vira "Lado Atacante" — como título, a preposição sobra.
    expect(titulos).toContain('Lado Atacante');
    expect(titulos).not.toContain('no Lado Atacante');
    expect(el.textContent).toContain('Árvore');
  });

  it('esconde a seção de callouts no mapa que não tem', async () => {
    const el = (await abrir('m2')).nativeElement as HTMLElement;

    expect(el.textContent).toContain('District');
    expect(el.querySelector('.callouts')).toBeNull();
  });

  it('avisa em vez de quebrar quando o uuid não existe', async () => {
    const el = (await abrir('nada')).nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mapa não encontrado');
  });
});

describe('Callouts sobre a planta', () => {
  it('converte coordenada de mundo em posição dentro da imagem', () => {
    const pontos = calloutsPosicionados(MAPAS[0]);

    expect(pontos.length).toBe(3);
    for (const p of pontos) {
      // O ponto tem que cair DENTRO da imagem, senão aparece fora da planta.
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }

    // Os eixos são trocados: o X do mundo vira o Y da imagem.
    const arvore = pontos[0];
    expect(arvore.x).toBeCloseTo(-5938.75 * 0.00007 + 0.813895, 3);
    expect(arvore.y).toBeCloseTo(3980.9 * -0.00007 + 0.573242, 3);
  });

  it('devolve vazio no mapa sem multiplicadores, em vez de NaN', () => {
    expect(calloutsPosicionados(MAPAS[1])).toEqual([]);
  });
});

describe('Skins', () => {
  it('descarta a arma padrão e as skins sem imagem', () => {
    const lista = skinsDe(ARMAS[0]);
    expect(lista.map((s) => s.displayName)).toEqual(['Vandal RGX 11z Pro']);
  });

  it('acha o vídeo de inspeção quando existe', () => {
    expect(videoDaSkin(ARMAS[0].skins[1])).toBe('rgx.mp4');
    expect(videoDaSkin(ARMAS[0].skins[0])).toBeNull();
  });
});

describe('Página da arma', () => {
  async function abrir(uuid: string) {
    await TestBed.configureTestingModule({
      imports: [ArmaPage],
      providers: [provideRouter([]), { provide: DadosService, useValue: servicoFalso() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArmaPage);
    fixture.componentRef.setInput('uuid', uuid);
    fixture.detectChanges();
    return fixture;
  }

  it('monta a tabela de dano por distância', async () => {
    const el = (await abrir('w1')).nativeElement as HTMLElement;

    const linha = el.querySelector('tbody tr');
    expect(linha?.querySelector('th')?.textContent).toContain('0–50 m');
    const celulas = [...(linha?.querySelectorAll('td') ?? [])].map((c) => c.textContent?.trim());
    expect(celulas).toEqual(['160', '40', '34']);
  });

  it('traduz os enums internos do jogo na ficha', async () => {
    const el = (await abrir('w1')).nativeElement as HTMLElement;

    // EWallPenetrationDisplayType::Medium → Média
    expect(el.textContent).toContain('Média');
    // EWeaponAltFireDisplayType::ADS → Mira (ADS)
    expect(el.textContent).toContain('Mira (ADS)');
    expect(el.textContent).not.toContain('EWallPenetration');
  });

  it('diz que está carregando em vez de "não encontrada" enquanto o arsenal vem', async () => {
    const servico = servicoFalso();
    // É o estado real de quem abre o link direto: o pedido de 3,44 MB ainda em
    // voo, então a lista está vazia.
    servico.estadoArmas.set('carregando');
    servico.armas.set([]);

    await TestBed.configureTestingModule({
      imports: [ArmaPage],
      providers: [provideRouter([]), { provide: DadosService, useValue: servico }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArmaPage);
    // Um uuid que existe: o que falta é o pedido das armas, não a arma.
    fixture.componentRef.setInput('uuid', 'w1');
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('Carregando');
    expect(texto).not.toContain('não encontrada');
  });

  it('não inventa ficha para a arma sem estatísticas', async () => {
    const el = (await abrir('w2')).nativeElement as HTMLElement;

    expect(el.textContent).toContain('Confronto');
    expect(el.textContent).toContain('Não é comprada');
    expect(el.querySelector('table')).toBeNull();
  });
});

describe('Menu', () => {
  it('leva a uma página que existe em todo item', async () => {
    const fixture = await montar(HeaderComponent);
    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('nav a')];

    expect(links.length).toBe(4);
    for (const a of links) {
      expect(a.getAttribute('href')).toBeTruthy();
    }
  });
});
