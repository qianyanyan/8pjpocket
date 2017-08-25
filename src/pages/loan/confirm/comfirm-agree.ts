import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Page } from '../../page';
import * as moment from 'moment';
@Component({
  selector: 'page-loan-comfirm-agree',
  templateUrl: 'comfirm-agree.html'
})
export class LoanComfirmAgreePage extends Page{
  name:string;
  nameid:string;
  loanAmount: number;
  loanPeriod: number;
  title:string;
  starData:any;
  endDate:any;
  feeRates = {
    rlx: 0.05,
    ptyyf: 4.29,
    xxllf: 2.86,
    zxshf: 7.15
  };
  ionViewWillEnter() {
    this.api.getPersonalInformationProfile().then(profile => {
      if (!profile) {
        this.name = '张**';
        this.nameid = "2456***********7584" ;
        
      }
      this.name = profile.field_name;
      this.nameid = profile.field_id ;
      this.starData = moment().format("YYYY年MM月DD日");
      this.endDate =  moment().add(this.loanPeriod-1,'day').format("YYYY年MM月DD日");
      console.log(this.starData);
      console.log(this.endDate)
    });
    this.title= 'BJ' + moment().format("YYYYMMDD") + this.api.datastore.user.name,
    this.loanAmount = this.navParams.get('price');
    this.loanPeriod = this.navParams.get('date');
    this.starData  = moment().format("YYYY-MM-DD");
  }


}
