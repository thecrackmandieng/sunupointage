import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component'; 
import { EmployeService } from '../employe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Importer FormsModule
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


export interface Employe {
  id: number;       // ou string si l'ID est sous forme de texte
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string; // Facultatif si non toujours présent
  photo?: string;   // Facultatif
  fonction?: string; // Facultatif
  selected?: boolean; // Ajouté pour la gestion des cases à cocher
}



interface Departement {
  id: number;
  nom: string;
}

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './employes.component.html',
  styleUrl: './employes.component.css'
})

export class EmployesComponent {
 
  employes: any[] = [];
  departements: any[] = [];
  selectedDepartement: string = '677bdd1dd371305888075813';
  

  selectedEmployes: any[] = [];
  page: number = 1;
  size: number = 10;
  employeForm!: FormGroup;

  currentPages: number = 1;


  notificationMessage: string = ''; // Message de notification
  notificationClass: string = '';
  employe: any = null; // Pour stocker les informations de l'apprenant

  selectedEmploye: any;
  showEmployeModal: boolean = false;


  errorMessages: string[] = []; // Contient les messages d'erreurs de validatio
  isEditing = false;

 
 
  

  constructor(private fb: FormBuilder, private employeService: EmployeService) { }

    

   // Méthode pour afficher le message de notification
   showNotification(message: string, isError: boolean = false): void {
    this.notificationMessage = message;
    this.notificationClass = isError ? 'error' : 'success';

    // Masquer automatiquement la notification après 5 secondes
    setTimeout(() => {
      this.notificationMessage = '';
    }, 5000);
  }
  // Variables pour la gestion des modals
  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  actionToConfirm: Function | null = null;

  ngOnInit(): void {
    
    this.employeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern('^[a-zA-Z\s]+$')]],
      prenom: ['', [Validators.required, Validators.pattern('^[a-zA-Z\s]+$')]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^(76|77|78|75)\\d{7}$')]],
      adresse: ['', Validators.required],
      role: ['', Validators.required],
      fonction: ['', Validators.required],
      photo: [''] 
    });

    this.loadDepartements();
    this.loadEmployes();
  }loadDepartements(): void {
    this.employeService.getDepartements().subscribe(
      (data: Departement[]) => {
        console.log('Liste des départements :', data); // Vérifiez ici la structure des données
        this.departements = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des départements :', error);
        // Gérer une éventuelle erreur, par exemple en affichant un message utilisateur
        this.departements = [];
      }
    );
  }
  
  loadEmployes(): void {
    if (!this.selectedDepartement) {
      console.warn('Aucun département sélectionné pour charger les employés.');
      this.employes = [];
      return;
    }
  
    this.employeService.getEmployesByDepartement(this.selectedDepartement).subscribe(
      (response: { message: string; employes: Employe[] }) => {
        console.log('Réponse des employés :', response); // Vérifiez ici la structure des données
        if (response && response.employes && Array.isArray(response.employes)) {
          this.employes = response.employes.map((employe: Employe) => ({
            ...employe,
            selected: false, // Ajout d'une propriété par défaut si nécessaire
          }));
        } else {
          console.error('Format de réponse inattendu ou liste d’employés vide :', response);
          this.employes = [];
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des employés :', error);
        // Réinitialiser la liste des employés en cas d'erreur
        this.employes = [];
      }
    );
  }
  
  // Méthode déclenchée lorsqu’un département est sélectionné
  onDepartementChange(): void {
    if (!this.selectedDepartement) {
      console.warn('Aucun département sélectionné.');
      this.employes = [];
      return;
    }
  
    console.log('Département sélectionné :', this.selectedDepartement);
    this.loadEmployes(); // Appel de la méthode centralisée pour charger les employés
  }
  
  
  // Ouvrir la boîte de dialogue d'importation CSV
  openCSVImportDialog(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';  // Accepter uniquement les fichiers CSV

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.importCSV(file);
      }
    };

    input.click();  // Ouvrir la boîte de dialogue pour sélectionner le fichier
  }

  // Importer le fichier CSV via le service
  importCSV(file: File): void {
   

    this.employeService.importCSV(file).subscribe(
      (response) => {
        // Si l'importation réussit, afficher le message de succès
        this.showNotification('L\'importation des employés a été réussie !');
        console.log('Fichier CSV importé avec succès:', response);
      },
      (error) => {
        // Si l'importation échoue, afficher le message d'erreur
        this.showNotification('Une erreur s\'est produite lors de l\'importation du fichier CSV. Veuillez réessayer.');
        console.error('Erreur lors de l\'importation du CSV:', error);
      }
    );
  }
  viewEmploye(employe: any) {
    this.selectedEmploye = employe;
    this.showEmployeModal = true;
  }

  closeEmployeModal() {
    this.showEmployeModal = false;
    this.selectedEmploye = null;
  }

 // Modal logic
