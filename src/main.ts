import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// Importation des composants
import { LoginComponent } from './app/pages/login/login.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { AppComponent } from './app/app.component';

const routes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // 'full' est correct ici
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/login' },  // Gestion des routes non définies
];

// Bootstrap avec AppComponent et les routes
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Utilisation de provideRouter pour les routes
    importProvidersFrom(HttpClientModule),  // Ajout de HttpClientModule
  ],
}).catch((err) => console.error(err));
