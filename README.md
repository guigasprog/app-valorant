# app-valorant

Catálogo dos agentes, mapas e armas de VALORANT em português, montado sobre a
[valorant-api.com](https://valorant-api.com) — a mesma fonte que o jogo usa.

Angular 19, sem back-end: o app fala direto com a API pública.

```bash
cd client
npm install
npm start          # http://localhost:4200
npm run build      # dist/client/browser
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

## Publicação

Vercel, com _Root Directory_ `client`. O `vercel.json` já traz o build, a pasta
de saída e — o que importa — o rewrite de todas as rotas para `index.html`.

Isso é o que conserta o defeito antigo: no GitHub Pages, abrir
`/agents` direto ou dar F5 na rota devolvia **404**, porque Pages não faz
fallback de SPA. O site só funcionava se você entrasse pela raiz e clicasse.

O repositório `valorant-review`, que guardava o build compilado para o GitHub
Pages, fica obsoleto quando este for ao ar na Vercel.