openConfirmationModal(message: string, action: Function): void {
  this.confirmationMessage = message;
  this.actionToConfirm = action;
  this.showConfirmationModal = true;
}

confirmAction(): void {
  if (this.actionToConfirm) {
    this.actionToConfirm();
  }
  this.closeConfirmationModal();
}

cancelAction(): void {
  this.closeConfirmationModal();
}

closeConfirmationModal(): void {
  this.showConfirmationModal = false;
  this.confirmationMessage = '';
  this.actionToConfirm = null;
}

// Exemple d'utilisation corrigé : Bloquer un employé
confirmBlockEmploye(employe: any): void {
  this.openConfirmationModal(
    `Voulez-vous vraiment bloquer ${employe.prenom} ${employe.nom} ?`,
    () => this.blockEmploye(employe) // Action après confirmation
  );
}

blockEmploye(employe: any): void {
  this.employeService.blockEmploye(employe.id).subscribe(
    (response) => {
      this.showNotification(`Employé ${employe.prenom} ${employe.nom} bloqué avec succès`);
      this.loadEmployes(); // Recharger les employés après l'action
    },
    (error) => {
      this.showNotification('Erreur lors du blocage de l\'employé', true);
    }
  );
}

// Exemple d'utilisation corrigé : Supprimer un employé
deleteEmploye(employe: any): void {
  this.openConfirmationModal(
    'Êtes-vous sûr de vouloir supprimer cet employé ?',
    () => {
      this.employeService.deleteEmploye(employe.id).subscribe((response) => {
        this.showNotification(`Employé supprimé avec succès`);
        this.loadEmployes(); // Recharger les employés après la suppression
      });
    }
  );
}

// Supprimer plusieurs employés
bulkDelete(): void {
  if (this.selectedEmployes.length === 0) return;
  this.openConfirmationModal(
    'Êtes-vous sûr de vouloir supprimer ces employés ?',
    () => {
      this.selectedEmployes.forEach((employe) => {
        this.employeService.deleteEmploye(employe.id).subscribe(() => {
          this.showNotification('Sélection supprimée');
          this.loadEmployes();
        });
      });
    }
  );
}

// Bloquer plusieurs employés
bulkBlock(): void {
  if (this.selectedEmployes.length === 0) return;
  this.openConfirmationModal(
    'Êtes-vous sûr de vouloir bloquer ces employés ?',
    () => {
      this.selectedEmployes.forEach((employe) => {
        this.employeService.blockEmploye(employe.id).subscribe(() => {
          this.showNotification('Sélection bloquée');
          this.loadEmployes();
        });
      });
    }
  );
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


  onEmployeSelect(employe: any, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      this.selectedEmployes.push(employe);
    } else {
      this.selectedEmployes = this.selectedEmployes.filter(e => e.id !== employe.id);
    }
  }


  editEmploye(employe: any): void {
    if (employe && employe.id) {
      this.employeForm.patchValue({
        nom: employe.nom || '',
        prenom: employe.prenom || '',
        email: employe.email || '',
        telephone: employe.telephone || '',
        adresse: employe.adresse || '',
        role: employe.role || '',
       fonction: employe.fonction || '',
        photo: employe.photo || '',
      });
      this.employe = employe; // Assurez-vous que l'objet employe est assigné correctement
      this.isEditing = true;
    } else {
      console.error('Aucune donnée employé disponible pour édition ou l\'ID est manquant.');
    }
  }
  
  validateField(fieldName: string): void {
    const field = this.employeForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      this.errorMessages.push(`${fieldName} est requis.`);
    } else {
      this.errorMessages = this.errorMessages.filter(
        (message) => !message.includes(fieldName)
      );
    }
  }

  onSubmit(): void {
    if (this.isEditing && this.employeForm.valid) {
      const updatedEmploye = {
        id: this.employe.id, // Assurez-vous que l'ID est inclus
        ...this.employeForm.value,
      };
  
      this.employeService.updateEmploye(updatedEmploye).subscribe(
        (data) => {
          this.showNotification('Employé mis à jour avec succès', false);
          this.closeEditModal();
        },
        (error) => {
          this.showNotification('Erreur lors de la mise à jour de l\'employé', true);
          console.error('Erreur lors de la mise à jour de l\'employé', error);
        }
      );
    }
  }
  

  closeEditModal(): void {
    this.isEditing = false;
  }

 
  }