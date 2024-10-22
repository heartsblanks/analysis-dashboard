import { ActivatedRoute } from '@angular/router';

export class DetailsComponent implements OnInit {
  pap: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get the PAP name from the route parameters
    this.pap = this.route.snapshot.paramMap.get('pap');
  }
}