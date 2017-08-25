import { Component } from '@angular/core';
import { NavController ,AlertController} from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

import { FormPage } from '../../form-page';
import { Loan, User, Payment,BankCardProfile } from '../../../app/app.models';
import {Backs as BacksStorageConfigId} from '../../../common/storage-config';

@Component({
  selector: 'page-loan-pay',
  templateUrl: 'pay.html'
})
export class LoanPayPage extends FormPage {
  loan: Loan;
  user: User;
   banks = [];
   backCardProfile: BankCardProfile;
  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      return ;
    }

    this.user = this.api.datastore.user;
    this.backCardProfile = this.api.datastore.user.bankCardProfile;
    this.api.getLoan().then(loan => this.loan = loan);
    this.api.getStorageConfig(BacksStorageConfigId)
    .then((res) => {
      if (res) {
        if (res && res.settings && res.settings.allowed_values) {
          this.banks = res.settings.allowed_values;
        }
      }
    });
  }

  buildForm(): FormGroup {
    return this.ui.fb.group({});
  }

  saveForm(): Observable<any> {
    let payment: Payment = this.api.datastore.createRecord(Payment, {
      title: 'BJHK' + moment().format("YYYYMMDDhmmss") + this.api.datastore.user.name,
      field_payment_gateway: 'cash',
      field_repayment_fee: this.loan.field_amount + this.loan.field_overdue_fee,
    });

    payment.field_related_order = this.loan;

    return Observable.create(ob => {
      this.api.createPayment(payment).then(payment => ob.next()).catch(err => ob.error(err));
    });
  }
   onSaveSuccess(response) {
      var target=document.getElementById("model");
      target.style.display="block";
      setTimeout(()=>{
          target.style.display="none";
            this.navCtrl.parent.select(0);
      },3000)
  }

  onSaveError(error) {

  }
}
