import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { interval, Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';


interface FileEntry {
  name: string;
  pdfUrl: string | null;
  loading: boolean;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
   animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class DetailsComponent implements OnInit, OnDestroy {
  pap: string;
  loading: boolean = true;
  private pollingSubscription: Subscription | null = null;
  selectedTab: number = 0;  // Track the selected tab index
  tabs: string[] = ["Queues", "UEMBD", "Databases", "Webservices", "Integration Servers", "Other Properties", "Files"];

  queues: any[] = [];
  uembdEntries: any = { uembd02t: [], uembd20t: [], uembd21t: [] };
  webservices: any[] = [];
  otherProperties: any[] = [];
  integrationServers: any[] = [];
  databases: any[] = [];
  operationsAndTables: any[] = [];
  files: FileEntry[] = [];

  expandedFileIndex: number | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.pap = this.route.snapshot.paramMap.get('pap');
    this.loadFileList();
    this.loadAllData();  // Load data initially
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  // Modify selectTab to load data only when a tab is selected
selectTab(index: number) {
  this.selectedTab = index;

  // Load data based on the selected tab, only if it hasn't been loaded before
  switch (index) {
    case 0:
      if (!this.queues.length) {
        this.loadQueues();
      }
      break;
    case 1:
      if (!this.uembdEntries.uembd02t.length && !this.uembdEntries.uembd20t.length && !this.uembdEntries.uembd21t.length) {
        this.loadUembdEntries();
      }
      break;
    case 2:
      if (!this.databases.length && !this.operationsAndTables.length) {
        this.loadDatabases();
      }
      break;
    case 3:
      if (!this.webservices.length) {
        this.loadWebservices();
      }
      break;
    case 4:
      if (!this.integrationServers.length) {
        this.loadIntegrationServers();
      }
      break;
    case 5:
      if (!this.otherProperties.length) {
        this.loadOtherProperties();
      }
      break;
    case 6:
      if (!this.files.length) {
        this.loadFileList();
      }
      break;
  }
}

  populateAndLoadData() {
    this.loading = true;

    this.http.get(`/api/populate_data`).subscribe({
      next: () => {
        this.pollingSubscription = interval(2000).subscribe(() => {
          this.checkPopulationStatus();
        });
      },
      error: (error) => {
        console.error('Error populating data:', error);
        this.loading = false;
      }
    });
  }

  checkPopulationStatus() {
    this.http.get<any>('/api/population_status').subscribe(status => {
      if (status.completed) {
        this.reloadData();
        this.stopPolling();
      }
    });
  }

  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  reloadData() {
    this.loadQueues();
    this.loadUembdEntries();
    this.loadWebservices();
    this.loadOtherProperties();
    this.loadIntegrationServers();
    this.loadDatabases();
    this.loading = false;
  }

  loadQueues() {
    this.http.get<any[]>(`/api/paps/${this.pap}/queues`).subscribe(data => {
      this.queues = data;
    }, error => {
      console.error('Error loading queues:', error);
    });
  }

  loadUembdEntries() {
    this.http.get<any>(`/api/paps/${this.pap}/uembd_entries`).subscribe(data => {
      this.uembdEntries = data;
    }, error => {
      console.error('Error loading UEMBD entries:', error);
    });
  }

  loadWebservices() {
    this.http.get<any[]>(`/api/paps/${this.pap}/webservices`).subscribe(data => {
      this.webservices = data;
    }, error => {
      console.error('Error loading webservices:', error);
    });
  }

  loadIntegrationServers() {
    this.http.get<any[]>(`/api/paps/${this.pap}/integration_servers`).subscribe(data => {
      this.integrationServers = data;
    }, error => {
      console.error('Error loading integration servers:', error);
    });
  }

  loadDatabases() {
    this.http.get<any>(`/api/paps/${this.pap}/databases`).subscribe(data => {
      this.databases = data.databases;
      this.operationsAndTables = data.operations_and_tables;
    }, error => {
      console.error('Error loading databases:', error);
    });
  }

  loadOtherProperties() {
    this.http.get<any[]>(`/api/paps/${this.pap}/other_properties`).subscribe(data => {
      this.otherProperties = data;
    }, error => {
      console.error('Error loading other properties:', error);
    });
  }

  loadFileList() {
    this.http.get<{ files: string[] }>(`/api/pap_files?pap_id=${this.pap}`).subscribe({
      next: (response) => {
        this.files = response.files.map((fileName) => ({
          name: fileName,
          pdfUrl: null,
          loading: false
        }));
      },
      error: (error) => {
        console.error('Error loading file list:', error);
      }
    });
  }

  toggleFileContent(index: number) {
    if (this.expandedFileIndex === index) {
      this.expandedFileIndex = null;
    } else {
      this.expandedFileIndex = index;

      if (!this.files[index].pdfUrl) {
        this.files[index].loading = true;

        this.http.get(`/api/file_pdf?file_name=${this.files[index].name}`, { responseType: 'blob' as 'json' })
          .subscribe({
            next: (response: Blob) => {
              const pdfUrl = URL.createObjectURL(response);
              this.files[index].pdfUrl = pdfUrl;
              this.files[index].loading = false;
            },
            error: (error) => {
              console.error('Error loading PDF file:', error);
              this.files[index].loading = false;
            }
          });
      }
    }
  }

  loadAllData() {
    this.loadQueues();
    this.loadUembdEntries();
    this.loadWebservices();
    this.loadOtherProperties();
    this.loadIntegrationServers();
    this.loadDatabases();
  }
}
