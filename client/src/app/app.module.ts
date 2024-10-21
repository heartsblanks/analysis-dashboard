import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

import { AppComponent } from './app.component';
import { BubblesComponent } from './bubbles/bubbles.component';

@NgModule({
  declarations: [AppComponent, BubblesComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule  // <-- Add FormsModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
