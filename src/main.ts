/* import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { LoginComponent } from './app/pages/login/login.component'; // Chemin vers votre composant


// Définissez vos routes ici
const routes: Routes = [
  { path: 'login', loadComponent: () => import('./app/pages/login/login.component').then(m => m.LoginComponent) },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()) 
  ]
}).catch(err => console.error(err));
 */