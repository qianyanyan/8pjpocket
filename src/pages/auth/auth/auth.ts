import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Page} from '../../page';
import {AccountLoginPage} from '../../account/login/login';
import {AuthPersonalPage} from '../personal/personal';
import {AuthMobilePage} from '../mobile/mobile';
import {AuthCreditPage} from '../credit/credit';
import {AuthCardPage} from '../card/card';

import {User} from '../../../app/app.models';

@Component({
  selector: 'page-auth-auth',
  templateUrl: 'auth.html'
})

export class AuthAuthPage extends Page {
  loginPage = AccountLoginPage;
  personalPage = AuthPersonalPage;
  mobilePage = AuthMobilePage;
  creditPage = AuthCreditPage;
  authCardPage = AuthCardPage;

  user: User;

  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
      return;
    }

    this.user = this.api.datastore.user;

    if (!this.user.isOldUser() || !this.user.isWhiteUser()) {
      this.ui.titleAlert('您的资质暂时不符合借款条件，感谢您一如既往的支持。').then(
        () => this.navCtrl.parent.select(0)
      );
      return;

    }
  }

  ionViewDidEnter() {
    if (!this.api.isUserLoggedIn()) {
      return;
    }

    if (!this.user || !this.user.isOldUser()) {
      return;
    }


    let user = this.user;

    if (!user.isPersonalProfileCompleted()) {
      this.navCtrl.setPages([{page: this.personalPage}]);
      return;
    }

    if (!user.isMobileOperatorCompleted()) {
      this.navCtrl.setPages([{page: this.mobilePage}]);
      return;
    }
    if (!user.isZhimaCreditCompleted()) {
      this.navCtrl.setPages([{page: this.creditPage}]);
      return;
    }
    if (!user.isBankCardCompleted()) {
      this.navCtrl.setPages([{page: this.authCardPage}]);
      return;
    }

  }
}
