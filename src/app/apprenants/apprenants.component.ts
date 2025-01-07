import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';  
import { CommonModule } from '@angular/common';
import { ApprenantService } from '../apprenant.service';
import { ChangeDetectorRef } from '@angular/core';


interface Apprenant {
  matricule?: string;  // Mark as optional
  selected: boolean;
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;  // Optional photo property

  adresse?: string;
  telephone?: string;
}



interface Cohorte {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-apprenants',
  standalone: true,
  imports: [SidebarComponent, FormsModule , CommonModule ],
  templateUrl: './apprenants.component.html',
  styleUrls: ['./apprenants.component.css']
})
export class ApprenantsComponent implements OnInit {

  cohortes: Cohorte[] = [];
  apprenants: Apprenant[] = [];
  
  selectedCohorte: number = 0; 
  selectedApprenants: Apprenant[] = []; 

  constructor(private apprenantService: ApprenantService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchCohortes();
  }

  fetchCohortes(): void {
    this.apprenantService.getCohortes().subscribe((data: Cohorte[]) => {
      this.cohortes = data;
    });
  }

  onCohorteChange(): void {
    this.apprenantService.getApprenantsByCohorte(this.selectedCohorte).subscribe(
      (response) => {
        console.log('Réponse complète:', response); // Pour vérifier la structure complète
        if (Array.isArray(response)) {
          // Ajoutez la propriété selected ici si elle n'existe pas
          this.apprenants = response.map(apprenant => ({
            ...apprenant,
            selected: false,  // Valeur par défaut
          }));
        } else {
          console.error('Format de réponse inattendu :', response);
          this.apprenants = []; // Définit une liste vide en cas de problème
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des apprenants:', error);
        this.apprenants = []; // Gère les erreurs
      }
    );
  }
  
  getInitials(prenom: string, nom: string): string {
    const firstInitial = prenom ? prenom.charAt(0).toUpperCase() : ''; // Prénom initial
    const lastInitial = nom ? nom.charAt(0).toUpperCase() : ''; // Nom initial
    return firstInitial + lastInitial; // Retourne les initiales
  }
  
  
  
  

  toggleSelectAll(event: any): void {
    this.apprenants.forEach((apprenant) => (apprenant.selected = event.target.checked));
    this.updateSelectedApprenants();
  }

  updateSelectedApprenants(): void {
    this.selectedApprenants = this.apprenants.filter((apprenant) => apprenant.selected);
  }

  filterSelected() {
    this.selectedApprenants = this.apprenants.filter((apprenant) => apprenant.selected);
  }

  getSelectedIds() {
    const ids = this.selectedApprenants.map((a) => a.id);
    console.log('Selected IDs:', ids);
  }

  bulkDelete(): void {
    if (confirm('Voulez-vous vraiment supprimer ces apprenants ?')) {
      const ids = this.selectedApprenants.map((a) => a.id);
      this.apprenantService.deleteApprenants(ids).subscribe(() => this.onCohorteChange());
    }
  }

  bulkBlock(): void {
    if (confirm('Voulez-vous vraiment bloquer ces apprenants ?')) {
      const ids = this.selectedApprenants.map((a) => a.id);
      this.apprenantService.blockApprenants(ids).subscribe(() => this.onCohorteChange());
    }
  }

  openCSVImportDialog(): void {
    // Logic to open file dialog and call the importCSV method
  }

  editApprenant(apprenant: Apprenant): void {
    // Logic for editing apprenant
  }

  viewApprenant(apprenant: Apprenant): void {
    // Logic for viewing apprenant
  }

  blockApprenant(apprenant: Apprenant): void {
    // Logic for blocking apprenant
  }

  deleteApprenant(apprenant: Apprenant): void {
    // Logic for deleting apprenant
  }
}