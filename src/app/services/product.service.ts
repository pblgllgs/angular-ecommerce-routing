import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { environment } from '../../environments/environment';

interface GetResponseProducts{
  _embedded:{
    products : Product[];
  },
  page :{
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategory{
  _embedded:{
    productCategory : ProductCategory[];
  }
}


@Injectable({
  providedIn: 'root'
})

export class ProductService {
  
  private baseUrl:string = environment.apiUrl + '/products';

  private categoryUrl:string = environment.apiUrl + '/product-category';

  constructor(private http:HttpClient ) { }

  getProductsListPaginate(  thePage:number,
                            thePageSize:number,
                            theCategoryId:number):Observable<GetResponseProducts>{

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;
    return this.http.get<GetResponseProducts>(searchUrl);
  }

  getProductsList(theCategoryId:number):Observable<Product[]>{

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts(searchUrl);
  }

  searchProducts(theKeyword:string):Observable<Product[]>{

    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts(searchUrl);
  }

  searchProductsPaginate(   thePage:number,
                            thePageSize:number,
                            theKeyword:string):Observable<GetResponseProducts>{

    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}&page=${thePage}&size=${thePageSize}`;

    return this.http.get<GetResponseProducts>(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.http.get<GetResponseProducts>(searchUrl)
      .pipe(
        map(response => response._embedded.products)
      );
  }

  getProductCategories():Observable<ProductCategory[]>{

    return this.http.get<GetResponseProductCategory>(this.categoryUrl)
      .pipe(
          map( response => response._embedded.productCategory)
      );
  }

  getProduct(theProductId:number):Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.http.get<Product>(productUrl);
  }

}
