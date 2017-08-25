import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Page } from '../../page';
import {Backs as BacksStorageConfigId} from '../../../common/storage-config';
import { User ,BankCardProfile} from '../../../app/app.models';
@Component({
  selector: 'page-account-mangecard',
  templateUrl: 'mangecard.html'
})
export class AccountMangecardPage extends Page{
    car_id  =  "ICBC";
    url:" ";
     banks = [];
    backCardProfile: BankCardProfile;
    ionViewWillEnter() {
      this.backCardProfile = this.api.datastore.user.bankCardProfile;

      this.api.getStorageConfig(BacksStorageConfigId)
      .then((res) => {
        if (res) {
          if (res && res.settings && res.settings.allowed_values) {
            this.banks = res.settings.allowed_values;
          }
        }
      });

    }

}
