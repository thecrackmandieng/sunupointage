import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Pour gérer les formulaires
import { CommonModule } from '@angular/common'; // Pour les directives comme ngIf, ngClass
import { HttpClientModule } from '@angular/common/http'; // Pour utiliser HttpClient
import { Router } from '@angular/router'; // Pour la navigation après la connexion
import { AuthService } from './../../auth.service'; // Import du service AuthService

@Component({
  selector: 'app-login',
  standalone: true, // Marque le composant comme standalone
  templateUrl: './login.component.html', // Chemin vers le fichier HTML
  styleUrls: ['./login.component.css'], // Chemin vers le fichier CSS
  imports: [CommonModule, FormsModule, HttpClientModule], // Importation du module HttpClientModule pour HttpClient
})
export class LoginComponent implements OnInit {
  user = {
    email: '',
    password: '',
  };
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.listenForRFID(); // Écouter les événements de détection de la carte RFID
  }

  // Méthode pour écouter les événements de détection de la carte RFID
  listenForRFID() {
    // Remplacez cette partie par votre logique pour écouter les événements de l'Arduino ou du lecteur RFID
    const rfidReader = new EventSource('http://localhost:5000/events'); // Exemple d'URL pour écouter les événements RFID

    rfidReader.onmessage = (event) => {
      const uid = event.data; // Supposons que l'UID est envoyé dans le message
      console.log(`Carte détectée avec UID : ${uid}`);
      this.loginWithRFID(uid); // Appeler la méthode de connexion avec l'UID détecté
    };
  }

  // Méthode pour se connecter avec l'UID détecté
  loginWithRFID(rfidUID: string) {
    this.isLoading = true;

    this.authService.loginWithRFID(rfidUID).subscribe({
      next: (response) => {
        this.handleSuccess(response);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  // Méthode appelée lors de la soumission du formulaire
  onSubmit() {
    this.isLoading = true;

    // Connexion via email et mot de passe
    this.authService.login(this.user.email, this.user.password).subscribe({
      next: (response) => {
        this.handleSuccess(response);
      },
      error: (error) => {
        this.handleError(error);
      },
    });
  }

  // Gérer le succès de la connexion
  handleSuccess(response: any) {
    this.isLoading = false;
    console.log('Connexion réussie', response);
    localStorage.setItem('token', response.api_token); // Sauvegarder le jeton d'authentification dans le stockage local
    this.router.navigate(['/dashboard']); // Redirection vers le tableau de bord ou la page d'accueil
  }

  // Gérer les erreurs de connexion
  handleError(error: any) {
    this.isLoading = false;
    this.errorMessage = error.error?.message || 'Erreur de connexion';
    console.error('Erreur de connexion', error);
  }

  // Permet de basculer l'affichage du mot de passe
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}