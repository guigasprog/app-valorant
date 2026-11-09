/**
 * Transformações sobre o retorno cru da valorant-api.
 *
 * As regras são as mesmas que o front já aplica em `models/valorant.ts` — aqui
 * elas rodam uma vez no servidor, e quem consome recebe o dado pronto.
 */

// ── Agentes ──────────────────────────────────────────────────────────────────

/** Slot interno da API → tecla que o jogador aperta. Passiva não tem tecla. */
const TECLA = { Grenade: 'C', Ability1: 'Q', Ability2: 'E', Ultimate: 'X' };
const ORDEM_SLOT = ['Grenade', 'Ability1', 'Ability2', 'Ultimate', 'Passive'];

const posicaoDoSlot = (slot) => {
  const i = ORDEM_SLOT.indexOf(slot);
  return i === -1 ? ORDEM_SLOT.length : i;
};

/**
 * As cores vêm como hex de 8 dígitos e o alfa da última parada costuma ser
 * `00`; usado cru, apaga metade do gradiente. O alfa sai e fica só o RGB.
 */
const coresDe = (agente) =>
  (agente.backgroundGradientColors ?? [])
    .map((c) => `#${c.slice(0, 6)}`)
    .filter((c) => c.length === 7);

const resumoFuncao = (role) =>
  role ? { uuid: role.uuid, nome: role.displayName, icone: role.displayIcon } : null;

export function agenteResumo(a) {
  return {
    uuid: a.uuid,
    nome: a.displayName,
    funcao: resumoFuncao(a.role),
    icone: a.displayIcon,
    retrato: a.fullPortrait,
    cores: coresDe(a),
  };
}

export function agenteDetalhe(a) {
  return {
    ...agenteResumo(a),
    descricao: a.description,
    fundo: a.background,
    habilidades: [...(a.abilities ?? [])]
      .sort((x, y) => posicaoDoSlot(x.slot) - posicaoDoSlot(y.slot))
      .map((h) => ({
        slot: h.slot,
        tecla: TECLA[h.slot] ?? null,
        passiva: h.slot === 'Passive',
        nome: h.displayName,
        descricao: h.description,
        icone: h.displayIcon,
      })),
  };
}

export function funcoesDe(agentes) {
  const grupos = new Map();
  for (const a of agentes) {
    if (!a.role) continue;
    const g = grupos.get(a.role.uuid) ?? {
      uuid: a.role.uuid,
      nome: a.role.displayName,
      descricao: a.role.description,
      icone: a.role.displayIcon,
      agentes: [],
    };
    g.agentes.push(a.displayName);
    grupos.set(a.role.uuid, g);
  }
  return [...grupos.values()]
    .map((g) => ({ ...g, total: g.agentes.length, agentes: g.agentes.sort(comparar) }))
    .sort((x, y) => comparar(x.nome, y.nome));
}

// ── Mapas ────────────────────────────────────────────────────────────────────

/**
 * O endpoint devolve 26 entradas e só 18 são jogáveis. `coordinates` parece o
 * filtro óbvio e não é: deixa passar o campo de tiro (duplicado) e barra os
 * mapas de Duelo por Equipes. O que separa é `tacticalDescription` (só partida
 * padrão) e o prefixo HURM no assetPath (Duelo). Mesma regra do front.
 */
export function modoDoMapa(m) {
  if (m.tacticalDescription) return 'padrao';
  if (m.assetPath?.includes('/HURM_')) return 'duelo';
  return null;
}

const NOME_MODO = { padrao: 'Partida padrão', duelo: 'Duelo por Equipes' };

/** "A/B/C Sites" ou "Locais A/B" → ["A", "B", "C"]. */
const sitiosDe = (m) => m.tacticalDescription?.match(/\b[A-C]\b/g) ?? [];

const tiraPreposicao = (s) => s.replace(/^(no|na|em)\s+/i, '');

export function mapaResumo(m) {
  const modo = modoDoMapa(m);
  return {
    uuid: m.uuid,
    nome: m.displayName,
    modo,
    modoNome: NOME_MODO[modo] ?? null,
    sitios: sitiosDe(m),
    coordenadas: m.coordinates,
    splash: m.splash,
    minimapa: m.displayIcon,
    totalCallouts: m.callouts?.length ?? 0,
  };
}

