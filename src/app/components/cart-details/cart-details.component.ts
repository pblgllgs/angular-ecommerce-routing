import { Component, OnInit } from '@angular/core';
import { CartItem } from '../../common/cartItem';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  public cartItems :CartItem[] = [];
  public totalPrice : number = 0;
  public totalQuantity : number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }


  listCartDetails() {
    //manejamos los articulos del carro
    this.cartItems = this.cartService.cartItems;
    
    //subscribe a los cambios en el precio
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );
    //subscribe a los cambios en la cantidad
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
    //calcular y actualizar el valor total precio y cantidad
    this.cartService.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem){
    this.cartService.addToCart(theCartItem);
  }
  
  decrementQuantity(theCartItem : CartItem){
    this.cartService.removeToCart(theCartItem);
  }

  removeAll(theCartItem: CartItem){
    this.cartService.remove(theCartItem);
  }

}
