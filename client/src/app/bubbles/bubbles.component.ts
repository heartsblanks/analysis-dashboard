import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { trigger, style, animate, transition, keyframes } from '@angular/animations';

@Component({
  selector: 'app-bubbles',
  templateUrl: './bubbles.component.html',
  styleUrls: ['./bubbles.component.scss'],
  animations: [
    trigger('bubbleAnimation', [
      transition(':leave', [
        animate(
          '1s ease-out',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.5)', offset: 0.5 }),
            style({ transform: 'scale(0)', offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class BubblesComponent implements OnInit {
  paps: string[] = [];
  filteredPaps: string[] = [];
  filterText: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPaps();
  }

  fetchPaps(): void {
    this.http.get<string[]>('http://localhost:5000/api/paps').subscribe(
      (data: string[]) => {
        this.paps = data;
        this.filteredPaps = data;
      },
      (error) => {
        console.error('Error fetching PAPs', error);
      }
    );
  }

  onFilterChange(): void {
    this.filteredPaps = this.paps.filter((pap) =>
      pap.toLowerCase().startsWith(this.filterText.toLowerCase())
    );
  }

  trackByPap(index: number, pap: string): string {
    return pap;
  }
}
