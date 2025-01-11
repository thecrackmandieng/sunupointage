import { Component, OnInit } from '@angular/core';
import { PointageService } from '../pointage.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-pointages',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, SidebarComponent],
  templateUrl: './pointages.component.html',
  styleUrls: ['./pointages.component.css']
})
export class PointagesComponent implements OnInit {
  pointages: any[] = []; // Données des pointages
  paginatedPointages: any[] = []; // Données paginées pour la page actuelle
  selectedPointage: any = {}; // Pointage sélectionné pour modification
  isModalOpen: boolean = false; // Contrôle l'affichage du modal
  isSaving: boolean = false; // Indicateur de sauvegarde
  isSuccessModalOpen: boolean = false; // Contrôle l'affichage du modal de succès
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 10; // Nombre d'éléments par page
  totalItems: number = 0; // Nombre total d'éléments

  constructor(private pointageService: PointageService) {}

  ngOnInit(): void {
    this.loadPointages(); // Charger les pointages au démarrage
  }

  /**
   * Charge les pointages depuis l'API Laravel et initialise les données paginées.
   */
  loadPointages(): void {
    this.pointageService.getPointages().subscribe(
      (data: any[]) => {
        console.log('Données récupérées depuis l\'API:', data);  // Vérifiez ici que _id est bien présent
        this.pointages = data;
        this.totalItems = this.pointages.length;
        this.updatePagination();
      },
      (error) => {
        console.error('Erreur lors de la récupération des pointages:', error);
      }
    );
  }
  

  /**
   * Met à jour les données paginées en fonction de la page actuelle.
   */
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPointages = this.pointages.slice(startIndex, endIndex);
  }

  /**
   * Calcul le nombre total de pages.
   */
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  /**
   * Change de page et met à jour les données paginées.
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /**
   * Ouvre le modal pour modifier un pointage spécifique.
   */
  openModal(pointage: any): void {
    this.selectedPointage = { ...pointage }; // Cloner pour éviter des modifications directes
    this.isModalOpen = true;
  }

  /**
   * Ferme le modal de modification.
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * Enregistre les modifications apportées au pointage sélectionné.
   */
  onEnregistrer(): void {
    if (!this.selectedPointage || !this.selectedPointage._id) {
      console.error('Erreur: Le pointage ne contient pas de champ "_id".');
      return;  // Si pas de _id, on arrête l'exécution
    }
  
    this.isSaving = true; // Début du processus de sauvegarde
  
    this.pointageService.updatePointage(this.selectedPointage).subscribe(
      (updatedPointage) => {
        // Mettre à jour localement le pointage modifié
        const index = this.pointages.findIndex(p => p._id === updatedPointage._id);
        if (index !== -1) {
          this.pointages[index] = updatedPointage;
        }
  
        this.closeModal(); // Fermer le modal
        this.isSaving = false; // Réinitialiser l'état de sauvegarde
        this.isSuccessModalOpen = true; // Afficher le modal de succès
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du pointage:', error);
        this.isSaving = false; // Réinitialiser l'état de sauvegarde
      }
    );
  }
  
  
  /**
   * Ferme le modal de succès.
   */
  closeSuccessModal(): void {
    this.isSuccessModalOpen = false;
  }
}