export function mapaDetalhe(m) {
  const { xMultiplier: xm, yMultiplier: ym, xScalarToAdd: xs, yScalarToAdd: ys } = m;
  const temEscala = [xm, ym, xs, ys].every((v) => v != null);

  const grupos = new Map();
  for (const c of m.callouts ?? []) {
    const regiao = tiraPreposicao(c.superRegionName);
    grupos.set(regiao, [...(grupos.get(regiao) ?? []), c.regionName]);
  }

  return {
    ...mapaResumo(m),
    // Os eixos trocam de propósito: o minimapa é desenhado girado em relação
    // ao mundo do jogo. x e y saem como fração 0–1 da imagem do minimapa.
    calloutsPosicionados: temEscala
      ? (m.callouts ?? []).map((c) => ({
          nome: c.regionName,
          regiao: tiraPreposicao(c.superRegionName),
          x: arredonda(c.location.y * xm + xs, 4),
          y: arredonda(c.location.x * ym + ys, 4),
        }))
      : [],
    calloutsPorRegiao: [...grupos.entries()]
      .map(([regiao, nomes]) => ({ regiao, nomes: nomes.sort(comparar) }))
      .sort((x, y) => comparar(x.regiao, y.regiao)),
  };
}

// ── Armas ────────────────────────────────────────────────────────────────────

const NOME_CATEGORIA = {
  Melee: 'Corpo a corpo',
  Sidearm: 'Pistolas',
  SMG: 'Submetralhadoras',
  Shotgun: 'Escopetas',
  Rifle: 'Rifles',
  Sniper: 'Snipers',
  Heavy: 'Pesadas',
};

