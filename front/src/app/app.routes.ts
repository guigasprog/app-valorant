import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ButtonComponent } from './components/childs-component/childs-component.component';

export const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'components', component: ButtonComponent },
  { path: '**', component: NotFoundComponent },
];
