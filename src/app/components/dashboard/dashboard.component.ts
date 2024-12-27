import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importer FormsModule
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, FormsModule],
})
export class DashboardComponent implements OnInit {
  userName: string = 'Utilisateur';
  employees: any[] = [];
  filteredEmployees: any[] = [];
  errorMessage: string | null = null;

  searchQuery: string = ''; // Recherche par téléphone
  selectedDepartment: string = ''; // Filtrage par département
  departments: string[] = ['Departement', 'cohorte']; // Exemple de départements


  isSidebarOpen: boolean = true; // Définir l'état initial de la sidebar à ouverte (true)

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; // Bascule entre ouvert et fermé
  }


  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  fetchEmployees() {
    this.authService.getUsers().subscribe({
      next: (data) => {
        this.employees = data.map((user: any) => ({
          photo: user.photo || 'https://via.placeholder.com/40',
          prenom: user.prenom || '',
          nom: user.nom || '',
          telephone: user.telephone || '',
          email: user.email || '',
          departement: user.departement || user.cohorte || '',
          created_at: user.created_at || '',
        }));
        this.filteredEmployees = [...this.employees];
      },
      error: (err) => {
        this.errorMessage =
          'Une erreur est survenue lors du chargement des données.';
        console.error(err);
      },
    });
  }

  applyFilters() {
    const searchQueryLower = this.searchQuery.toLowerCase().trim();
    const selectedDepartmentLower = this.selectedDepartment.toLowerCase().trim();

    this.filteredEmployees = this.employees.filter((employee) => {
      const matchesSearch = employee.telephone
        .toLowerCase()
        .includes(searchQueryLower);
      const matchesDepartment = selectedDepartmentLower
        ? employee.departement.toLowerCase().includes(selectedDepartmentLower)
        : true;

      return matchesSearch && matchesDepartment;
    });
  }
}
