import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { EmptyRouteComponent } from './empty-route/empty-route.component';
import {Routes} from "@angular/router";
import { SecondComponent } from './second/second.component';


@NgModule({
  declarations: [
    AppComponent, EmptyRouteComponent, SecondComponent
  ],
  imports: [

    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  exports: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
