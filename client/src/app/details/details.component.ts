import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  pap: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get the PAP name from the route parameters
    this.pap = this.route.snapshot.paramMap.get('pap');
  }
}