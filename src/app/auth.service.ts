import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = 'http://127.0.0.1:8000/api/login'; // Endpoint pour la connexion
  private rfidLoginUrl = 'http://127.0.0.1:5000/events'; // Endpoint pour la connexion RFID
  private usersUrl = 'http://127.0.0.1:8000/api/utilisateurs'; // Endpoint pour récupérer les utilisateurs

  constructor(private http: HttpClient) {}

  /**
   * Méthode pour gérer la connexion via email et mot de passe
   * @param email Email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Observable des données de connexion
   */
  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(this.loginUrl, credentials);
  }

  /**
   * Méthode pour gérer la connexion via carte RFID
   * @param rfidUID UID de la carte RFID
   * @returns Observable des données de connexion
   */
  loginWithRFID(rfidUID: string): Observable<any> {
    const credentials = { rfidUID };
    return this.http.post(this.rfidLoginUrl, credentials);
  }

  /**
   * Méthode pour récupérer les utilisateurs
   * @returns Observable de la liste des utilisateurs
   */
  getUsers(): Observable<any> {
    return this.http.get(this.usersUrl);
  }

  /**
   * Méthode pour récupérer les détails d'un utilisateur spécifique
   * @param id ID de l'utilisateur
   * @returns Observable des détails de l'utilisateur
   */
  /* getUser Details(id: string): Observable<any> {
    const url = `${this.usersUrl}/${id}`; // Endpoint pour un utilisateur spécifique
    return this.http.get(url);
  } */
}