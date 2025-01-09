import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RfidService {
  private apiUrl = 'http://localhost:5000/api/data'; // URL du backend Node.js

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les données RFID
  getCardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      catchError(this.handleError) // Capture des erreurs
    );
  }

  // Méthode pour gérer les erreurs
  private handleError(error: HttpErrorResponse) {
    // En cas d'erreur côté serveur ou réseau
    if (error.error instanceof ErrorEvent) {
      console.error('Une erreur réseau ou de connexion est survenue :', error.error.message);
      // Affiche un message d'erreur plus détaillé
      return throwError('Une erreur de connexion est survenue. Veuillez vérifier votre connexion internet.');
    } else {
      // Erreur côté serveur (statut HTTP)
      console.error(
        `Code de statut : ${error.status}, ` +
        `Message : ${error.message}`
      );
      // Retourne un message d'erreur précis pour l'utilisateur
      if (error.status === 0) {
        return throwError('Le serveur est inaccessible. Veuillez vérifier si le serveur est en ligne.');
      } else if (error.status >= 500) {
        return throwError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        return throwError('Une erreur inconnue est survenue. Veuillez réessayer.');
      }
    }
  }
}
