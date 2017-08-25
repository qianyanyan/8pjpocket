import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';


import { Page } from '../../page';
import { AuthAuthPage } from '../auth/auth';

@Component({
  selector: 'page-success-card-success',
  templateUrl: 'card-success.html'
})
export class AuthCardSuccessPage extends Page {

  authPage = AuthAuthPage;

  ionViewDidEnter() {
    Observable.timer(3000).subscribe(() => {
      this.navCtrl.setPages([
        {
          page: this.authPage
        }
      ]);
      
      this.navCtrl.parent.select(0);
    });
  }
}