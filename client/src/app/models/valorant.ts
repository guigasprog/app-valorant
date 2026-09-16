/**
 * O recorte da valorant-api.com que este app realmente usa.
 *
 * Só os campos consumidos, e não o retorno inteiro: a resposta de um agente
 * tem mais de vinte campos, e declarar os vinte cria a ilusão de que mexer em
 * qualquer um deles é seguro. O que está aqui é o contrato que a tela depende.
 */

export interface Habilidade {
  slot: string;
  displayName: string;
  description: string;
  /** Passivas costumam vir sem ícone — por isso pode ser nulo. */
  displayIcon: string | null;
}

export interface Funcao {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
}

export interface Agente {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
  displayIconSmall: string | null;
  bustPortrait: string | null;
  fullPortrait: string | null;
  background: string | null;
  /**
   * Duas a quatro cores em hex de 8 dígitos, COM alfa no fim ("371c5cff").
   * CSS entende `#RRGGBBAA`, então basta prefixar — mas o alfa final costuma
   * ser `00` na última parada, o que apagaria o gradiente. Ver `gradienteDe`.
   */
  backgroundGradientColors: string[];
  role: Funcao;
  abilities: Habilidade[];
}

/**
 * A tecla de cada habilidade.
 *
 * A API devolve o slot interno ("Grenade", "Ability1"), que não diz nada a quem
 * joga — no jogo essas habilidades são C, Q, E e X. A passiva não tem tecla
 * porque não é acionada.
 *
 * Não existe vídeo de habilidade nesta API: os campos são exatamente `slot`,
 * `displayName`, `description` e `displayIcon`, e mais nada, em toda a base. Os
 * vídeos do site oficial vêm de outro lugar.
 */
const TECLA: Record<string, string> = {
  Grenade: 'C',
  Ability1: 'Q',
  Ability2: 'E',
  Ultimate: 'X',
};

/** Ordem em que o jogo mostra as habilidades — não é a ordem que a API devolve. */
const ORDEM_SLOT = ['Grenade', 'Ability1', 'Ability2', 'Ultimate', 'Passive'];

export function teclaDe(habilidade: Habilidade): string | null {
  return TECLA[habilidade.slot] ?? null;
}

export function habilidadesOrdenadas(agente: Agente): Habilidade[] {
  return [...agente.abilities]
    .filter((h) => h.displayIcon)
    .sort((a, b) => {
      const ia = ORDEM_SLOT.indexOf(a.slot);
      const ib = ORDEM_SLOT.indexOf(b.slot);
      return (ia === -1 ? ORDEM_SLOT.length : ia) - (ib === -1 ? ORDEM_SLOT.length : ib);
    });
}

/** Um ponto nomeado do mapa — o vocabulário que os times usam para se falar. */
export interface Callout {
  regionName: string;
  superRegionName: string;
}

export interface Mapa {
  uuid: string;
  displayName: string;
  coordinates: string | null;
  /** O minimapa visto de cima, com a planta do mapa. */
  displayIcon: string | null;
  splash: string;
  /** "A/B/C" nos mapas de partida padrão; nulo em todo o resto. */
  tacticalDescription: string | null;
  assetPath: string;
  /** 16 dos 26 mapas têm; os de Duelo por Equipes não. */
  callouts: Callout[] | null;
}

/**
 * Agrupa os callouts pelo sítio a que pertencem.
 *
 * O `superRegionName` vem em português já pronto, mas alguns chegam como
 * fragmento de frase — "no Lado Atacante" — porque no jogo aparecem depois do
 * nome da região. Como aqui viram título de grupo, a preposição inicial sai.
 */
export function calloutsPorRegiao(mapa: Mapa): { regiao: string; nomes: string[] }[] {
  const grupos = new Map<string, string[]>();

  for (const c of mapa.callouts ?? []) {
    const regiao = c.superRegionName.replace(/^(no|na|em)\s+/i, '');
    const lista = grupos.get(regiao);
    if (lista) lista.push(c.regionName);
    else grupos.set(regiao, [c.regionName]);
  }

  return [...grupos.entries()].map(([regiao, nomes]) => ({
    regiao,
    nomes: nomes.sort((a, b) => a.localeCompare(b, 'pt-BR')),
  }));
}

export type ModoMapa = 'padrao' | 'duelo';

export const NOME_MODO: Record<ModoMapa, string> = {
  padrao: 'Partida padrão',
  duelo: 'Duelo por Equipes',
};

/**
 * Que tipo de mapa é este — ou `null` se não for um mapa de jogar.
 *
 * O endpoint devolve 26 entradas, e só 18 são lugares onde se joga. As outras
 * oito são internas: cinco variações de Duelo (assetPath `Duel_*`/`Skirmish_*`),
 * o Treinamento Básico, e o campo de tiro, que vem DUPLICADO — "The Range"
 * aparece duas vezes, com os asset paths Poveglia e PovegliaV2.
 *
 * O campo `coordinates` parece o filtro óbvio e é armadilha: ele deixa passar
 * as duas cópias do campo de tiro e barra os cinco mapas de Duelo por Equipes,
 * que são jogáveis. `tacticalDescription` só existe nos mapas de partida
 * padrão, e o prefixo HURM no asset path marca os de Duelo — juntos, separam
 * exatamente o que se quer mostrar.
 */
