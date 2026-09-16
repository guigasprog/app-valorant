import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // `withComponentInputBinding` faz o parâmetro da rota chegar como input do
    // componente: a página do agente recebe o uuid direto, sem injetar
    // ActivatedRoute e sem assinar um observable só para ler um pedaço da URL.
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
  ],
};
