import { ValidationErrors, FormControl } from '@angular/forms';

export class UtilValidators{

  static notOnlyWhitespace(control: FormControl): ValidationErrors | null {
    
    if((control.value != null) && (control.value.trim().length === 0)){
      return { 'notOnlyWhitespace' :true};
    }else{
      return null;
    }
  }


}
