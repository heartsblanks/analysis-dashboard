import { RouterModule, Routes } from '@angular/router';
import { DetailsComponent } from './details/details.component';  // <-- Import the new component

const routes: Routes = [
  { path: '', component: BubblesComponent },  // Home page with bubbles
  { path: 'details/:pap', component: DetailsComponent }  // New details page for clicked PAP
];

@NgModule({
  declarations: [AppComponent, BubblesComponent, DetailsComponent],  // <-- Add DetailsComponent
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(routes)  // <-- Add RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}