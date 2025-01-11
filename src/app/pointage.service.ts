import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PointageService {
  private apiUrl = 'http://localhost:8000/api/pointages'; // URL de l'API backend

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les pointages depuis le backend
   * @returns Observable<any[]> - Liste des pointages
   */
  getPointages(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }

  /**
   * Mettre à jour un pointage existant
   * @param pointage - Données du pointage à mettre à jour
   * @returns Observable<any> - Pointage mis à jour
   */
  updatePointage(pointage: any): Observable<any> {
    if (!pointage._id) {
      // Si _id n'existe pas, lever une erreur
      return throwError(() => new Error('Le pointage doit avoir un champ _id pour être mis à jour.'));
    }

    const url = `${this.apiUrl}/${pointage._id}`;  // Utilisez _id ici
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Format des données envoyées
    });

    return this.http.put<any>(url, pointage, { headers }).pipe(
      catchError(this.handleError) // Gestion des erreurs
    );
  }

  /**
   * Transformer les pointages pour une représentation graphique
   * @returns Observable<any> - Données formatées pour un graphique
   */
  getPointagesForChart(): Observable<any> {
    return this.getPointages().pipe(
      map((pointages) => {
        const groupedData: { [key: string]: { apprenants: number; employes: number } } = {};

        // Grouper les données par date
        pointages.forEach((pointage) => {
          const date = pointage.date;
          if (!groupedData[date]) {
            groupedData[date] = { apprenants: 0, employes: 0 };
          }

          // Exemple : Vous pourriez différencier apprenants et employés ici
          groupedData[date].apprenants += 1; // Incrémenter pour les apprenants
          groupedData[date].employes += 1; // Incrémenter pour les employés
        });

        // Retourner les données dans un format exploitable par un graphique
        return {
          labels: Object.keys(groupedData), // Dates
          apprenants: Object.values(groupedData).map((data) => data.apprenants),
          employes: Object.values(groupedData).map((data) => data.employes),
        };
      })
    );
  }

  /**
   * Gestion centralisée des erreurs HTTP
   * @param error - Objet d'erreur HTTP
   * @returns Observable<never> - Flux d'erreur
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue s\'est produite.';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client ou réseau
      errorMessage = `Erreur côté client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Erreur serveur: ${error.status}, Message: ${error.message}`;
    }

    // Afficher l'erreur dans la console pour le débogage
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
