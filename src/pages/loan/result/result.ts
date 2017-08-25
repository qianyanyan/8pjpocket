import { Component } from '@angular/core';

import { Page } from '../../page';

@Component({
  selector: 'page-loan-result',
  templateUrl: 'result.html'
})

export class LoanResultPage extends Page {

  acknowledge() {
    this.navCtrl.popToRoot();
  }

}
