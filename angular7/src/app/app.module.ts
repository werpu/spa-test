import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {EmptyRouteComponent} from "./empty-route/empty-route.component";
import {APP_BASE_HREF} from '@angular/common';
import { CustomersModule } from './customers/customers.module';

@NgModule({
  declarations: [
    AppComponent, EmptyRouteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CustomersModule
  ],
  providers: [{provide: APP_BASE_HREF, useValue : '/app4' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
