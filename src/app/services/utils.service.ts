import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from '../../environments/environment';

interface GetResponseCountries{
  _embedded:{
    countries : Country[];
  }
}

interface GetResponseStates{
  _embedded:{
    states : State[];
  }
}


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private countriesUrl = environment.apiUrl + '/countries';
  private statesUrl = environment.apiUrl + '/states';

  constructor(private httpClient: HttpClient) { }

  getCreditCardMonths(startMonth:number):Observable<number[]>{
    let data : number[] = [];

    for(let theMonth = startMonth; theMonth <=12; theMonth++){
      data.push(theMonth);
    }

    return of(data);
  }

  getCreditCardYears():Observable<number[]>{
    let data : number[] = [];

    const startYear: number = new Date().getFullYear();
    const endYear:number = startYear +10;

    for(let theYear = startYear; theYear <= endYear; theYear++){
      data.push(theYear);
    }
    
    return of(data);
  }

  getCountries():Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl)
      .pipe(
        map(response => response._embedded.countries)
      );
  }

  getStates(theCountryCode:string):Observable<State[]>{
    const searchStateUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<GetResponseStates>(searchStateUrl)
      .pipe(
        map(response => response._embedded.states)
      );
  }





}
