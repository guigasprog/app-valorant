import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Troca para uma URL de reserva quando a imagem local não existe.
 *
 * As imagens são baixadas e redimensionadas por `scripts/baixar-midia.mjs`, mas
 * os DADOS vêm da API ao vivo. Quando a Riot lança um agente, ele aparece na
 * lista no mesmo dia — e não tem cópia local até alguém rodar o script. Sem
 * isto, seria um card com imagem quebrada; com isto, cai na URL da API, que é
 * pesada mas existe.
 *
 * O `tentou` evita laço infinito: se a reserva também falhar, o `error` dispara
 * de novo e trocaríamos pela mesma URL para sempre.
 */
@Directive({
  selector: 'img[reserva]',
  host: { '(error)': 'aoFalhar()' },
})
export class ReservaDirective {
  readonly reserva = input.required<string | null>();

  private readonly img = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private tentou = false;

  aoFalhar(): void {
    if (this.tentou) return;
    this.tentou = true;

    const url = this.reserva();
    if (url) this.img.nativeElement.src = url;
  }
}
