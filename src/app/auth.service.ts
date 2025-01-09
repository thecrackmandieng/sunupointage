import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Définir les URLs des API
  private loginUrl = 'http://127.0.0.1:5000/login'; // URL pour la connexion classique
  private rfidLoginUrl = 'http://127.0.0.1:5000/events'; // URL pour la connexion RFID
  private usersUrl = 'http://127.0.0.1:8000/api/utilisateurs'; // URL pour gérer les utilisateurs
  private forgotPasswordUrl = 'http://127.0.0.1:8000/api/forgot-password'; // URL pour le mot de passe oublié

  constructor(private http: HttpClient) {}

  /**
   * Connexion via email et mot de passe
   * @param email Email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Observable des données de connexion
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(this.loginUrl, { email, password }).pipe(
      catchError((error) => this.handleError('Erreur de connexion', error))
    );
  }

  /**
   * Connexion via RFID
   * @param rfidUID UID de la carte RFID
   * @returns Observable des données de connexion
   */
  loginWithRFID(rfidUID: string): Observable<any> {
    return this.http.post(this.rfidLoginUrl, { rfidUID }).pipe(
      catchError((error) => this.handleError('Erreur RFID', error))
    );
  }

  /**
   * Récupération de la liste des utilisateurs
   * @returns Observable contenant la liste des utilisateurs
   */
  getUsers(): Observable<any> {
    return this.http.get(this.usersUrl).pipe(
      catchError((error) =>
        this.handleError('Erreur lors de la récupération des utilisateurs', error)
      )
    );
  }

  /**
   * Création d'un utilisateur
   * @param userData Données de l'utilisateur à créer
   * @returns Observable des données de l'utilisateur créé
   */
  createUser(userData: any): Observable<any> {
    return this.http.post(this.usersUrl, userData).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création de l\'utilisateur :', error);
        throw error;
      })
    );
  }

  /**
   * Envoi d'un email de réinitialisation de mot de passe
   * @param email Email de l'utilisateur
   * @returns Observable du résultat de la requête
   */
  sendForgotPasswordEmail(email: string): Observable<any> {
    return this.http.post(this.forgotPasswordUrl, { email }).pipe(
      catchError((error) =>
        this.handleError('Erreur lors de la réinitialisation du mot de passe', error)
      )
    );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   * @param context Message de contexte pour l'erreur
   * @param error Erreur HTTP
   * @returns Observable avec une erreur formatée
   */
  private handleError(context: string, error: any): Observable<never> {
    const errorMessage = error.error?.message || 'Erreur serveur';
    console.error(`${context}:`, errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
