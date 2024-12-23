import { bootstrapApplication } from '@angular/platform-browser'; // Pour applications standalone
import { provideHttpClient, withFetch } from '@angular/common/http'; // Pour configurer HttpClient avec fetch
import { AppComponent } from './app/app.component'; // Vérifiez le chemin

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withFetch()), // Configuration correcte pour HttpClient
  ],
}).catch(err => console.error(err));
