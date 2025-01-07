import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';  // Importer FormsModule ici
import { CommonModule } from '@angular/common';
import { StructureService } from '../structure.service';

interface Structure {
  name: string;
  nom: string;
  type: 'departement' | 'cohorte';
  responsable_departement: string;
  responsable_cohorte: string;
  nombre_personne: number;
  description: string;
  annee: number;
  heure_entree: number;
}
@Component({
  selector: 'app-structures',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],  // Assurez-vous que CommonModule est aussi importé si nécessaire
  templateUrl: './structures.component.html',
  styleUrls: ['./structures.component.css'],
})




export class StructuresComponent implements OnInit {

  isDepartementModalOpen: boolean = false;
  isCohorteModalOpen: boolean = false;

  errorMessage: string | null = null;  // Variable pour stocker le message d'erreur

  currentForm: string | null = null;  // initialisation de currentForm
  currentEditForm: string | null = null; // Pour les modals de modification
  employesAssocies: any[] = [];
  apprenantsAssocies: any[] = [];

  employes: any[] = [];  // Assurez-vous que cette propriété est bien définie
 
  currentDepartement: any = {}; // Propriété pour les données du département
  currentCohorte: any = {}; // Propriété pour les données de la cohorte

    currentPage: string = 'departement';  // Page par défaut
    showSuccessModal: boolean = false;


    nameValid: boolean = false;
    nomValid: boolean = false;
    responsableValid: boolean = false;
    nombrePersonneValid: boolean = false;
    nombrePersonnesValid: boolean = false;
    descriptionValid: boolean = false;
    anneeValid: boolean = false;
    heureEntreeValid: boolean = false;
    heureSortieValid: boolean = false;
    dateDebutValid: boolean = false;
    dateFinValid: boolean = false;

    isSubmitted: boolean = false;


    

    // Méthode pour changer la page
   setPage(page: string) {
  this.currentPage = page;
  this.errorMessage = null;  // Réinitialiser l'erreur avant de faire la requête

  this.filterType = page; // Met à jour filterType pour refléter la page active
  this.loadData(); // Recharge les données selon le nouveau type
}

    // Méthode pour afficher le formulaire
    showForm(formType: string) {
      this.currentForm = formType;  // 'departement', 'cohorte', ou 'editDepartement'
    }
    
    
    
    
    showEditForm(type: string, item: any): void {
      if (type === 'departement') {
        this.currentDepartement = { ...item };
        this.currentEditForm = 'departement';
      } else if (type === 'cohorte') {
        this.currentCohorte = { ...item };
        this.currentEditForm = 'cohorte';
      }
    }
    
  
  newDepartement = {
    name: '',
    responsable_departement: '',
    nombre_personne: 0,
    description: '',
    annee: new Date().getFullYear(),
    heure_entree: '',
    heure_sortie: ''
  };
  
  newCohorte = {
    nom: '',
    responsable_cohorte: '',
    nombre_personnes: 0,
    description: '',
    date_debut: '',
    date_fin: '',
    heure_entree: '',
    heure_sortie: ''
  };


 // Fonction pour fermer le modal de cohorte


 closeCohorteForm() {
  this.newCohorte = {
    nom: '',
    responsable_cohorte: '',
    nombre_personnes: 0,
    description: '',
    date_debut: '',
    date_fin: '',
    heure_entree: '',
    heure_sortie: ''
  };
  this.currentForm = null; // Optionnel : pour fermer le modal
}

closeDepartementForm() {
  this.newDepartement = {
    name: '',
    responsable_departement: '',
    nombre_personne: 0,
    description: '',
    annee: new Date().getFullYear(),
    heure_entree: '',
    heure_sortie: ''
  };
  this.currentForm = null; // Optionnel : pour fermer le modal
}



  departements: any[] = [];  // Liste des départements récupérés de l'API
  cohortes: any[] = [];  // Liste des cohortes récupérées de l'API
  filteredData: any[] = [];  // Liste filtrée qui contient soit des départements soit des cohortes
  filterType: string = 'departement'; // Par défaut, on affiche les départements
  searchQuery: string = ''; // La barre de recherche
  currentPages: number = 1;
  itemsPerPage: number = 10;
  selectAll: boolean = false; // Variable pour la case à cocher "tout sélectionner"
  selectedItems: any[] = [];  // Liste des éléments sélectionnés

  constructor(private structureService: StructureService) { }
  ngOnInit(): void {
    this.loadData(); // Charge les données dès le démarrage
  }

  // Méthode pour charger les départements ou cohortes en fonction du filtre
  filterData(): void {
    console.log('Filtre sélectionné:', this.filterType); // Affichez la valeur de filterType
    let dataToFilter = this.filterType === 'departement' ? this.departements : this.cohortes;
  
    // Appliquer le filtre de recherche
    this.filteredData = dataToFilter.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) // Rechercher par le nom
    );
  
    this.applyPagination(); // Appliquer la pagination après filtrage
    this.updateSelectedItems(); // Mettre à jour les éléments sélectionnés
  }
  

