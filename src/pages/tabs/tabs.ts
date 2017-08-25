import {Component, ViewChild} from '@angular/core';
import {LoanLoanPage} from '../loan/loan/loan';
import {AuthAuthPage} from '../auth/auth/auth';
import {AccountAccountPage} from '../account/account/account';
import {Loan, User} from '../../app/app.models';
import {Page} from '../page';
import {NavParams, NavController, ViewController} from 'ionic-angular';

//  import {Keyboard } from '@ionic-native/keyboard';
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage extends Page {
  tab1Root = LoanLoanPage;
  tab2Root = AuthAuthPage;
  tab3Root = AccountAccountPage;
  taTitles = "借款";

  loan: Loan;
  user: User;

  //订阅事件
  // protected registerEvents = [
  //   'user:repayment'
  // ];

  ionViewWillEnter() {
    //  Keyboard.onKeyboardShow().subscribe(()=>{this.valueforngif=false})
    //  Keyboard.onKeyboardHide().subscribe(()=>{this.valueforngif=true})
  }

  //分发事件
  handleEvents(name: string, ...arg): void {
    if (name === 'user:repayment') {
      this.taTitles = '还款';
    } else if (name === 'user:payment') {
      this.taTitles = '借款';
    }
  }

}
