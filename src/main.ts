import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// Importation des composants standalone
import { LoginComponent } from './app/pages/login/login.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { AdminDashboardComponent } from './app/pages/admin-dashboard/admin-dashboard.component';
import { PointagesComponent } from './app/pointages/pointages.component'; // Assurez-vous du bon chemin
import { AppComponent } from './app/app.component';
import { StructuresComponent } from './app/structures/structures.component'; // Assurez-vous du bon chemin
import { ApprenantsComponent } from './app/apprenants/apprenants.component'; // Assurez-vous du bon chemin
import { EmployesComponent } from './app/employes/employes.component'; // Assurez-vous du bon chemin
import { CardManagementComponent} from './app/card-management/card-management.component'; // Assurez-vous du bon chemin
import { AssignCardComponent } from './app/assign-card/assign-card.component';



 

const routes: Route[] = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Route de redirection vers la page de login
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'pointages', component: PointagesComponent }, // La route pour afficher les pointages
  { path: 'structures', component: StructuresComponent }, // La route pour afficher les structures
  { path: 'apprenants', component: ApprenantsComponent }, // La route pour afficher les structures
  { path: 'employes', component: EmployesComponent }, // La route pour afficher les structures
  { path: 'card-management', component: CardManagementComponent }, // La route pour afficher les structures
  { path: 'assign-card/:id', component: AssignCardComponent }, // Route assign-card avec un paramètre




  { path: '**', redirectTo: '/login' },
];

// Bootstrap de l'application avec AppComponent et les routes
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),  // Configuration des routes
    importProvidersFrom(HttpClientModule),  // Importation du module HttpClient pour les requêtes HTTP
  ],
}).catch((err) => console.error(err));