// Charger les départements ou les cohortes en fonction du filtre
loadData(): void {
  console.log('Filtre actuel:', this.filterType);  // Vérifier la valeur de filterType avant de charger les données

  if (this.filterType === 'departement') {
    this.structureService.getDepartements().subscribe(
      (data) => {
        console.log('Départements récupérés:', data);  // Vérifier que les départements sont bien récupérés
        this.departements = data;
        this.filteredData = [...this.departements]; // Initialiser les données filtrées pour départements
        this.filterData(); // Appliquer le filtrage
      },
      (error) => {
        console.error('Erreur lors de la récupération des départements', error);
      }
    );
  } else if (this.filterType === 'cohorte') {
    console.log('Filtre cohorte sélectionné, récupération des cohortes...'); // Log pour vérifier l'appel
    this.structureService.getCohortes().subscribe(
      (data) => {
        console.log('Cohortes récupérées:', data);  // Vérifier que les cohortes sont bien récupérées
        this.cohortes = data;
        this.filteredData = [...this.cohortes]; // Initialiser les données filtrées pour cohortes
        this.filterData(); // Appliquer le filtrage
      },
      (error) => {
        console.error('Erreur lors de la récupération des cohortes', error);
      }
    );
  }
}



  // Méthode pour ajouter un item (département ou cohorte)
  addItem(): void {


    this.isSubmitted = true;  // Marque le formulaire comme soumis

    const newItem = this.filterType === 'departement' ? {
      name: this.newDepartement.name,
      responsable_departement: this.newDepartement.responsable_departement,
      nombre_personne: this.newDepartement.nombre_personne,
      description: this.newDepartement.description,
      annee: this.newDepartement.annee,
      heure_entree: this.newDepartement.heure_entree,
      heure_sortie: this.newDepartement.heure_sortie
    } : {
      nom: this.newCohorte.nom,
      responsable_cohorte: this.newCohorte.responsable_cohorte,
      nombre_personnes: this.newCohorte.nombre_personnes,
      description: this.newCohorte.description,
      date_debut: this.newCohorte.date_debut,
      date_fin: this.newCohorte.date_fin,
      heure_entree: this.newCohorte.heure_entree,
      heure_sortie: this.newCohorte.heure_sortie
    };

    if (this.filterType === 'departement') {
      this.structureService.addDepartement(newItem).subscribe(
        (data) => {
          this.departements.push(data);
          this.filteredData.push(data);
          alert('Département ajouté avec succès');
        },
        (error) => {
          console.error('Erreur lors de l\'ajout du département', error);
          if (error.status === 400 && error.error?.error) {
            this.errorMessage = error.error.error; // Capturez le message d'erreur
          }
        }
      );
    } else if (this.filterType === 'cohorte') {
      this.structureService.addCohorte(newItem).subscribe(
        (data) => {
          this.cohortes.push(data);
          this.filteredData.push(data);
          alert('Cohorte ajoutée avec succès');
        },
        (error) => {
          console.error('Erreur lors de l\'ajout de la cohorte', error);
          if (error.status === 400 && error.error?.error) {
            this.errorMessage = error.error.error; // Capturez le message d'erreur
          }
        }
      );
    }
  }
        
      
    



 

  // Méthode pour afficher le formulaire de modification
editItem(item: any) {
  console.log('Élément cliqué:', item);  // Affiche l'objet item

  if (!item) {
    console.error('Données invalides:', item);  // Si item est invalide
    return;
  }

  console.log('Avant modification de currentForm:', this.currentForm); // Vérifiez avant modification

  if (item.type === 'departement') {
    this.currentDepartement = { ...item };  // Copie des données de l'élément sélectionné
    this.currentForm = 'departement';  // Ouvre le formulaire pour la modification du département
  } else if (item.type === 'cohorte') {
    this.currentCohorte = { ...item };  // Copie des données de l'élément sélectionné
    this.currentForm = 'cohorte';  // Ouvre le formulaire pour la modification de la cohorte
  } else {
    console.error('Type inconnu:', item.type);
  }

  console.log('currentForm après modification:', this.currentForm);  // Vérifiez après modification
}

 
  
  
  

  // Méthode pour mettre à jour un département
  updateDepartement() {
    console.log('Département à mettre à jour:', this.currentDepartement);
  
    this.structureService.updateDepartement(this.currentDepartement.id, this.currentDepartement).subscribe(
      (updatedDepartement) => {
        console.log('Département mis à jour :', updatedDepartement);
        this.closeDepartementForm();  // Ferme le formulaire après la mise à jour
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du département', error);
      }
    );
  }
  
  
  // Méthode pour mettre à jour une cohorte
  updateCohorte() {
    console.log('Cohorte à mettre à jour:', this.currentCohorte);
  
    this.structureService.updateCohorte(this.currentCohorte.id, this.currentCohorte).subscribe(
      (updatedCohorte) => {
        console.log('Cohorte mise à jour:', updatedCohorte);
        this.closeCohorteForm();  // Ferme le formulaire après la mise à jour
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de la cohorte', error);
      }
    );
  }
   
  
   
  
  // Exemple de fonction getEmployes
