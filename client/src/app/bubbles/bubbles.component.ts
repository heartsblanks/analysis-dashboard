import { Component, OnInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';  // Import Router for navigation
import * as d3 from 'd3';

@Component({
  selector: 'app-bubbles',
  templateUrl: './bubbles.component.html',
  styleUrls: ['./bubbles.component.scss']
})
export class BubblesComponent implements OnInit {
  paps: any[] = [];  // Store PAP data
  filteredPaps: any[] = [];
  svg: any;
  width: number;
  height: number;
  radiusScale: any;
  simulation: any;
  bubbles: any;

  constructor(private router: Router, private http: HttpClient, private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.svg = d3.select(this.elRef.nativeElement.querySelector("#bubble-chart"))
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    // Load PAPs from API
    this.loadPaps();
  }

  loadPaps() {
    this.http.get<any[]>('/api/paps').subscribe(data => {
      if (data && data.length > 0) {
        this.paps = data.map((d, i) => ({ A: d, count: i + 1 }));  // Simulating count with index for now
        this.filteredPaps = [...this.paps];  // Initialize filtered PAPs
        this.createBubbleChart(this.filteredPaps);
      }
    }, error => {
      console.error('Error loading PAPs:', error);
    });
  }

  createBubbleChart(data: any[]) {
    this.radiusScale = d3.scaleSqrt()
      .domain([1, d3.max(data, d => d.count)])
      .range([20, 60]);

    // Define gradient for bubbles
    const defs = this.svg.append("defs");
    const gradient = defs.append("radialGradient")
      .attr("id", "bubbleGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffffff")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#1f77b4")
      .attr("stop-opacity", 1);

    this.simulation = d3.forceSimulation(data)
      .force("charge", d3.forceManyBody().strength(-15))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("collision", d3.forceCollide().radius(d => this.radiusScale(d.count) + 5).strength(1))
      .on("tick", () => this.ticked());

    this.bubbles = this.svg.selectAll(".bubble")
      .data(data)
      .enter().append("g")
      .attr("class", "bubble");

    this.bubbles.append("circle")
      .attr("r", d => this.radiusScale(d.count))
      .attr("fill", "url(#bubbleGradient)");

    this.bubbles.append("text")
      .attr("class", "bubble-text")
      .attr("dy", ".3em")
      .text(d => d.A);

    this.bubbles.on("click", (event, d) => this.onBubbleClick(d));
  }

  ticked() {
    this.bubbles.attr("transform", d => {
      d.x = Math.max(this.radiusScale(d.count), Math.min(this.width - this.radiusScale(d.count), d.x));
      d.y = Math.max(this.radiusScale(d.count), Math.min(this.height - this.radiusScale(d.count), d.y));
      return `translate(${d.x},${d.y})`;
    });
  }

  onBubbleClick(d) {
    console.log('Bubble clicked:', d.A);
    this.router.navigate(['/details', d.A]);  // Navigate to details page with the clicked PAP
  }

  onFilterChange(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredPaps = this.paps.filter(pap => pap.A.toLowerCase().includes(searchTerm));
    this.updateBubbles(this.filteredPaps);
  }

  updateBubbles(filteredData: any[]) {
    this.svg.selectAll(".bubble").remove();

    this.simulation.nodes(filteredData)
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .alpha(1).restart();

    this.bubbles = this.svg.selectAll(".bubble")
      .data(filteredData)
      .enter().append("g")
      .attr("class", "bubble");

    this.bubbles.append("circle")
      .attr("r", d => this.radiusScale(d.count))
      .attr("fill", "url(#bubbleGradient)");

    this.bubbles.append("text")
      .attr("class", "bubble-text")
      .attr("dy", ".3em")
      .text(d => d.A);

    this.bubbles.on("click", (event, d) => this.onBubbleClick(d));
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.svg.attr("width", this.width).attr("height", this.height);

    this.simulation.force("center", d3.forceCenter(this.width / 2, this.height / 2)).alpha(0.5).restart();
  }
}