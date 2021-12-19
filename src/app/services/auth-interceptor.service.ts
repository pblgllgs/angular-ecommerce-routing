import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, lastValueFrom, Observable } from 'rxjs';
import { OktaAuthService } from '@okta/okta-angular';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private oktaAuth:OktaAuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    //agregar un acceso con token

    const endPoint = environment.apiUrl + '/orders';
    const secureEndPoints = [endPoint];
    if(secureEndPoints.some(url => request.urlWithParams.includes(url))){
      const accessToken = await this.oktaAuth.getAccessToken();

      //clona la respuesta y agrega al header el token
      request = request.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken
        }
      });
    }
    return lastValueFrom(next.handle(request));
  }
}
