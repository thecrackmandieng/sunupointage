import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


export interface Apprenant {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  adresse?: string;
  telephone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApprenantService {

  private baseUrl = 'http://localhost:8000/api/apprenant';
  private apiUrlCohortes = 'http://localhost:8000/api/cohortes';      // URL de l'API Laravel pour les cohortes


  constructor(private http: HttpClient) {}

  getCohortes(): Observable<any> {
    return this.http.get(`${this.apiUrlCohortes}/list`);
  }

 
  getApprenantsByCohorte(id: number): Observable<Apprenant[]> {
    return this.http.get<{ apprenants: Apprenant[] }>(`${this.apiUrlCohortes}/${id}/apprenants`).pipe(
      map((response) => {
        if (response && response.apprenants) {
          return response.apprenants; // Retourne uniquement le tableau des apprenants
        } else {
          console.error('Format de réponse inattendu:', response);
          return []; // Retourne une liste vide si la structure est incorrecte
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la récupération des apprenants:', error);
        return of([]); // Retourne une liste vide en cas d'erreur
      })
    );
  }
  




  deleteApprenants(ids: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/apprenants/bulk-delete`, { ids });
  }

  blockApprenants(ids: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/apprenants/bulk-block`, { ids });
  }

  importCSV(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/cohortes/${id}/import`, formData);
  }
}