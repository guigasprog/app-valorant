import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacidade',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="envolve texto">
      <h1 class="vazado">Privacidade</h1>

      <section>
        <h2>O que este site guarda</h2>
        <p>
          Só a sua resposta ao aviso de cookies, no
          <code>localStorage</code> do seu navegador. Não há cadastro, não há
          banco de dados e nada do que você faz aqui é enviado para nós.
        </p>
      </section>

      <section>
        <h2>Anúncios</h2>
        <p>
          O site exibe anúncios do Google AdSense para se manter no ar. O Google
          pode usar cookies para medir e personalizar o que aparece. Recusando no
          aviso, os anúncios continuam, mas passam a ser não personalizados.
          Limpando os dados do site, o aviso reaparece na próxima visita.
        </p>
      </section>

      <section>
        <h2>De onde vêm os dados</h2>
        <p>
          Agentes, mapas, armas e skins vêm da
          <a href="https://valorant-api.com" target="_blank" rel="noreferrer">
            valorant-api.com </a
          >, um projeto da comunidade. VALORANT e suas marcas pertencem à Riot
          Games; este é um projeto de fã, sem vínculo com ela.
        </p>
      </section>

      <a routerLink="/" class="voltar canto">Voltar ao início</a>
    </div>
  `,
  styles: `
    .texto {
      padding-block: clamp(2rem, 6vw, 4rem);
      max-width: 44rem;
    }

    h1 {
      font-size: var(--t-titulo);
    }

    section {
      margin-top: 2.25rem;
    }

    h2 {
      font-size: 1rem;
      letter-spacing: 0.1em;
      color: var(--vermelho);
    }

    p {
      margin-top: 0.7rem;
      line-height: 1.75;
      color: rgba(236, 232, 225, 0.75);
    }

    code {
      font-size: 0.9em;
      color: var(--osso);
    }

    p a {
      color: var(--osso);
      border-bottom: 1px solid var(--vermelho);
    }

    .voltar {
      --cor-canto: rgba(0, 0, 0, 0.45);

      display: inline-block;
      margin-top: 2.5rem;
      padding: 0.7rem 1.6rem;
      background: var(--vermelho);
      color: var(--noite);
      font-weight: 700;
      font-size: 0.8rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `,
})
export class PrivacidadePage {}
