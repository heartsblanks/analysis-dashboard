import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppComponent)
  .catch((err) => console.error(err));
