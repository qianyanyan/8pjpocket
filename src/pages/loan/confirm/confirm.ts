import {Component} from '@angular/core';
import * as moment from 'moment';

import {Page} from '../../page';
import {BankCardProfile, Loan} from '../../../app/app.models';
import {LoanComfirmAgreePage} from './comfirm-agree';
import {Backs as BacksStorageConfigId} from '../../../common/storage-config';

@Component({
  selector: 'page-loan-confirm',
  templateUrl: 'confirm.html'
})
export class LoanConfirmPage extends Page {
  agreePage = LoanComfirmAgreePage;
  loanAmount: number;
  loanPeriod: number;
  backCardProfile: BankCardProfile;
  cont: any;
  str: any;
  banks = [];
  feeRates = {
    rlx: 0.05,
    ptyyf: 4.29,
    xxllf: 2.86,
    zxshf: 7.15
  };
  bankProfile: BankCardProfile = this.datastore.createRecord(BankCardProfile);


  ionViewWillEnter() {
    this.loanAmount = this.navParams.get('amount');
    this.loanPeriod = this.navParams.get('period');

    Promise.all([
      this.api.getBankCardProfile(),
      this.api.getPoundageRate(),
    ]).then(values => {
      this.bankProfile = values[0];
      this.str = this.bankProfile.field_cardid;
      this.cont = this.str.substr(this.str.length - 4);
      this.feeRates = values[1];
    });
    this.backCardProfile = this.api.datastore.user.bankCardProfile;
    this.api.getStorageConfig(BacksStorageConfigId)
      .then((res) => {
        if (res) {
          if (res && res.settings && res.settings.allowed_values) {
            this.banks = res.settings.allowed_values;
            let banpro = this.banks[this.bankProfile.field_suoshuyinxing];
            console.log(banpro)
          }
        }
      });
  }

  get actualAmount(): number {
    return this.loanAmount
      - this.loanAmount * this.loanPeriod * this.feeRates.rlx / 100
      - this.loanAmount * this.feeRates.ptyyf / 100
      - this.loanAmount * this.feeRates.xxllf / 100
      - this.loanAmount * this.feeRates.zxshf / 100;
  }

  submit() {
    let order: Loan = this.datastore.createRecord(Loan, {
      title: 'BJ' + moment().format("YYYYMMDD") + this.api.datastore.user.name,
      field_amount: this.loanAmount,
      field_period: this.loanPeriod,
      field_real_amount: this.actualAmount
    });

    let loader = this.ui.loadingCtrl.create({
      // content: "Please wait..."
    });

    loader.present();
    let that=this;
    this.api.createLoan(order).then(order => {
      loader.dismiss();
      if (order&&order.errors&&order.errors[0].status == 422) {
        this.ui.titleAlert('您本次借款申请未通过审核，请1日后重新提交贷款申请，感谢您一如既往的支持').then(
          () => this.navCtrl.parent.select(0)
        );

        return;
      }
      var target = document.getElementById("modelcred");
      target.style.display = "block";
      setTimeout(() => {
        target.style.display = "none";
        that.navCtrl.pop();
      }, 1000)
    });
  }

  goAgree() {
    this.navCtrl.push(this.agreePage, {
      price: this.navParams.get('amount'),
      date: this.navParams.get('period')
    });
  }

}

//  Observable.timer(3000).subscribe(() => {
//       this.navCtrl.setPages([
//         {
//           page: this.authPage
//         }
//       ]);

//       this.navCtrl.parent.select(0);
//     });
