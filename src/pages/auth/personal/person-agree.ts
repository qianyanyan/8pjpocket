import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Page } from '../../page';
import {AppModule} from '../../../app/app.module';
@Component({
  selector: 'page-account-person-agree',
  templateUrl: 'person-agree.html'
})
export class AccountPersonAgreePage extends Page {
    name:string;
    nameid:string;
  ionViewWillEnter() {
    this.api.getPersonalInformationProfile().then(profile => {
      if (!profile) {
        this.name = '张**';
        this.nameid = "2456***********7584" ;
        
      }
      this.name = profile.field_name;
      this.nameid = profile.field_id ;

    });
  }

}
