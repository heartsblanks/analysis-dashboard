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
  expandedQueues: boolean[] = [];  // Track expanded/collapsed state of individual queues
  expandedQueuesSection: boolean = false;  // Track the expanded/collapsed state of the entire Queues section

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.pap = this.route.snapshot.paramMap.get('pap');
    this.loadQueues();
  }

  loadQueues() {
    this.http.get<any[]>(`/api/paps/${this.pap}/queues`).subscribe(data => {
      this.queues = data;
      this.expandedQueues = new Array(this.queues.length).fill(false);  // Initialize collapsed state for each queue
    }, error => {
      console.error('Error loading queues:', error);
    });
  }

  toggleQueue(index: number) {
    this.expandedQueues[index] = !this.expandedQueues[index];  // Toggle the state of the clicked queue
  }

  toggleQueues() {
    this.expandedQueuesSection = !this.expandedQueuesSection;  // Toggle the state of the entire queues section
  }
}