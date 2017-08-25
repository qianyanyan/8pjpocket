import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { LoanResultPage } from '../result/result';

@Component({
  selector: 'page-loan-help',
  templateUrl: 'help.html'
})

export class LoanHelpPage {
  resultPage = LoanResultPage;
  pet: string = "借款";
    temp:string;
  constructor(public navCtrl: NavController) {
    console.log(navCtrl);

  }
  accordion(index,temp) {
        this.temp=temp+index;
    }
  doInfinite(infiniteScroll) {

    //alert(1);
    //this.getdata();

    setTimeout(() => {
      infiniteScroll.complete();
    }, 1500);
  }
}
