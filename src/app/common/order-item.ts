import { CartItem } from './cartItem';
export class OrderItem {

    imageUrl: string;
    unitPrice: number;
    quantity: number;
    productId: string;

    constructor(cartItem:CartItem){
        this.imageUrl = cartItem.imageUrl;
        this.quantity = cartItem.quantity;
        this.unitPrice = cartItem.unitPrice;
        this.productId = cartItem.id;
    }
}
