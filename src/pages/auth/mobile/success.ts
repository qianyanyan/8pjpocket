import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';

import { Page } from '../../page';
import { AuthCardPage } from '../card/card';

import { AuthCreditPage } from '../credit/credit';
@Component({
  selector: 'page-auth-mobile-success',
  templateUrl: 'success.html'
})

export class AuthMobileSuccessPage extends Page {

  cardPage = AuthCardPage;
  credit = AuthCreditPage;
  ionViewWillEnter() {
    Observable.timer(3000).subscribe(() => {
      this.navCtrl.setPages([{
        // page: this.cardPage
        page :this.credit
      }]);
    });
  }
}