import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  pap: string;
  queues: any[] = [];
  expandedQueues: boolean[] = [];  // <-- To track expanded/collapsed state

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
}