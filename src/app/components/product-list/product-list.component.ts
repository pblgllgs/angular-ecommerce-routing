import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cartItem';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  public products : Product[] = [];
  public currentCategoryId: number  = 1;
  public previousCategoryId: number  = 1;
  public searchMode: boolean= false;

  //new properties for pagination

  public thePageNumber: number =1;
  public thePageSize : number = 5;
  public theTotalElements: number = 0;

  previousKeyword : string = '';

  constructor(
    private productService:ProductService,
    private route: ActivatedRoute,
    private cartService:CartService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts(){
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode){
      this.handleSearchProducts();
    }else{
      this.handleListProducts();
    }
  }

  handleSearchProducts() {
    const theKeyword :string = this.route.snapshot.paramMap.get('keyword')!;

    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    this.productService.searchProductsPaginate( this.thePageNumber -1,
                                                this.thePageSize,
                                                theKeyword)
        .subscribe(this.processResult());
  }

  handleListProducts(){

    const hasCategoryId: boolean =  this.route.snapshot.paramMap.has('id');

    if(hasCategoryId){
      //obtiene id por url que es un string y lo tranforma con '+' a un number para asignarlo a currentCategory
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    }else{
      this.currentCategoryId =1;
    }

    //si cambia la categoría se reinicia y vuelve a la pagina 1 de la paginación
    if(this.previousCategoryId != this.currentCategoryId){
      this.thePageNumber =1;
    }

    this.previousCategoryId = this.currentCategoryId;

    this.productService.getProductsListPaginate(this.thePageNumber -1, this.thePageSize, this.currentCategoryId)
      .subscribe(this.processResult());
  }

  processResult(){
    return (data: { _embedded:{ 
      products: Product[]; 
    }; 
      page: {
        number: number; 
        size: number; 
        totalElements: number; 
      }; 
    }) =>{

      this.products = data._embedded.products;
      this.thePageNumber = data.page.number +1;
      this.thePageSize = data.page.size;
      this.theTotalElements =  data.page.totalElements;
    }
  }

  updatePageSize(pageSize:number){
    this.thePageSize = pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct:Product){
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);


    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);


  }

}
