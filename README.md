# app-valorant

Catálogo dos agentes, mapas e armas de VALORANT em português, montado sobre a
[valorant-api.com](https://valorant-api.com) — a mesma fonte que o jogo usa.

Angular 19 no front e uma API própria em Node (`api/`) no meio do caminho: o
navegador só fala com `/api`, e é a API que fala com a valorant-api, com cache.

```bash
# terminal 1 — API
cd api && npm install && npm run dev     # http://localhost:3000/api

# terminal 2 — front (o proxy.conf.json repassa /api para a porta 3000)
cd client && npm install && npm start    # http://localhost:4200
```

## Como está organizado

```
client/src/app/
  models/valorant.ts      o recorte da API que o app usa, e as regras de leitura dela
  services/dados.service  a única fonte de dados: signals, uma chamada, três listas
  component/header        o menu
  page/                   inicio · agentes · mapas · armas (carregadas sob demanda)
```

## Decisões que não são óbvias

**Uma chamada só, com `forkJoin`.** Antes eram duas chamadas independentes e a
tela destravava quando a *primeira* terminasse. Se os mapas chegassem antes dos
agentes, a página de agentes renderizava com a lista vazia — sem erro nenhum na
tela. Ou vem tudo, ou é erro.

**Não há pré-carregamento de imagem.** A versão anterior baixava os retratos dos
29 agentes e os splashes de todos os mapas antes de mostrar qualquer coisa —
perto de cem imagens de alta resolução segurando a splash. Agora a splash espera
só o JSON e cada imagem chega na sua vez, com `loading="lazy"`.

**Os dados não passam pelo `localStorage`.** Passavam: o componente raiz gravava
e cada página lia de lá. Era isso que criava a corrida acima. Signals resolvem
sem tocar no disco.

**O filtro de mapas não usa `coordinates`.** Parece o campo óbvio e é armadilha.
O endpoint devolve 26 entradas e só 18 são lugares onde se joga; `coordinates`
deixa passar o campo de tiro — que vem **duplicado**, "The Range" duas vezes — e
barra os cinco mapas de Duelo por Equipes, que são jogáveis. O que separa de
verdade é `tacticalDescription` (só existe em partida padrão) e o prefixo `HURM`
no `assetPath` (os de Duelo). Ver `modoDoMapa`.

**Cada card de agente usa a cor do próprio agente.** A API já entregava
`backgroundGradientColors` e ninguém estava usando. O alfa da última parada
costuma vir `00`, o que apagaria metade do card — por isso `gradienteDe`
descarta o alfa e deixa a opacidade para o CSS.

**As imagens são servidas daqui, não da API.** A valorant-api entrega PNG de
2048×1860 para retratos que a tela desenha com 216px, e de 1024×1024 para
ícones de 17px: a grade de agentes sozinha baixava **19 MB**. `npm run midia`
baixa tudo uma vez, redimensiona e grava em `public/midia` — 82,5 MB viram
2,7 MB, um corte de 97%.

As imagens ficam versionadas, e não geradas no build, porque um build que
depende de um serviço de terceiros estar de pé é um build que quebra sozinho
num domingo. O preço é rodar `npm run midia` quando a Riot lançar agente novo;
até lá, a diretiva `reserva` faz o `<img>` cair na URL da API para o que não
tiver cópia local — o agente aparece pesado, mas aparece.

## Publicação

Vercel, ligada a este repositório: cada push na `main` publica.

O `vercel.json` fica na **raiz**, e não em `client/`, de propósito. Ele podia
morar lá dentro, com o _Root Directory_ do projeto apontando para `client` — mas
aí metade da configuração ficaria num painel que não está versionado, e clonar o
repositório não bastaria para publicá-lo. Com tudo na raiz, o repositório
descreve o próprio deploy: instala e constrói dentro de `client`, serve
`client/dist/client/browser`, e — o que mais importa — reescreve todas as rotas
para `index.html`.

Isso é o que conserta o defeito antigo: no GitHub Pages, abrir
`/agents` direto ou dar F5 na rota devolvia **404**, porque Pages não faz
fallback de SPA. O site só funcionava se você entrasse pela raiz e clicasse.

O repositório `valorant-review`, que guardava o build compilado para o GitHub
Pages, fica obsoleto quando este for ao ar na Vercel.

## API (`api/`)

Uma API leve em Node 22 + Express que fica entre o app e a valorant-api: guarda
as respostas em memória (6 h por padrão). O front consome
`/api/valorant/{agents,maps,weapons,contenttiers}`, que repassa o formato cru
(as páginas dependem dele); as demais rotas devolvem os dados já tratados, com
as mesmas regras de `models/valorant.ts`.

| Rota | O que devolve |
| --- | --- |
| `GET /api` | a lista de rotas |
| `GET /api/saude` | status e estado do cache |
| `GET /api/agentes?funcao=&busca=` | agentes jogáveis, resumidos, com as cores do card |
| `GET /api/agentes/:uuid` | habilidades na ordem do jogo, com a tecla (C, Q, E, X) |
| `GET /api/funcoes` | funções e seus agentes |
| `GET /api/mapas?modo=padrao\|duelo` | só os 18 jogáveis, com os sítios (A/B/C) |
| `GET /api/mapas/:uuid` | callouts posicionados no minimapa e agrupados por região |
| `GET /api/armas?categoria=&busca=&ordenar=` | as armas **sem** as 1405 skins: de 3,44 MB para alguns KB |
| `GET /api/armas/:uuid` | faixas de dano, acertos para abater e skins com a edição |
| `GET /api/estatisticas` | agregados: agentes por função, preço médio por categoria, top 5 |
| `GET /api/valorant/:recurso?language=` | repasse cru com cache — é o que o front usa |

Todas aceitam `?idioma=en-US` (ou outro da valorant-api); o padrão é `pt-BR`.

## Docker

`docker-compose.yml` sobe dois containers: `web` (build do Angular servido
pelo nginx, com fallback de SPA) e `api`. O nginx repassa `/api/` para a API,
então para o navegador é tudo a mesma origem. Só o `web` fica exposto.

```bash
# local ou num servidor sem Coolify — publica na porta 8080
docker compose -f docker-compose.yml -f docker-compose.porta.yml up -d --build
```

No **Coolify** da FEMA (`https://computacao.fema.edu.br`, o mesmo do
`.github/workflows/deploy.yml`): o recurso usa o build pack *Docker Compose*, e
o domínio do app (um subdomínio, como `https://valorant.computacao.fema.edu.br`)
vai no serviço `web`. O push na `main` continua disparando o deploy — se o
recurso for recriado, atualize o `uuid` no workflow.
