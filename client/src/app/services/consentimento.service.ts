import { Injectable, signal } from '@angular/core';

export type Escolha = 'aceito' | 'recusado' | null;

const CHAVE = 'app-valorant:consentimento';

/**
 * Consentimento de cookies de anúncio.
 *
 * Note o que ele NÃO faz: não segura o script do AdSense. O rastreador do
 * AdSense não clica em "Aceitar" — com o script atrás do consentimento, ele
 * nunca encontra o código e a verificação do site falha. O script carrega
 * sempre, no index.html, e o que a escolha decide é personalização: sem aceite,
 * um trecho inline pede anúncios não personalizados antes de o script subir.
 */
@Injectable({ providedIn: 'root' })
export class ConsentimentoService {
  readonly escolha = signal<Escolha>(this.ler());

  private ler(): Escolha {
    try {
      const v = localStorage.getItem(CHAVE);
      return v === 'aceito' || v === 'recusado' ? v : null;
    } catch {
      // Armazenamento bloqueado: a escolha vale para esta sessão.
      return null;
    }
  }

  decidir(valor: Exclude<Escolha, null>): void {
    try {
      localStorage.setItem(CHAVE, valor);
    } catch {
      // Idem: seguimos com a escolha em memória.
    }
    this.escolha.set(valor);
  }
}
