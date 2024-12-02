import { Component } from '@angular/core';
import { BubblesComponent } from './bubbles/bubbles.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [BubblesComponent],
})
export class AppComponent {}
