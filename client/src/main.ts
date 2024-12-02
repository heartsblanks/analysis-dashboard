import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { BubblesComponent } from './app/bubbles/bubbles.component';
import { DetailsComponent } from './app/details/details.component';

if (environment.production) {
  enableProdMode();
}

const routes = [
  { path: '', component: BubblesComponent },
  { path: 'details', component: DetailsComponent },
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)],
}).catch((err) => console.error(err));
