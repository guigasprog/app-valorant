import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Agent, Agents } from '../../../../domain/agent/agent.model';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [NgStyle],
  template: `
    <div class="card card-aside" style="background-color: green;">
      <div class="content"></div>
    </div>
  `,
  styles: `

  `,
})
export class AsideComponent {}
