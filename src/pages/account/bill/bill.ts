import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Loan} from '../../../app/app.models';
import {Page} from '../../page';

@Component({
  selector: 'page-account-bill',
  templateUrl: 'bill.html'
})
export class AccountBillPage extends Page {
  loanAmount = 1000;
  loanPeriod = 14;
  loan: Loan;

  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      return;
    }

    // this.api.getLoan().then(loan => this.loan = loan);
    this.api.getLastLoan().then((loan) => {
      this.loan = loan;
    });
  }


}
