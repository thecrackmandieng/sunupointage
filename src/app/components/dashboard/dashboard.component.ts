import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { RFIDService } from '../../rfid.service';
import { Router } from '@angular/router';
import { ServoService } from '../../servo.service';

declare var bootstrap: any; // Déclaration globale pour Bootstrap

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, FormsModule, DatePipe],
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName: string = 'Utilisateur';
  employees: any[] = [];
  filteredEmployees: any[] = [];
  paginatedEmployees: any[] = [];
  errorMessage: string | null = null;

  searchQuery: string = '';
  selectedDepartment: string = '';
  departments: string[] = ['Departement1', 'Departement2', 'Cohorte1'];

  isSidebarOpen: boolean = true;

  pageSize: number = 10;
  currentPage: number = 1;
  totalEmployees: number = 0;

  selectedUser: any = null;
  detectedCardInfo: any = null;
  detectionInterval: any = null;
  cardDetected: boolean = false;
  rfidData: any = null;

  currentDateTime: string = '';

  constructor(
    private authService: AuthService,
    private rfidService: RFIDService,
    private servoService: ServoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEmployees();
    this.listenForRFID();
    this.updateDateTime();

    this.detectionInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    this.rfidService.stopListeningRFID();
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    const angle = this.isSidebarOpen ? 90 : 0;

    this.servoService.setServoAngle(angle).subscribe({
      next: () => console.log(`Commande envoyée : Servo à ${angle}°`),
      error: (err: any) => console.error('Erreur lors de l\'envoi de la commande :', err),
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  fetchEmployees(): void {
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.employees = data.map((user: any) => ({
          photo: user.photo || 'https://via.placeholder.com/40',
          prenom: user.prenom || '',
          nom: user.nom || '',
          telephone: user.telephone || '',
          email: user.email || '',
          departement: user.departement || user.cohorte || '',
          created_at: new Date().toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        this.filteredEmployees = [...this.employees];
        this.totalEmployees = this.filteredEmployees.length;
        this.paginateEmployees();
      },
      error: (err) => {
        this.errorMessage = 'Une erreur est survenue lors du chargement des données.';
        console.error(err);
      },
    });
  }

  listenForRFID(): void {
    this.rfidService.getRFIDStatus().subscribe({
      next: (data: any) => {
        console.log('Données reçues de la carte RFID :', data);

        if (data?.user?.nom) {
          this.detectedCardInfo = data;
          this.selectedUser = this.employees.find(
            (employee) => employee.nom === data.user.nom
          );

          if (this.selectedUser) {
            this.errorMessage = null;
            this.showModal();
          } else {
            this.errorMessage = 'Utilisateur non trouvé pour cette carte.';
            this.showModal();
          }
        } else {
          this.errorMessage = 'Carte invalide ou données incorrectes.';
          this.showModal();
        }
      },
      error: (err) => console.error('Erreur lors de la réception des données RFID :', err),
    });
  }

  showModal(): void {
    const modalElement = document.getElementById('userModal');
    if (!modalElement) {
      console.error('Le modal n\'existe pas dans le DOM.');
      return;
    }

    const modalTitle = modalElement.querySelector('.modal-title');
    const modalBody = modalElement.querySelector('.modal-body');

    if (this.selectedUser) {
      if (modalTitle) {
        modalTitle.textContent = `${this.selectedUser.prenom} ${this.selectedUser.nom}`;
      }

      if (modalBody) {
        modalBody.innerHTML = `
          <div class="text-center">
            <img src="${this.selectedUser.photo}" alt="${this.selectedUser.nom} ${this.selectedUser.prenom}" class="img-fluid rounded-circle" style="width: 100px; height: 100px;">
          </div>
          <p><strong>Nom :</strong> ${this.selectedUser.nom}</p>
          <p><strong>Prénom :</strong> ${this.selectedUser.prenom}</p>
          <p><strong>Heure :</strong> ${this.currentDateTime}</p>
        `;
      }
    } else if (this.errorMessage) {
      if (modalTitle) {
        modalTitle.textContent = 'Erreur de carte';
      }

      if (modalBody) {
        modalBody.innerHTML = `
          <div class="text-center">
            <p>${this.errorMessage}</p>
          </div>
        `;
      }
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  acceptUser(): void {
    if (this.selectedUser) {
      console.log('Utilisateur accepté :', this.selectedUser);
    }
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  savePointage(): void {
    if (this.rfidData && this.detectedCardInfo?.user?.userId) {
      const time = new Date().toISOString();
      const userId = this.detectedCardInfo.user.userId;

      this.rfidService.savePointage(userId, this.rfidData.rfidUID, 'accepted', time).subscribe({
        next: (response) => {
          console.log('Pointage enregistré :', response);
          alert('Pointage enregistré avec succès.');
        },
        error: (err) => console.error('Erreur lors de l\'enregistrement du pointage :', err),
      });
    } else {
      console.error('Aucun userId ou RFID détecté.');
    }
  }

  rejectUser(): void {
    alert('Utilisateur rejeté : ' + this.selectedUser?.prenom);
    this.selectedUser = null;
    this.cardDetected = false;
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(
      (employee) =>
        (this.selectedDepartment === '' ||
          employee.departement === this.selectedDepartment) &&
        (this.searchQuery === '' ||
          employee.telephone.includes(this.searchQuery))
    );
    this.paginateEmployees();
  }

  paginateEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.filteredEmployees.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.filteredEmployees.length / this.pageSize);
  }

  changePage(direction: string): void {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next' && this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
    this.paginateEmployees();
  }
}
