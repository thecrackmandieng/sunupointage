import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importer le Router pour la navigation
import { CommonModule } from '@angular/common'; // Importer CommonModule pour les directives Angular

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  isUsersDropdownOpen = false;

  constructor(private router: Router) {} // Injecter le Router

  toggleUsersDropdown(): void {
    this.isUsersDropdownOpen = !this.isUsersDropdownOpen;
  }

  logout() {
    // Supprimer le token d'authentification
    localStorage.removeItem('token');

    // Rediriger vers la page de connexion
    this.router.navigate(['/login']).then(() => {
      // Optionnel : Rafraîchir la page après la redirection
      window.location.reload();
    });
  }
}