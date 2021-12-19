import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilsService } from '../../services/utils.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { UtilValidators } from '../../validators/util-validators';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;
  totalPrice : number = 0;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries : Country[]= [];

  shippingAddressStates : State[]= []; 
  billingAddressStates : State[]= []; 

  storage: Storage =  sessionStorage;

  constructor(private fb:FormBuilder,
              private utilsService:UtilsService,
              private cartService: CartService,
              private checkoutService:CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    const theEmail = JSON.parse(this.storage.getItem('userEmail')|| '{}');

    this.checkoutFormGroup = this.fb.group({
      customer : this.fb.group({
        firstName:new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace]),
        lastName: new FormControl('',[Validators.required, Validators.minLength(2)]),
        email: new FormControl(theEmail,[Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress : this.fb.group({
        country: new FormControl('',[Validators.required]),
        street: new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace]),
        state: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace])
      }),
      billingAddress : this.fb.group({
        country: new FormControl('',[Validators.required]),
        street: new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace]),
        state: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace])
      }),
      creditCard : this.fb.group({
        cardType:new FormControl('',[Validators.required]),
        nameOnCard: new FormControl('',[Validators.required, Validators.minLength(2), UtilValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('',[Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationYear: [''],
        expirationMonth:['']
      })
    });

    //poblar el arrglo de meses
    const startMonth: number = new Date().getMonth() +1;

    this.utilsService.getCreditCardMonths(startMonth)
      .subscribe(data =>{
        this.creditCardMonths = data;
        console.log("Months: "+ JSON.stringify(data));
      });

    this.utilsService.getCreditCardYears()
      .subscribe(data =>{
        this.creditCardYears = data;
        console.log("Years: "+ JSON.stringify(data));
      });

    this.utilsService.getCountries()
      .subscribe(data => {
        console.log("The countries: "+ JSON.stringify(data));
        this.countries = data;
      }
     );
  }
  
  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country');}
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode');}

  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country')}
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state')}
  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street')}
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city')}
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode')}

  get creditCardCardType(){return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardCardNumber(){return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode');}

  onSubmit() {
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();
    
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    
    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;
  
    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          // reset cart
          this.resetCartForm();

        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    );

  }

  onSubmit2(){
    console.log("handling");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    //asignamos el valor y la cantidad de la orden
    let order = new Order();
    order.totalPrice= this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //obtenemos los items del carro
    const cartItems = this.cartService.cartItems;

    //creamos los orderItems desde los cartItems
    //manera larga
    /* let orderItems: OrderItem[]=[];
    for(let i=0;i<cartItems.length;i++){
      orderItems[i]= new OrderItem(cartItems[i]);
    } */
    //manera corta
    let orderItems:OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    //asignamos el purchase
    let purchase = new Purchase();

    //poblar el customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
  
    //poblamos purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //poblamos purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    //poblamos con la orden y los orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //usamos el service checkoutservice

    this.checkoutService.placeOrder(purchase)
      .subscribe({
        next:response =>{
          console.log('placeorder');
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
          //resetear el carro
          this.resetCartForm();

        },
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
    });

  }

  resetCartForm() {
    //reset de cart
    this.cartService.totalQuantity.next(0);
    this.cartService.totalPrice.next(0);
    this.cartService.cartItems = [];

    //reset form
    this.checkoutFormGroup.reset();

    //redirect products
    this.router.navigateByUrl('/products')
  }

  //suscribe los valores de total cantidad y total precio
  reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  copyShippingAdressToBillingAdress(event: { target: { checked: any; }; }){
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      
      //posible bug
      this.billingAddressStates = this.shippingAddressStates;
    }else{
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //posible bug
      this.billingAddressStates = [];
    }
  }

  handledMonthsAndYears(){
     const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

     const currentYear :  number = new Date().getFullYear();
     const selectedYear : number = Number(creditCardFormGroup?.value.expirationYear);

     //si el año actual es igual al año seleccionado entonces comienza con le mes actual
     let startMonth : number;

     if(currentYear === selectedYear){
      startMonth = new Date().getMonth() +1;
     }else{
       startMonth = 1;
     }

     this.utilsService.getCreditCardMonths(startMonth)
      .subscribe(data => {
        console.log("months: " + JSON.stringify(data))
        this.creditCardMonths = data;
      })
  }

  getStates(formGroupName: string){
    const formGroup =  this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.utilsService.getStates(countryCode)
      .subscribe(data => {
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }else if(formGroupName === 'billingAddress'){
          this.billingAddressStates = data;
        }
        formGroup!.get('state')!.setValue(data[0]);
      });
  }





}
