import { Component } from '@angular/core';
import { NavController,AlertController } from 'ionic-angular';
// import { AuthCreditSuccessPage } from './credit-success';
import { AuthCardPage } from '../card/card';
@Component({
  selector: 'page-auth-agree-credit',
  templateUrl: 'agree-credit.html'
})
export class AuthAgreeCreaitPage {
    //creditsuccess = AuthCreditSuccessPage;
   cardPage     = AuthCardPage;
  constructor(public navCtrl: NavController) {

  }

  gocardPage() {
    var target=document.getElementById("modelcred");
     target.style.display="block";
     setTimeout(()=>{
         target.style.display="none";
          this.navCtrl.push(this.cardPage);
     },4000)
      //    this.navCtrl.push(this.creditsuccess);

  }

}
