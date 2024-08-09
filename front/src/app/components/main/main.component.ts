import { Component, OnInit } from '@angular/core';
import { AsideComponent } from './components/aside/aside.component';
import { CarroselComponent } from './components/carrosel/carrosel.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [AsideComponent, CarroselComponent],
  template: ` <app-aside></app-aside> `,
  styles: `

  `,
})
export class MainComponent implements OnInit {
  ngOnInit(): void {}
}
