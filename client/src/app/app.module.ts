import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';  // Import RouterModule and Routes

import { AppComponent } from './app.component';
import { BubblesComponent } from './bubbles/bubbles.component';
import { DetailsComponent } from './details/details.component';  // Import the new DetailsComponent

// Define routes
const routes: Routes = [
  { path: '', component: BubblesComponent },  // Route to display bubbles
  { path: 'details/:pap', component: DetailsComponent }  // Route to display details
];

@NgModule({
  declarations: [
    AppComponent,
    BubblesComponent,
    DetailsComponent  // Declare DetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)  // Configure RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }