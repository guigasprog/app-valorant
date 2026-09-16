import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal, type Type } from '@angular/core';
import { DadosService } from './services/dados.service';
import { InicioPage } from './page/inicio.page';
import { AgentesPage } from './page/agentes.page';
import { MapasPage } from './page/mapas.page';
import { ArmasPage } from './page/armas.page';
import { HeaderComponent } from './component/header.component';
import { categoriaDe, gradienteDe, modoDoMapa, type Agente, type Arma, type Mapa } from './models/valorant';

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
  },
  {
    uuid: 'm2',
    displayName: 'District',
    coordinates: null,
    displayIcon: null,
    splash: 'district-splash.png',
    tacticalDescription: null,
    assetPath: '/Game/Maps/HURM_Alley/HURM_Alley_PrimaryAsset',
  },
];

const ARMAS: Arma[] = [
  {
    uuid: 'w1',
    displayName: 'Vandal',
    category: 'EEquippableCategory::Rifle',
    displayIcon: 'vandal.png',
    shopData: { cost: 2900, categoryText: 'Rifles' },
  },
  // A faca não é comprada: shopData nulo.
  {
    uuid: 'w2',
    displayName: 'Confronto',
    category: 'EEquippableCategory::Melee',
    displayIcon: 'faca.png',
    shopData: null,
  },
];

function servicoFalso() {
  return {
    estado: signal<'carregando' | 'pronto' | 'erro'>('pronto'),
    agentes: signal(AGENTES),
    mapas: signal(MAPAS),
    armas: signal(ARMAS),
    mapaDeFundo: signal<Mapa | null>(MAPAS[0]),
    pronto: signal(true),
    carregar: () => {},
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

  it('sobrevive a agente sem retrato, caindo no ícone', async () => {
    const fixture = await montar(AgentesPage);
    const imagens = (fixture.nativeElement as HTMLElement).querySelectorAll('.retrato img');
    expect(imagens.length).toBe(2);
    expect(imagens[1].getAttribute('src')).toContain('sage.png');
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
