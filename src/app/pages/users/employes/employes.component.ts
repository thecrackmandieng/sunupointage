import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component'; 
import { EmployeService } from '../../../services/employe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importer FormsModule

export interface Employe {
  id: number;       // ou string si l'ID est sous forme de texte
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string; // Facultatif si non toujours présent
  photo?: string;   // Facultatif
  fonction?: string; // Facultatif
  matricule?: string; // Facultatif
  selected?: boolean; // Ajouté pour la gestion des cases à cocher
}



interface Departement {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule ],
  templateUrl: './employes.component.html',
  styleUrl: './employes.component.css'
})

export class EmployesComponent {
 
  employes: any[] = [];
  departements: any[] = [];
  selectedDepartement: number = 0;
  selectedEmployes: any[] = [];
  page: number = 1;
  size: number = 10;

  constructor(private employeService: EmployeService) { }

  ngOnInit(): void {
    this.loadDepartements();
    this.loadEmployes();
  }

  loadDepartements(): void {
    this.employeService.getDepartements().subscribe(
      (data: Departement[]) => {
        console.log('Liste des départements :', data); // Vérifiez ici
        this.departements = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des départements :', error);
      }
    );
  }
  
 
  loadEmployes(): void {
    this.employeService.getEmployesByDepartement(this.selectedDepartement).subscribe(response => {
      this.employes = response.employes;
    });
  }

   // Cette méthode est déclenchée lorsqu'un département est sélectionné
   onDepartementChange(): void {
    if (this.selectedDepartement) {
      this.employeService.getEmployesByDepartement(this.selectedDepartement).subscribe(
        (response: { message: string; employes: Employe[] }) => { // Déclarer le type de réponse attendu
          console.log('Réponse des employés:', response);
          if (response && response.employes && Array.isArray(response.employes)) {
            this.employes = response.employes.map((employe: Employe) => ({
              ...employe,
              selected: false, // Valeur par défaut
            }));
          } else {
            console.error('Format de réponse inattendu ou liste vide :', response);
            this.employes = [];
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des employés:', error);
          this.employes = [];
        }
      );
    }
  }
  
  
  
  openCSVImportDialog(): void {
    // Logique pour ouvrir la boîte de dialogue d'importation CSV
  }

  editEmploye(employe: any): void {
    // Logique pour modifier l'employé
  }

  viewEmploye(employe: any): void {
    // Logic for viewing apprenant
  }

  blockEmploye(employe: any): void {
    this.employeService.blockEmploye(employe.id).subscribe(response => {
      alert('Employé bloqué');
      this.loadEmployes();  // Recharger les employés après l'action
    });
  }

  deleteEmploye(employe: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeService.deleteEmploye(employe.id).subscribe(response => {
        alert('Employé supprimé');
        this.loadEmployes();  // Recharger les employés après la suppression
      });
    }
  }

  bulkDelete(): void {
    if (this.selectedEmployes.length === 0) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ces employés ?')) {
      this.selectedEmployes.forEach(employe => {
        this.employeService.deleteEmploye(employe.id).subscribe(response => {
          alert('Sélection supprimée');
          this.loadEmployes();  // Recharger les employés après la suppression
        });
      });
    }
  }

  bulkBlock(): void {
    if (this.selectedEmployes.length === 0) return;
    this.selectedEmployes.forEach(employe => {
      this.employeService.blockEmploye(employe.id).subscribe(response => {
        alert('Sélection bloquée');
        this.loadEmployes();  // Recharger les employés après le blocage
      });
    });
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadEmployes();
    }
  }

  nextPage(): void {
    this.page++;
    this.loadEmployes();
  }

  getInitials(prenom: string, nom: string): string {
    return `${prenom[0]}${nom[0]}`.toUpperCase();  // Retourne les initiales du prénom et du nom
  }
}