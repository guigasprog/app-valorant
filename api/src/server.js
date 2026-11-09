import express from 'express';
import { valorant, IDIOMAS, ErroUpstream, estadoDoCache, limparCache } from './valorant.js';
import {
  agenteResumo,
  agenteDetalhe,
  funcoesDe,
  modoDoMapa,
  mapaResumo,
  mapaDetalhe,
  armaResumo,
  armaDetalhe,
  chaveCategoria,
  ordenarArmas,
  CAMPOS_ORDENACAO,
  estatisticas,
  normaliza,
} from './tratamento.js';

const PORTA = Number(process.env.PORT ?? 3000);
const IDIOMA_PADRAO = process.env.IDIOMA_PADRAO ?? 'pt-BR';
const TOKEN_ADMIN = process.env.TOKEN_ADMIN ?? '';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.set('json spaces', process.env.NODE_ENV === 'production' ? 0 : 2);

// API pública e só de leitura: liberar CORS para qualquer origem não expõe
// nada, e deixa outros projetos da turma consumirem direto do navegador.
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

/** `?idioma=en-US`; qualquer coisa fora da lista da valorant-api cai no padrão. */
const idiomaDe = (req) => (IDIOMAS.has(req.query.idioma) ? req.query.idioma : IDIOMA_PADRAO);

/** Dados de jogo mudam por patch: o navegador e o proxy podem guardar por 10 min. */
const cacheavel = (res) => res.set('Cache-Control', 'public, max-age=600');

/** Express 5 já repassa erro de handler async; isto só deixa as rotas mais curtas. */
const rota = (fn) => async (req, res) => {
  cacheavel(res);
  res.json(await fn(req, res));
};

const naoEncontrado = (o) => Object.assign(new Error(`${o} não encontrado`), { status: 404 });

const r = express.Router();

r.get('/', (req, res) => {
  res.json({
    nome: 'API Valorant',
    fonte: 'https://valorant-api.com',
    parametrosComuns: { idioma: `um de ${[...IDIOMAS].join(', ')} (padrão ${IDIOMA_PADRAO})` },
    rotas: {
      'GET /api/saude': 'status da API e do cache',
      'GET /api/agentes?funcao=&busca=': 'agentes jogáveis, resumidos',
      'GET /api/agentes/:uuid': 'agente com habilidades na ordem do jogo (C, Q, E, X)',
      'GET /api/funcoes': 'funções com seus agentes',
      'GET /api/mapas?modo=padrao|duelo': 'só os mapas jogáveis',
      'GET /api/mapas/:uuid': 'mapa com callouts posicionados e agrupados',
      [`GET /api/armas?categoria=&busca=&ordenar=${CAMPOS_ORDENACAO.join('|')}`]: 'armas sem as skins (leve)',
      'GET /api/armas/:uuid': 'arma com faixas de dano, acertos para abater e skins',
      'GET /api/estatisticas': 'números agregados de agentes, mapas e armas',
      'GET /api/valorant/{agents|maps|weapons|contenttiers}?language=': 'repasse cru com cache (usado pelo front)',
    },
  });
});

r.get('/saude', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ status: 'ok', noArDesde: new Date(Date.now() - process.uptime() * 1000).toISOString(), cache: estadoDoCache() });
});

// ── Agentes ──
r.get(
  '/agentes',
  rota(async (req) => {
    let lista = await valorant.agentes(idiomaDe(req));
    if (req.query.funcao) {
      const f = normaliza(req.query.funcao);
      lista = lista.filter((a) => a.role && (normaliza(a.role.displayName) === f || a.role.uuid === f));
    }
    if (req.query.busca) {
      const b = normaliza(req.query.busca);
      lista = lista.filter((a) => normaliza(a.displayName).includes(b));
    }
    return lista.map(agenteResumo).sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  }),
);

r.get(
  '/agentes/:uuid',
  rota(async (req) => {
    const a = (await valorant.agentes(idiomaDe(req))).find((x) => x.uuid === req.params.uuid);
    if (!a) throw naoEncontrado('Agente');
    return agenteDetalhe(a);
  }),
);

