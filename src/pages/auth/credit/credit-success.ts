import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Rx';
import { Page } from '../../page';
import {AuthCardPage} from '../card/card';
//import { AuthIdPage } from '../id/id';
@Component({
  selector: 'page-auth-credit-credit-success',
  templateUrl: 'credit-success.html'
})

export class AuthCreditSuccessPage extends Page {
 cardPage = AuthCardPage ;
ionViewDidEnter() {
    Observable.timer(3000).subscribe(() => {
      this.navCtrl.setPages([
        {
          page: this.cardPage
        }
      ]);
      
      // this.navCtrl.parent.select(0);
    });
  }

}
