import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {

    private baseUrl = 'http://localhost:8000/api/employes';
    private apiUrlDepartements = 'http://localhost:8000/api/departements';      // URL de l'API Laravel pour les cohortes
  
  constructor(private http: HttpClient) { }


  getDepartements(): Observable<any> {
    return this.http.get(`${this.apiUrlDepartements}/list`);
  }

  // Méthode pour récupérer les employés par département
  getEmployesByDepartement(departementId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlDepartements}/${departementId}/employes`);
  }

  // Ajouter un employé
  addEmploye(employe: any): Observable<any> {
    return this.http.post(this.baseUrl, employe);
  }

  // Modifier un employé
  updateEmploye(employe: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${employe.id}`, employe);
  }

  // Supprimer un employé
  deleteEmploye(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Bloquer un employé
  blockEmploye(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/block/${id}`, {});
  }

  // Importer des employés via CSV
  importCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/import`, formData);
  }
}