r.get('/funcoes', rota(async (req) => funcoesDe(await valorant.agentes(idiomaDe(req)))));

// ── Mapas ──
r.get(
  '/mapas',
  rota(async (req) => {
    let lista = (await valorant.mapas(idiomaDe(req))).filter((m) => modoDoMapa(m));
    if (req.query.modo) lista = lista.filter((m) => modoDoMapa(m) === req.query.modo);
    return lista.map(mapaResumo).sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR'));
  }),
);

r.get(
  '/mapas/:uuid',
  rota(async (req) => {
    const m = (await valorant.mapas(idiomaDe(req))).find((x) => x.uuid === req.params.uuid && modoDoMapa(x));
    if (!m) throw naoEncontrado('Mapa');
    return mapaDetalhe(m);
  }),
);

// ── Armas ──
r.get(
  '/armas',
  rota(async (req) => {
    let lista = await valorant.armas(idiomaDe(req));
    if (req.query.categoria) {
      const c = normaliza(req.query.categoria);
      lista = lista.filter((a) => normaliza(chaveCategoria(a)) === c);
    }
    if (req.query.busca) {
      const b = normaliza(req.query.busca);
      lista = lista.filter((a) => normaliza(a.displayName).includes(b));
    }
    return ordenarArmas(lista.map(armaResumo), req.query.ordenar);
  }),
);

r.get(
  '/armas/:uuid',
  rota(async (req) => {
    const idioma = idiomaDe(req);
    const [armas, tiers] = await Promise.all([valorant.armas(idioma), valorant.tiers(idioma)]);
    const a = armas.find((x) => x.uuid === req.params.uuid);
    if (!a) throw naoEncontrado('Arma');
    return armaDetalhe(a, new Map(tiers.map((t) => [t.uuid, t])));
  }),
);

// ── Agregados ──
r.get(
  '/estatisticas',
  rota(async (req) => {
    const idioma = idiomaDe(req);
    const [agentes, mapas, armas] = await Promise.all([
      valorant.agentes(idioma),
      valorant.mapas(idioma),
      valorant.armas(idioma),
    ]);
    return estatisticas({ agentes, mapas, armas });
  }),
);

// ── Repasse para o front ──
// O front continua lendo o formato cru da valorant-api ({ status, data }) —
// as páginas dependem de skins, chromas e multiplicadores do minimapa —, mas
// agora passando por aqui: com cache, e sem o navegador do usuário falar com
// um serviço de terceiros. Só os quatro recursos que o app usa.
const REPASSE = {
  agents: valorant.agentes,
  maps: valorant.mapas,
  weapons: valorant.armas,
  contenttiers: valorant.tiers,
};

r.get('/valorant/:recurso', async (req, res) => {
  const buscar = REPASSE[req.params.recurso];
  if (!buscar) throw naoEncontrado('Recurso');
  const idioma = IDIOMAS.has(req.query.language) ? req.query.language : IDIOMA_PADRAO;
  cacheavel(res);
  res.json({ status: 200, data: await buscar(idioma) });
});

// Limpa o cache depois de um patch, sem precisar reiniciar o container.
// Só existe se TOKEN_ADMIN estiver definido.
r.post('/cache/limpar', (req, res) => {
  if (!TOKEN_ADMIN || req.get('Authorization') !== `Bearer ${TOKEN_ADMIN}`) return res.sendStatus(404);
  limparCache();
  res.json({ limpo: true });
});

app.use('/api', r);

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada', dica: 'GET /api lista as rotas' }));

// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
  const status = erro.status ?? 500;
  if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, erro);
  res.set('Cache-Control', 'no-store');
  res.status(status).json({
    erro: erro instanceof ErroUpstream || status < 500 ? erro.message : 'Erro interno',
  });
});

const servidor = app.listen(PORTA, () => console.log(`API Valorant ouvindo na porta ${PORTA}`));

// `docker stop` manda SIGTERM: fecha as conexões abertas antes de sair, em vez
// de esperar os 10 s e levar SIGKILL.
for (const sinal of ['SIGTERM', 'SIGINT']) {
  process.on(sinal, () => servidor.close(() => process.exit(0)));
}
