import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BubblesComponent } from './bubbles/bubbles.component';
import { DetailsComponent } from './details/details.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterModule.forRoot([
      { path: '', component: BubblesComponent },
      { path: 'details', component: DetailsComponent },
    ]),
  ],
})
export class AppComponent {}
