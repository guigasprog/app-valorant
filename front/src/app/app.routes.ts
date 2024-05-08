import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: MainComponent },
  { path: '**', component: NotFoundComponent },
];
