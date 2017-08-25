import {Component} from '@angular/core';

import {Page} from '../../page';
import {LoanHelpPage} from '../help/help';
import {LoanConfirmPage} from '../confirm/confirm';
import {LoanPayPage} from '../pay/pay';
import {AccountLoginPage} from '../../account/login/login';

import {Loan, User} from '../../../app/app.models';
import {AuthPersonalPage} from "../../auth/personal/personal";
import {AuthMobilePage} from "../../auth/mobile/mobile";

import {AuthCreditPage} from "../../auth/credit/credit";
import {AuthCardPage} from "../../auth/card/card";

@Component({
  selector: 'page-loan-loan',
  templateUrl: 'loan.html'
})
export class LoanLoanPage extends Page {
  loginPage = AccountLoginPage;
  confirmPage = LoanConfirmPage;
  helpPage = LoanHelpPage;
  payPage = LoanPayPage;
  personalAuthPage = AuthPersonalPage;
  mobileAuthPage = AuthMobilePage;
  creditAuthPage = AuthCreditPage;
  bankAuthPage = AuthCardPage;
  loanAmount = 1000;
  loanPeriod = 14;
  loan: Loan;
  user: User;
  logging = true;
  loanNumResponse: null;

  ionViewWillEnter() {
    // console.log( moment().format("YYYYMMDDhmmss"));
    if (!this.api.isUserLoggedIn()) {
      this.loan = null;
      this.user = null;
      // return;
    } else {
      this.user = this.api.datastore.user;
      this.refreshLoan();
    }
    // this.api.refreshAuthStatus().then(() => {
    //   this.user = this.api.datastore.user;
    // });
    //
    // this.api.getUserProfile().then((user) => {
    //   this.user = user;
    //   this.api.datastore.user = user;
    // });

    // if(this.logging  == true){
    //     this.user = this.api.datastore.user;
    //     this.refreshLoan();
    // }

  }

  refreshLoan() {
    this.api.getLoan().then((resp) => {
      this.loan = resp;
      if (this.loan) {
        //
        //null|waiting disable button ,fail notice:上一笔还款失败请及时还款,success:
        if (this.loan.payment) {
          // this.loan.payment.field_payment_status=null;
          if (this.loan.payment.isFail() || this.loan.payment.isWaiting()) {
            this.events.publish('user:repayment');
          } else {
            this.events.publish('user:payment');
          }
          if (this.loan.payment.isFail()) {
            this.ui.showAlert('扣款失败,请及时还款');
          }
        }
      }
    });

  }

  handleEvents(name, ...args) {
    if (name === 'user:logged:in') {
      this.api.refreshAuthStatus().then(() => {
        this.user = this.datastore.user;
      });
      this.refreshLoan();
    }
  }

  submitLoanForm(val) {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
      return;
    }

    if (!this.user.isOldUser() || !this.user.isWhiteUser()) {
      this.ui.titleAlert('您的资质暂时不符合借款条件，感谢您一如既往的支持。');
      return;
    }

    if (this.loan && this.loan.isAuditFail()) {
      this.ui.titleAlert('您的本次借款申请未通过审核，保持良好的信用记录');
      return;
    }
    if (!this.user.isPersonalProfileCompleted()) {
      this.navCtrl.parent.getByIndex(1).setPages([{
        page: this.personalAuthPage
      }]);
      this.navCtrl.parent.select(1);
      return;
    } else if (!this.user.isMobileOperatorCompleted()) {
      this.navCtrl.parent.getByIndex(1).setPages([{
        page: this.mobileAuthPage
      }]);
      this.navCtrl.parent.select(1);
      return;
    } else if (!this.user.isZhimaCreditCompleted()) {
      this.navCtrl.parent.getByIndex(1).setPages([{
        page: this.creditAuthPage
      }]);
      this.navCtrl.parent.select(1);
      return;
    } else if (!this.user.isBankCardCompleted()) {
      this.navCtrl.parent.getByIndex(1).setPages([{
        page: this.bankAuthPage
      }]);
      this.navCtrl.parent.select(1);
      return;
    } else if (val == 'auth') {
      this.navCtrl.parent.select(1);
    } else {
      this.navCtrl.push(this.confirmPage, {
        amount: this.loanAmount,
        period: this.loanPeriod
      });
    }
  }

  resetLoan() {
    this.api.resetLoan(this.loan).then(
      () => this.loan = null
    ).catch();
  }

  gopaymeny() {
    if (this.loan) {
      this.loan.field_order_status = 'pending_payment';

    }
  }


}