getEmployes(departementId: number): void {
  this.structureService.getEmployesByDepartement(departementId).subscribe(
    (response) => {
      this.employesAssocies = response.employes; // Assurez-vous que le retour est bien un tableau d'employés
    },
    (error) => {
      console.error('Erreur lors de la récupération des employés', error);
    }
  );
}


  // Méthode pour récupérer les apprenants associés à une cohorte
  getApprenantsAssocies(cohorteId: number): void {
    this.structureService.listerApprenantsParCohorte(cohorteId)
      .subscribe((data: { apprenants: any[] }) => {
        this.apprenantsAssocies = data.apprenants;  // Affecter la liste des apprenants à la variable
      }, (error) => {
        console.error('Erreur lors de la récupération des apprenants', error);
      });
  }


  closeDepartementModal() {
    this.isDepartementModalOpen = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }


  // Méthode pour supprimer un item
  deleteItem(item: any) {
    if (this.filterType === 'departement') {
      this.structureService.deleteDepartement(item.id).subscribe(
        () => {
          this.departements = this.departements.filter(d => d.id !== item.id);
          this.filteredData = this.filteredData.filter(d => d.id !== item.id);
          alert('Département supprimé');
        },
        (error) => {
          console.error('Erreur lors de la suppression du département', error);
        }
      );
    } else {
      this.structureService.deleteCohorte(item.id).subscribe(
        () => {
          this.cohortes = this.cohortes.filter(c => c.id !== item.id);
          this.filteredData = this.filteredData.filter(c => c.id !== item.id);
          alert('Cohorte supprimée');
        },
        (error) => {
          console.error('Erreur lors de la suppression de la cohorte', error);
        }
      );
    }
  }

  // Méthode pour sélectionner/désélectionner tous les éléments
  selectAllItems() {
    this.filteredData.forEach(item => item.selected = this.selectAll);
    this.updateSelectedItems();
  }

  // Met à jour les éléments sélectionnés
  updateSelectedItems() {
    this.selectedItems = this.filteredData.filter(item => item.selected);
    this.selectAll = this.filteredData.length === this.selectedItems.length;
  }

  // Pagination - Appliquer la pagination sur la liste filtrée
  applyPagination() {
    const startIndex = (this.currentPages - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredData = this.filteredData.slice(startIndex, endIndex);
  }

  // Pagination - Page précédente
  prevPage() {
    if (this.currentPages > 1) {
      this.currentPages--;
      this.filterData();
    }
  }

  // Pagination - Page suivante
  nextPage() {
    this.currentPages++;
    this.filterData();
  }

  


  // StructuresComponent
deleteSelected() {
  // Vérifiez si des éléments sont sélectionnés
  if (this.selectedItems.length > 0) {
    // Récupérer les IDs des éléments sélectionnés
    const selectedIds = this.selectedItems.map(item => item.id);

    // Si nous sommes dans le mode "département"
    if (this.filterType === 'departement') {
      this.structureService.bulkDeleteDepartements(selectedIds).subscribe(
        () => {
          // Filtrer et supprimer les départements dans la liste complète et la liste filtrée
          this.departements = this.departements.filter(d => !selectedIds.includes(d.id));
          this.filteredData = this.filteredData.filter(d => !selectedIds.includes(d.id));
          this.selectedItems = []; // Réinitialiser les éléments sélectionnés
          alert('Départements supprimés');
        },
        (error) => {
          console.error('Erreur lors de la suppression en masse', error);
        }
      );
    } 
    // Si nous sommes dans le mode "cohorte"
    else if (this.filterType === 'cohorte') {
      this.structureService.bulkDeleteCohortes(selectedIds).subscribe(
        () => {
          // Filtrer et supprimer les cohortes dans la liste complète et la liste filtrée
          this.cohortes = this.cohortes.filter(c => !selectedIds.includes(c.id));
          this.filteredData = this.filteredData.filter(c => !selectedIds.includes(c.id));
          this.selectedItems = []; // Réinitialiser les éléments sélectionnés
          alert('Cohortes supprimées');
        },
        (error) => {
          console.error('Erreur lors de la suppression en masse', error);
        }
      );
    }
  }
}

}