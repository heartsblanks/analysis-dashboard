import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
export class BubblesComponent implements OnInit {
  paps: string[] = [];
  filteredPaps: string[] = [];
  filterText = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getPaps();
  }

  getPaps() {
    this.http.get<string[]>('http://localhost:5000/api/paps')
      .subscribe((data: string[]) => {
        this.paps = data;
        this.filteredPaps = data;
      });
  }

  filterPaps() {
    this.filteredPaps = this.paps.filter(pap => 
      pap.toLowerCase().startsWith(this.filterText.toLowerCase()));
  }
}
