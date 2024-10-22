import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  animations: [
    trigger('expandCollapseAnimation', [
      state('void', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      state('*', style({ height: '*', opacity: 1 })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class DetailsComponent implements OnInit {
  pap: string;
  queues: any[] = [];
  uembdEntries: any = { uembd02t: [], uembd20t: [], uembd21t: [] };  // Store UEMBD entries
  expandedQueues: boolean[] = [];  // Track expanded/collapsed state of individual queues
  expandedQueuesSection: boolean = false;  // Track the expanded/collapsed state of the entire Queues section
  expandedUembdSection: boolean = false;  // Track the expanded/collapsed state of the UEMBD section

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.pap = this.route.snapshot.paramMap.get('pap');
    this.loadQueues();
    this.loadUembdEntries();  // Load UEMBD entries
  }

  // Method to load queues
  loadQueues() {
    this.http.get<any[]>(`/api/paps/${this.pap}/queues`).subscribe(data => {
      this.queues = data;
      this.expandedQueues = new Array(this.queues.length).fill(false);  // Initialize collapsed state for each queue
    }, error => {
      console.error('Error loading queues:', error);
    });
  }

  // Method to load UEMBD entries (02T, 20T, 21T)
  loadUembdEntries() {
    this.http.get<any>(`/api/paps/${this.pap}/uembd_entries`).subscribe(data => {
      this.uembdEntries = data;
    }, error => {
      console.error('Error loading UEMBD entries:', error);
    });
  }

  // Toggle for the individual queues
  toggleQueue(index: number) {
    this.expandedQueues[index] = !this.expandedQueues[index];  // Toggle the state of the clicked queue
  }

  // Toggle for the entire queues section
  toggleQueues() {
    this.expandedQueuesSection = !this.expandedQueuesSection;  // Toggle the state of the entire queues section
  }

  // Toggle for the UEMBD entries section
  toggleUembdSection() {
    this.expandedUembdSection = !this.expandedUembdSection;  // Toggle the state of the UEMBD section
  }

  // Helper method to get the keys of an object (for dynamic column names)
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}