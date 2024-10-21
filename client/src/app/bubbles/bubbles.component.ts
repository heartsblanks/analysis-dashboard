import { Component } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-bubbles',
  templateUrl: './bubbles.component.html',
  styleUrls: ['./bubbles.component.scss'],
  animations: [
    trigger('bubbleAnimation', [
      transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate('500ms', style({ transform: 'scale(0)', opacity: 0 }))
      ])
    ])
  ]
})
export class BubblesComponent {
  paps: string[] = ['PAP1', 'PAP2', 'PAP3', 'PAP4'];  // Initial set of PAPs (could come from API)
  filteredPaps: string[] = this.paps;  // The filtered list of PAPs
  filterText = '';  // The text input by the user

  filterPaps() {
    // Filter based on user input
    this.filteredPaps = this.paps.filter(pap => 
      pap.toLowerCase().startsWith(this.filterText.toLowerCase()));
  }
}
