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

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    // Get the PAP name from the route parameters
    this.pap = this.route.snapshot.paramMap.get('pap');
    this.loadQueues();
  }

  loadQueues() {
    this.http.get<any[]>(`/api/paps/${this.pap}/queues`).subscribe(data => {
      this.queues = data;
    }, error => {
      console.error('Error loading queues:', error);
    });
  }
}