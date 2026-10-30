import { Injectable, signal, computed } from '@angular/core';

/**
 * Gerencia favoritos do usuário, persistidos em localStorage.
 *
 * Três listas separadas por tipo — agentes, mapas e armas — cada uma guardando
 * apenas o uuid. Sem backend, sem login: funciona no navegador do visitante.
 */
export type TipoFavorito = 'agente' | 'mapa' | 'arma';

const CHAVE = 'valorant-favoritos';

interface FavoritosStore {
  agente: string[];
  mapa: string[];
  arma: string[];
}

function lerDoStorage(): FavoritosStore {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        agente: Array.isArray(parsed.agente) ? parsed.agente : [],
        mapa: Array.isArray(parsed.mapa) ? parsed.mapa : [],
        arma: Array.isArray(parsed.arma) ? parsed.arma : [],
      };
    }
  } catch {
    // localStorage indisponível ou JSON corrompido.
  }
  return { agente: [], mapa: [], arma: [] };
}

function salvarNoStorage(store: FavoritosStore): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(store));
  } catch {
    // Silencia — quota ou modo privado.
  }
}

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly _store = signal<FavoritosStore>(lerDoStorage());

  readonly agentes = computed(() => this._store().agente);
  readonly mapas = computed(() => this._store().mapa);
  readonly armas = computed(() => this._store().arma);

  /** O total de favoritos, para mostrar no header. */
  readonly total = computed(
    () => this._store().agente.length + this._store().mapa.length + this._store().arma.length,
  );

  eFavorito(tipo: TipoFavorito, uuid: string): boolean {
    return this._store()[tipo].includes(uuid);
  }

  alternar(tipo: TipoFavorito, uuid: string): void {
    const atual = this._store();
    const lista = [...atual[tipo]];
    const idx = lista.indexOf(uuid);

    if (idx >= 0) {
      lista.splice(idx, 1);
    } else {
      lista.push(uuid);
    }

    const novo = { ...atual, [tipo]: lista };
    this._store.set(novo);
    salvarNoStorage(novo);
  }
}
