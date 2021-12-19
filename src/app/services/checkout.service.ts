import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl: string = environment.apiUrl + '/checkout/purchase';

  constructor(private http:HttpClient) { }

  placeOrder(purchase: Purchase):Observable<any>{
    return this.http.post<Purchase>(this.purchaseUrl, purchase);
  }


}