const TRADUCAO = {
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

/** "EWallPenetrationDisplayType::High" → "Alta". Valor novo aparece cru, de propósito. */
const traduz = (valor) => {
  if (!valor) return null;
  const cru = valor.split('::').pop();
  return TRADUCAO[cru] ?? cru;
};

export const chaveCategoria = (arma) => arma.category.split('::').pop();

/** Vida máxima de um jogador: 100 de vida + 50 de escudo pesado. */
const VIDA_COM_ESCUDO = 150;
const VIDA_SEM_ESCUDO = 100;

/**
 * Quantos acertos para derrubar, por parte do corpo, numa faixa de distância.
 * Conta simplificada (dano total ÷ vida), sem as regras finas de absorção do
 * escudo — serve para comparar armas entre si, não para cravar o TTK do jogo.
 * Nas escopetas o dano é por chumbo, então o número é de chumbos, não de tiros.
 */
const acertos = (vida, dano) => (dano > 0 ? Math.ceil(vida / dano) : null);

function faixa(f) {
  return {
    deMetros: f.rangeStartMeters,
    ateMetros: f.rangeEndMeters,
    dano: { cabeca: arredonda(f.headDamage), corpo: arredonda(f.bodyDamage), perna: arredonda(f.legDamage) },
    acertosParaAbater: {
      semEscudo: {
        cabeca: acertos(VIDA_SEM_ESCUDO, f.headDamage),
        corpo: acertos(VIDA_SEM_ESCUDO, f.bodyDamage),
        perna: acertos(VIDA_SEM_ESCUDO, f.legDamage),
      },
      comEscudoPesado: {
        cabeca: acertos(VIDA_COM_ESCUDO, f.headDamage),
        corpo: acertos(VIDA_COM_ESCUDO, f.bodyDamage),
        perna: acertos(VIDA_COM_ESCUDO, f.legDamage),
      },
    },
  };
}

/** Skins sem a padrão (que é a própria arma) e sem as que não têm imagem. */
const skinsVisiveis = (arma) =>
  (arma.skins ?? []).filter(
    (s) => s.uuid !== arma.defaultSkinUuid && (s.displayIcon || s.levels?.[0]?.displayIcon),
  );

export function armaResumo(a) {
  const s = a.weaponStats;
  const primeira = s?.damageRanges?.[0];
  return {
    uuid: a.uuid,
    nome: a.displayName,
    categoria: chaveCategoria(a),
    categoriaNome: NOME_CATEGORIA[chaveCategoria(a)] ?? chaveCategoria(a),
    preco: a.shopData?.cost ?? 0,
    icone: a.displayIcon,
    cadencia: s ? arredonda(s.fireRate, 2) : null,
    pente: s?.magazineSize ?? null,
    penetracao: traduz(s?.wallPenetration),
    modoDeTiro: traduz(s?.fireMode) ?? (s ? 'Automática' : null),
    danoCabecaPerto: primeira ? arredonda(primeira.headDamage) : null,
    danoCorpoPerto: primeira ? arredonda(primeira.bodyDamage) : null,
    totalSkins: skinsVisiveis(a).length,
  };
}

export function armaDetalhe(a, tiersPorUuid) {
  const s = a.weaponStats;
  return {
    ...armaResumo(a),
    estatisticas: s
      ? {
          cadencia: arredonda(s.fireRate, 2),
          pente: s.magazineSize,
          tempoDeRecarga: arredonda(s.reloadTimeSeconds, 2),
          tempoParaSacar: arredonda(s.equipTimeSeconds, 2),
          velocidadeCorrendo: arredonda(s.runSpeedMultiplier, 2),
          precisaoPrimeiroTiro: arredonda(s.firstBulletAccuracy, 2),
          chumbosPorTiro: s.shotgunPelletCount,
          penetracao: traduz(s.wallPenetration),
          recurso: traduz(s.feature),
          tiroAlternativo: traduz(s.altFireType),
          faixasDeDano: (s.damageRanges ?? []).map(faixa),
        }
      : null,
    skins: skinsVisiveis(a)
      .map((sk) => {
        const tier = tiersPorUuid.get(sk.contentTierUuid);
        return {
          uuid: sk.uuid,
          nome: sk.displayName,
          edicao: tier ? { nome: tier.displayName, cor: `#${tier.highlightColor.slice(0, 6)}` } : null,
          arte: sk.chromas?.[0]?.fullRender ?? sk.displayIcon ?? sk.levels?.[0]?.displayIcon ?? null,
          video:
            [...(sk.levels ?? [])].reverse().find((l) => l.streamedVideo)?.streamedVideo ??
            sk.chromas?.find((c) => c.streamedVideo)?.streamedVideo ??
            null,
          variacoes: sk.chromas?.length ?? 0,
          niveis: sk.levels?.length ?? 0,
        };
      })
      .sort((x, y) => comparar(x.nome, y.nome)),
  };
}

const ORDENACOES = {
  nome: (x, y) => comparar(x.nome, y.nome),
  preco: (x, y) => y.preco - x.preco,
  cadencia: (x, y) => (y.cadencia ?? 0) - (x.cadencia ?? 0),
  dano: (x, y) => (y.danoCabecaPerto ?? 0) - (x.danoCabecaPerto ?? 0),
  skins: (x, y) => y.totalSkins - x.totalSkins,
};
export const CAMPOS_ORDENACAO = Object.keys(ORDENACOES);
export const ordenarArmas = (lista, campo) => [...lista].sort(ORDENACOES[campo] ?? ORDENACOES.nome);

// ── Estatísticas gerais ──────────────────────────────────────────────────────

export function estatisticas({ agentes, mapas, armas }) {
  const resumoArmas = armas.map(armaResumo);
  const porCategoria = new Map();
  for (const a of resumoArmas) {
    const g = porCategoria.get(a.categoria) ?? { categoria: a.categoria, nome: a.categoriaNome, armas: [] };
    g.armas.push(a);
    porCategoria.set(a.categoria, g);
  }

  const jogaveis = mapas.filter((m) => modoDoMapa(m));

  return {
    agentes: {
      total: agentes.length,
      porFuncao: funcoesDe(agentes).map(({ nome, total }) => ({ funcao: nome, total })),
    },
    mapas: {
      total: jogaveis.length,
      padrao: jogaveis.filter((m) => modoDoMapa(m) === 'padrao').length,
      duelo: jogaveis.filter((m) => modoDoMapa(m) === 'duelo').length,
      comTresSitios: jogaveis.filter((m) => sitiosDe(m).length === 3).map((m) => m.displayName),
    },
    armas: {
      total: resumoArmas.length,
      totalSkins: resumoArmas.reduce((s, a) => s + a.totalSkins, 0),
      porCategoria: [...porCategoria.values()].map(({ categoria, nome, armas }) => {
        const precos = armas.map((a) => a.preco).filter((p) => p > 0);
        return {
          categoria,
          nome,
          total: armas.length,
          precoMinimo: precos.length ? Math.min(...precos) : 0,
          precoMaximo: precos.length ? Math.max(...precos) : 0,
          precoMedio: precos.length ? Math.round(precos.reduce((s, p) => s + p, 0) / precos.length) : 0,
        };
      }),
      maisCaras: ordenarArmas(resumoArmas, 'preco')
        .slice(0, 5)
        .map(({ nome, preco }) => ({ nome, preco })),
      maisSkins: ordenarArmas(resumoArmas, 'skins')
        .slice(0, 5)
        .map(({ nome, totalSkins }) => ({ nome, totalSkins })),
    },
  };
}

// ── Utilitários ──────────────────────────────────────────────────────────────

export const normaliza = (s) =>
  (s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function comparar(a, b) {
  return a.localeCompare(b, 'pt-BR');
}

function arredonda(n, casas = 1) {
  if (n == null) return null;
  const f = 10 ** casas;
  return Math.round(n * f) / f;
}
