import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  template: `
    <div class="filter">
      <input [(ngModel)]="filterText" (input)="filterPaps()" placeholder="Start typing PAP name..." />
    </div>
    <div class="bubble-container">
      <pap-bubble *ngFor="let pap of filteredPaps" [pap]="pap"></pap-bubble>
    </div>
  `,
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('bubbleDisappear', [
      transition(':leave', [
        animate('0.5s', style({ opacity: 0, transform: 'scale(0)' }))
      ])
    ])
  ]
})
export class AppComponent {
  paps: string[] = [];
  filteredPaps: string[] = [];
  filterText = '';

  constructor(private http: HttpClient) {
    this.loadPaps();
  }

  loadPaps() {
    this.http.get<string[]>('/api/paps').subscribe(paps => {
      this.paps = paps;
      this.filteredPaps = paps;
    });
  }

  filterPaps() {
    this.http.get<string[]>(`/api/paps?filter=${this.filterText}`).subscribe(filtered => {
      this.filteredPaps = filtered;
    });
  }
}
