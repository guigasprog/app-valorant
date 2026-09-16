import { Routes } from '@angular/router';

/**
 * Antes existia uma rota só, `agents`, e nenhuma para a raiz: abrir o site
 * mostrava o cabeçalho e uma área vazia, e o logo da Riot no cabeçalho
 * navegava para `''` — que não levava a lugar nenhum.
 *
 * As páginas são carregadas sob demanda porque só a inicial é certeza: quem
 * entra e sai sem tocar no menu não deveria baixar as outras três.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'VALORANT',
    loadComponent: () => import('./page/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'agentes',
    title: 'Agentes — VALORANT',
    loadComponent: () => import('./page/agentes.page').then((m) => m.AgentesPage),
  },
  {
    path: 'mapas',
    title: 'Mapas — VALORANT',
    loadComponent: () => import('./page/mapas.page').then((m) => m.MapasPage),
  },
  {
    path: 'armas',
    title: 'Armas — VALORANT',
    loadComponent: () => import('./page/armas.page').then((m) => m.ArmasPage),
  },
  // A rota antiga, em inglês, continua respondendo: era o único link que
  // existia no ar, e quebrá-lo não traria nada.
  { path: 'agents', redirectTo: 'agentes' },
  { path: '**', redirectTo: '' },
];
