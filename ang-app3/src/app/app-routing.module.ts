import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { EmptyRouteComponent } from './empty-route/empty-route.component';

const routes: Routes = [

  { path: 'app4/customers', loadChildren: () => import('./customers/customers.module').then(m => m.CustomersModule) },
  { path: '**', component: EmptyRouteComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
  ]
})
export class AppRoutingModule { }
