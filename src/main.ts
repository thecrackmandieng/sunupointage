import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// Importation des composants standalone
import { LoginComponent } from './app/pages/login/login.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { AdminDashboardComponent } from './app/pages/admin-dashboard/admin-dashboard.component';
import { PointagesComponent } from './app/pointages/pointages.component';
import { AppComponent } from './app/app.component';
import { StructuresComponent } from './app/structures/structures.component';
import { ApprenantsComponent } from './app/apprenants/apprenants.component';
import { EmployesComponent } from './app/employes/employes.component';
import { CardManagementComponent } from './app/card-management/card-management.component';
import { AssignCardComponent } from './app/assign-card/assign-card.component';

// Définition des routes de l'application
const routes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Route par défaut
  { path: 'login', component: LoginComponent },          // Route pour la page de connexion
  { path: 'dashboard', component: DashboardComponent },  // Dashboard utilisateur
  { path: 'admin-dashboard', component: AdminDashboardComponent },  // Dashboard admin
  { path: 'pointages', component: PointagesComponent },  // Gestion des pointages
  { path: 'structures', component: StructuresComponent }, // Gestion des structures
  { path: 'apprenants', component: ApprenantsComponent }, // Gestion des apprenants
  { path: 'employes', component: EmployesComponent },     // Gestion des employés
  { path: 'card-management', component: CardManagementComponent }, // Gestion des cartes
  { path: 'assign-card/:id', component: AssignCardComponent }, // Assignation de cartes avec un ID
  { path: '**', redirectTo: '/login' }, // Redirection en cas de route non trouvée
];

// Initialisation de l'application avec les routes et les services nécessaires
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Fournir les routes définies
    importProvidersFrom(HttpClientModule), // Fournir HttpClientModule pour les requêtes HTTP
  ],
}).catch((err) => console.error(err));
