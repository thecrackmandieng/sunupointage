import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-card-management',
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.css'],
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, SidebarComponent],
  providers: [EmployeeService],
})
export class CardManagementComponent implements OnInit {
  employees: any[] = []; // Liste complète des employés
  paginatedEmployees: any[] = []; // Liste des employés affichés (pagination)
  loading = true; // Indicateur de chargement
  selectedEmployee: any = null; // Employé sélectionné pour l'action

  // Variables pour la pagination
  currentPage = 1; // Page actuelle
  itemsPerPage = 10; // Nombre d'employés par page
  totalPages = 0; // Nombre total de pages

  constructor(private employeeService: EmployeeService, private router: Router) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: any[]) => {
        this.employees = data;
        this.loading = false;
        this.setupPagination();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des employés', err);
        this.loading = false;
      },
    });
  }

  // Configuration initiale de la pagination
  setupPagination(): void {
    this.totalPages = Math.ceil(this.employees.length / this.itemsPerPage);
    this.updatePaginatedEmployees();
  }

  // Mettre à jour les employés affichés pour la page courante
  updatePaginatedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
  }

  // Navigation vers la page suivante
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedEmployees();
    }
  }

  // Navigation vers la page précédente
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEmployees();
    }
  }

  // Ouvrir le composant d'assignation de carte
  openAssignCard(employeeId: string): void {
    if (!employeeId) {
      console.error('Employee ID is undefined or null');
      return;
    }
  
    console.log('Navigating to assign-card with ID:', employeeId);
    this.router.navigate(['/assign-card', employeeId]).then(() => {
      console.log('Navigation successful');
    }).catch((err) => {
      console.error('Navigation error:', err);
    });
  }
  

  // Assignation de carte
  onAssignCard(cardId: string): void {
    console.log('onAssignCard called with cardId:', cardId);
    if (this.selectedEmployee && cardId) {
      this.selectedEmployee.cardID = cardId;
      this.employeeService.updateEmployee(this.selectedEmployee).subscribe({
        next: (updatedEmployee: any) => {
          console.log('Card assigned successfully:', updatedEmployee);
          this.selectedEmployee = null;
        },
        error: (err: any) => {
          console.error('Error assigning card:', err);
        },
      });
    }
  }
}
