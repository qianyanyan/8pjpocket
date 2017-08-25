import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AccountAccountPage } from '../account/account';
@Component({
  selector: 'page-account-chat',
  templateUrl: 'chat.html'
})
export class AccountchatPage {
     mobilePage =AccountAccountPage;
     paySrc = 'http://www.gongjuji.net';
  constructor(public navCtrl: NavController) {

  }

}