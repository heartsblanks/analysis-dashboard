import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-bubbles',
  templateUrl: './bubbles.component.html',
  styleUrls: ['./bubbles.component.scss'],
  animations: [
    trigger('bubbleAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'scale(0)', opacity: 0 }))
      ])
    ])
  ]
})
export class BubblesComponent implements OnInit {
  paps: string[] = [];
  filteredPaps: string[] = [];
  filterText = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPaps();
  }

  // Load PAPs from the API
  loadPaps() {
    this.http.get<string[]>('http://localhost:5000/api/paps').subscribe(
      (data) => {
        this.paps = data;
        this.filteredPaps = [...this.paps]; // Initialize filteredPaps with all PAPs
      },
      (error) => {
        console.error('Error loading PAPs:', error);
      }
    );
  }

  // Filter PAPs based on user input
  onFilterChange() {
    this.filteredPaps = this.paps.filter((pap) =>
      pap.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  // Track function to improve performance in ngFor
  trackByPap(index: number, pap: string): string {
    return pap;
  }
}
