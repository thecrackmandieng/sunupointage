import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './../../auth.service';
import { RFIDService } from './../../rfid.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class LoginComponent implements OnInit, OnDestroy {
  user = {
    email: '',
    password: '',
    rfidUID: '',
  };
  isLoading = false;
  errorMessage: string | null = null;
  showPassword = false;
  rfidSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private rfidService: RFIDService,
    private router: Router
  ) {}

  ngOnInit() {
    // Commencer à écouter les événements RFID
    this.rfidSubscription = this.rfidService.getRFIDStatus().subscribe((data) => {
      if (data.status === 'AUTHORIZED') {
        // Si la carte est autorisée, récupérer l'UID et essayer de se connecter
        this.user.rfidUID = data.uid;
        this.onSubmit(); // Appeler la méthode onSubmit pour connecter l'utilisateur
      } else {
        // Si la carte n'est pas autorisée, afficher un message d'erreur
        this.errorMessage = 'Carte RFID non autorisée';
      }
    });
  }

  ngOnDestroy() {
    // Nettoyage à la destruction du composant
    if (this.rfidSubscription) {
      this.rfidSubscription.unsubscribe();
    }
    this.rfidService.stopListeningRFID(); // Fermer la connexion SSE
  }

  // Méthode appelée lors de la soumission du formulaire
  onSubmit() {
    this.isLoading = true;
  
    if (this.user.rfidUID) {
      // Connexion par carte RFID
      this.authService.loginWithRFID(this.user.rfidUID).subscribe({
        next: (response) => {
          this.handleSuccess(response);
        },
        error: (error) => {
          this.handleError(error);
        },
      });
    } else {
      // Connexion par email et mot de passe
      this.authService.login(this.user.email, this.user.password).subscribe({
        next: (response) => {
          this.handleSuccess(response);
        },
        error: (error) => {
          this.handleError(error);
        },
      });
    }
  }
  

  // Gérer le succès de la connexion
  handleSuccess(response: any) {
    this.isLoading = false;
    console.log('Connexion réussie', response);
  
    // Sauvegarder le jeton d'authentification
    localStorage.setItem('token', response.api_token);
  
    // Vérifier si le rôle est défini et rediriger en fonction du rôle
    const role = response.role;
  
    if (role === 'admin') {
      // Si le rôle est admin, rediriger vers le tableau de bord admin
      this.router.navigate(['/admin-dashboard']);
    } else if (role === 'vigile') {
      // Si le rôle est vigile, rediriger vers le tableau de bord vigile
      this.router.navigate(['/dashboard']);
    } else {
      // Si le rôle est inconnu ou non autorisé
      this.errorMessage = 'Rôle utilisateur inconnu ou non autorisé';
      console.error('Rôle inconnu:', role);
    }
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
