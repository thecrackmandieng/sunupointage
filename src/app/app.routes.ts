import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { PointagesComponent } from './pointages/pointages.component'; // Assurez-vous du bon chemin


export const routes: Routes = [
  { path: '', component: LoginComponent }, // Route par défaut
  { path: 'pointages', component: PointagesComponent }, // Route pour afficher la liste des pointages

];
