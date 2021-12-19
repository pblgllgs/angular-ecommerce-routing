import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cartItem';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems : CartItem[] = [];
  //BehaviorSubject tiene un buffer del ultimo evento, una vez subscrito el subscriptor recibe el ultimo evento previo a la suscripcion
  totalPrice : Subject<number> =  new BehaviorSubject<number>(0);
  totalQuantity : Subject<number> =  new BehaviorSubject<number>(0);

  storage: Storage = localStorage;

  constructor() {

    //leer la data desde el storage
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if(data != null){
      this.cartItems = data;

      //calcular el total
      this.computeCartTotals();
    }
   }

  addToCart(theCartItem :CartItem){

    //revisamos si el item esta en el carro
    let alreadyExistInCart : boolean =  false;
    let existingCartItem: CartItem = undefined!;

    if(this.cartItems.length > 0){
      for(let tempCartItem of this.cartItems){
        if(tempCartItem.id === theCartItem.id){
          existingCartItem = tempCartItem;
          break;
        }
      }
      alreadyExistInCart = (existingCartItem != undefined);
    }

    //buscar el item basado en la id
    if(alreadyExistInCart ){
      //aumentar la cantidad
      existingCartItem.quantity ++;
    }else{
      this.cartItems.push(theCartItem);
    }

    //calcular el total
    this.computeCartTotals();
  }

  remove(theCartItem :CartItem){
    //obtenemos el index del item en el arreglo
    const itemIndex = this.cartItems.findIndex(tempCartITem => tempCartITem.id == theCartItem.id);
    if(itemIndex >-1){
      //utilizamos el index para eliminar el item del arreglo de items
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }
  }

  computeCartTotals(){
    let totalPriceValue : number = 0;
    let totalQuantityValue : number = 0;
    //recorremos y calculamos los subtotales
    for(let currentCartItem of  this.cartItems){
      totalPriceValue += currentCartItem.quantity*currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    //publica los nuevos valores, y las suscripciones reciben los valores actualizandolos
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //debug
    this.logCartData(totalQuantityValue, totalPriceValue);

    //guarda los item del carro en la sessionStorage  

    this.persistCartItems();

  }
  
  removeToCart(theCartItem: CartItem){
    theCartItem.quantity--;
    
    if(theCartItem.quantity === 0){
      this.remove(theCartItem);
    }else{
      this.computeCartTotals();
    }
  }


  persistCartItems(){
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  
  logCartData(totalQuantityValue: number, totalPriceValue: number) {
    console.log('Contenido del carro');
    for(let tempCartItem of this.cartItems){
        const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
        console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice: ${tempCartItem.unitPrice}, subTotal: ${subTotalPrice}`)
    }
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----');
  }

}