export function modoDoMapa(mapa: Mapa): ModoMapa | null {
  if (mapa.tacticalDescription) return 'padrao';
  if (mapa.assetPath.includes('/HURM_')) return 'duelo';
  return null;
}

/** Uma faixa de distância e o dano que a arma causa nela. */
export interface FaixaDeDano {
  rangeStartMeters: number;
  rangeEndMeters: number;
  headDamage: number;
  bodyDamage: number;
  legDamage: number;
}

export interface EstatisticasArma {
  fireRate: number;
  magazineSize: number;
  runSpeedMultiplier: number;
  equipTimeSeconds: number;
  reloadTimeSeconds: number;
  firstBulletAccuracy: number;
  shotgunPelletCount: number;
  wallPenetration: string | null;
  feature: string | null;
  fireMode: string | null;
  altFireType: string | null;
  damageRanges: FaixaDeDano[];
}

export interface Arma {
  uuid: string;
  displayName: string;
  category: string;
  displayIcon: string;
  /** A faca não tem: não é comprada nem tem tabela de dano por distância. */
  weaponStats: EstatisticasArma | null;
  shopData: {
    cost: number;
    categoryText: string;
  } | null;
}

/**
 * Os enums internos do jogo, que a API entrega crus
 * ("EWallPenetrationDisplayType::High").
 *
 * O `?? cru` no fim é de propósito: se a Riot introduzir um valor novo, ele
 * aparece com o nome interno em vez de sumir da tela — feio, mas visível, que é
 * o que faz alguém vir consertar.
 */
const TRADUCAO: Record<string, string> = {
  High: 'Alta',
  Medium: 'Média',
  Low: 'Baixa',
  SemiAutomatic: 'Semiautomática',
  FullyAutomatic: 'Automática',
  ROFIncrease: 'Cadência crescente',
  Silenced: 'Silenciada',
  DualZoom: 'Zoom duplo',
  ADS: 'Mira (ADS)',
  AirBurst: 'Tiro aéreo',
  Shotgun: 'Modo escopeta',
};

export function traduzirEnum(valor: string | null): string | null {
  if (!valor) return null;
  const cru = valor.split('::').pop() ?? valor;
  return TRADUCAO[cru] ?? cru;
}

/**
 * Caminhos da mídia local, gerada por `scripts/baixar-midia.mjs`.
 *
 * A API serve PNG de 2048×1860 para retratos que a tela desenha com 216px, e de
 * 1024×1024 para ícones de 17px: 82 MB no total, contra 2,7 MB redimensionados.
 * Cada função devolve o caminho local; quem usa passa a URL da API como reserva,
 * para um agente lançado depois da última execução do script continuar
 * aparecendo em vez de virar imagem quebrada.
 */
const MIDIA = '/midia';

export function retratoDe(agente: Agente): string {
  return `${MIDIA}/agentes/${agente.uuid}-retrato.webp`;
}

export function iconeDe(agente: Agente): string {
  return `${MIDIA}/agentes/${agente.uuid}-icone.webp`;
}

export function iconeDaFuncao(agente: Agente): string {
  return `${MIDIA}/funcoes/${agente.role.uuid}.webp`;
}

export function iconeDaHabilidade(agente: Agente, habilidade: Habilidade): string {
  return `${MIDIA}/habilidades/${agente.uuid}-${habilidade.slot}.webp`;
}

export function splashDe(mapa: Mapa): string {
  return `${MIDIA}/mapas/${mapa.uuid}.webp`;
}

export function minimapaDe(mapa: Mapa): string {
  return `${MIDIA}/minimapas/${mapa.uuid}.webp`;
}

export function iconeDaArma(arma: Arma): string {
  return `${MIDIA}/armas/${arma.uuid}.webp`;
}

/** A resposta da API sempre embrulha o conteúdo em `data`. */
export interface Resposta<T> {
  status: number;
  data: T;
}

/**
 * Nome curto e legível da categoria da arma.
 *
 * A API devolve o caminho interno do jogo inteiro
 * ("EEquippableCategory::Sidearm"), que não serve para ser exibido.
 */
const NOME_CATEGORIA: Record<string, string> = {
  Melee: 'Corpo a corpo',
  Sidearm: 'Pistolas',
  SMG: 'Submetralhadoras',
  Shotgun: 'Escopetas',
  Rifle: 'Rifles',
  Sniper: 'Snipers',
  Heavy: 'Pesadas',
};

export function categoriaDe(arma: Arma): string {
  const chave = arma.category.split('::').pop() ?? '';
  return NOME_CATEGORIA[chave] ?? chave;
}

/**
 * Gradiente CSS a partir das cores do agente.
 *
 * As cores vêm em hex de 8 dígitos e a última quase sempre termina em `00` —
 * transparente. Usada crua, a metade de baixo do card simplesmente sumiria,
 * então o alfa é descartado e a opacidade fica a cargo do CSS, que é onde dá
 * para controlar.
 */
export function gradienteDe(agente: Agente): string {
  const cores = agente.backgroundGradientColors
    .map((c) => `#${c.slice(0, 6)}`)
    .filter((c) => c.length === 7);

  if (cores.length < 2) return 'linear-gradient(160deg, #2a3140, #0f1923)';
  return `linear-gradient(160deg, ${cores.join(', ')})`;
}
