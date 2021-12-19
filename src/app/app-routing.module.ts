import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OktaAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { MembersPageComponent } from './components/members-page/members-page.component';
import { LoginComponent } from './components/login/login.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

const routes :Routes = [
  {path: 'order-history', component: OrderHistoryComponent, canActivate: [OktaAuthGuard]},
  {path: 'members', component: MembersPageComponent, canActivate: [OktaAuthGuard]},
  {path: 'login/callback', component: OktaCallbackComponent},
  {path: 'login', component: LoginComponent},
  {path:'checkout', component: CheckoutComponent},
  {path:'category/:id', component: ProductListComponent},
  {path:'category', component: ProductListComponent},
  {path:'cart-details', component: CartDetailsComponent},
  {path:'products', component: ProductListComponent},
  {path:'products/:id', component: ProductDetailComponent},
  {path: 'search/:keyword', component: ProductListComponent},
  {path:'', redirectTo: '/products', pathMatch: 'full'},
  {path:'**', redirectTo: '/products', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,{
      useHash: false
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
