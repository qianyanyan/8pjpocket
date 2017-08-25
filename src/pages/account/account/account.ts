import {Component} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';

import {AccountLoginPage} from '../login/login';
import {AccountChangepassdPage} from '../changepass/changepass';
import {AccountBillPage} from '../bill/bill';
import {AccountMangecardPage} from '../mangecard/mangecard';
import {LoanHelpPage} from '../../loan/help/help';
import {AuthMobilePage} from '../../auth/mobile/mobile';
import {Page} from '../../page';

import {AccountchatPage} from '../chat/chat';
import {AccountAboutPage} from '../about/about';
@Component({
  selector: 'page-account-account',
  templateUrl: 'account.html'
})
export class AccountAccountPage extends Page {
  loginPage = AccountLoginPage;
  changepassPage = AccountChangepassdPage;
  helpPage = LoanHelpPage;
  billPage = AccountBillPage;
  mobilePage = AuthMobilePage;
  mangecardPage = AccountMangecardPage;
  chatPage = AccountchatPage;
aboutPage = AccountAboutPage;
  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
    }

    console.log('ionViewWillEnter');
  }

  chat() {
    this.navCtrl.push(this.chatPage);
  }
  about(){
    this.navCtrl.push(this.aboutPage);
  }
  logout() {
    let confirm = this.ui.alertCtrl.create({
      title: '是否确定退出?',
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确定',
          handler: () => {
            this.api.logout();
            this.navCtrl.parent.select(0);
          }
        }
      ]
    });

    confirm.present();
  }
}
