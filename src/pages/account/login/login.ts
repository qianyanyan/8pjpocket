import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

import {FormPage} from '../../form-page';
import {MobileOperatorProfile} from '../../../app/app.models';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {LoanLoanPage} from '../../loan/loan/loan';
import {AccountAccountPage} from '../account/account';
import {AccountRegisterPage} from '../register/register';
import {AccountRepasswordPage} from '../repassword/repassword';

@Component({
  selector: 'page-account-login',
  templateUrl: 'login.html',
})
export class AccountLoginPage extends FormPage {
  accountPage = AccountAccountPage;
  registerPage = AccountRegisterPage;
  repasswordPage = AccountRepasswordPage;
  loanPage = LoanLoanPage;
  isOldUser: "";

  ionViewWillEnter() {
    if (this.api.isUserLoggedIn()) {
      this.navCtrl.pop();
      this.navCtrl.parent.select(0);
      return;
    }
  }

  buildForm(): FormGroup {
    return this.ui.fb.group({
      mobile: [
        '',
        [
          Validators.required,
          // Validators.minLength(11),
          //  Validators.maxLength(11),
          //  Validators.pattern("^(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$"),
        ]
      ],
      password: ['',
        [
          Validators.required,
          // Validators.minLength(6),
          //  Validators.maxLength(20),
        ]

      ],

    });
  }

  saveForm(): Observable<any> {
    return Observable.create((ob) => {
      this.api.login(this.form.get('mobile').value, this.form.get('password').value).then((success) => {
        if (success) {
          ob.next();
          ob.complete();
          if (!this.api.datastore.user.isOldUser()) {
            this.ui.titleAlert('您的资质暂时不符合借款条件，感谢您一如既往的支持。')
          }
        } else {
          ob.error();
          this.ui.showAlert('账号或密码错误，请重试');
        }
      }).catch(() => {

        ob.next();
        ob.complete();

      });
    });
  }

  onSaveSuccess(response) {
    this.navCtrl.pop();
    this.navCtrl.parent.select(0);
  }

  onSaveError(error) {

  }

  goHead() {
    // this.navCtrl.parent.select(0);
    this.navCtrl.pop();
    this.navCtrl.parent.select(0);
  }
}
