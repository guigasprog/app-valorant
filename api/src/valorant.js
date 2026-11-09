/**
 * Cliente da valorant-api.com com cache em memória.
 *
 * Os dados do jogo mudam a cada patch (semanas), não a cada requisição. Sem
 * cache, cada visita à API viraria uma ida à valorant-api — inclusive os
 * 3,44 MB do endpoint de armas. Com ele, a primeira chamada paga a viagem e as
 * seguintes saem da memória.
 *
 * Três cuidados:
 *  1. Pedidos simultâneos para a mesma URL compartilham a mesma promessa, em vez
 *     de dispararem N downloads iguais quando o cache está frio.
 *  2. Se a valorant-api cair depois que algo já foi baixado, servimos a cópia
 *     vencida em vez de devolver erro: dado de ontem é melhor que tela vazia.
 *  3. Timeout explícito: sem ele, uma API externa travada segura a conexão do
 *     nosso usuário indefinidamente.
 */

const BASE = process.env.VALORANT_API_BASE ?? 'https://valorant-api.com/v1';
const TTL_MS = Number(process.env.CACHE_TTL_MINUTOS ?? 360) * 60_000;
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS ?? 15_000);

export const IDIOMAS = new Set([
  'ar-AE', 'de-DE', 'en-US', 'es-ES', 'es-MX', 'fr-FR', 'id-ID', 'it-IT', 'ja-JP',
  'ko-KR', 'pl-PL', 'pt-BR', 'ru-RU', 'th-TH', 'tr-TR', 'vi-VN', 'zh-CN', 'zh-TW',
]);

/** @type {Map<string, { dados?: unknown, expira: number, promessa?: Promise<unknown> }>} */
const cache = new Map();

export class ErroUpstream extends Error {
  constructor(mensagem, status = 502) {
    super(mensagem);
    this.status = status;
  }
}

async function baixar(url) {
  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (e) {
    throw new ErroUpstream(`valorant-api indisponível: ${e.message}`);
  }
  if (!res.ok) throw new ErroUpstream(`valorant-api respondeu ${res.status} em ${url}`);
  const corpo = await res.json();
  return corpo.data;
}

async function buscar(caminho) {
  const url = `${BASE}${caminho}`;
  const agora = Date.now();
  const entrada = cache.get(url);

  if (entrada?.dados !== undefined && entrada.expira > agora) return entrada.dados;
  if (entrada?.promessa) return entrada.promessa;

  const promessa = baixar(url)
    .then((dados) => {
      cache.set(url, { dados, expira: Date.now() + TTL_MS });
      return dados;
    })
    .catch((erro) => {
      if (entrada?.dados !== undefined) {
        console.warn(`[cache] servindo cópia vencida de ${url}: ${erro.message}`);
        cache.set(url, { dados: entrada.dados, expira: Date.now() + 60_000 });
        return entrada.dados;
      }
      cache.delete(url);
      throw erro;
    });

  cache.set(url, { ...entrada, expira: entrada?.expira ?? 0, promessa });
  return promessa;
}

export const valorant = {
  agentes: (idioma) => buscar(`/agents?isPlayableCharacter=true&language=${idioma}`),
  mapas: (idioma) => buscar(`/maps?language=${idioma}`),
  armas: (idioma) => buscar(`/weapons?language=${idioma}`),
  tiers: (idioma) => buscar(`/contenttiers?language=${idioma}`),
};

export function estadoDoCache() {
  const agora = Date.now();
  return [...cache.entries()].map(([url, e]) => ({
    url: url.replace(BASE, ''),
    valido: e.dados !== undefined && e.expira > agora,
    expiraEm: e.expira ? new Date(e.expira).toISOString() : null,
  }));
}

export function limparCache() {
  cache.clear();
}
