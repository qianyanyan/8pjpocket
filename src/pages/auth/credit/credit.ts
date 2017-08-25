import {Component} from '@angular/core';
import {FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Rx';

import {ZhiMaCreditProfile} from '../../../app/app.models';
import {AuthCreditSuccessPage} from './credit-success';
import {AccountLoginPage} from '../../account/login/login';
import {ThemeableBrowserFormPage} from "../../themeable-browser-form-page";
import {AuthCardPage} from '../card/card';
@Component({
  selector: 'page-auth-credit',
  templateUrl: 'credit.html'
})

export class AuthCreditPage extends ThemeableBrowserFormPage {

  successPage = AuthCreditSuccessPage;
  cardPage = AuthCardPage ;
  profile: ZhiMaCreditProfile;
  loginPage = AccountLoginPage;
  url: any;


  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
      return;
    }
    this.api.getZhiMaCreditProfile().then(profile => {
      console.log(profile)
      this.profile = profile;

    })
  }

  buildForm(): FormGroup {
    return this.ui.fb.group({
      name: ['', Validators.required],
      id_card_number: ['', Validators.required]
    });
  }

  loadForm(): void {
    this.api.getPersonalInformationProfile().then(profile => {
      this.form.controls['name'].setValue(profile.field_name);
      this.form.controls['id_card_number'].setValue(profile.field_id);
      // this.form.controls['name'].setValue('15201917382');
      // this.form.controls['id_card_number'].setValue('342623199107015527');
    })
  }


  public themeableBrowserEvent(event: any, ob?: any) {
    if (ob && event && event.type && event.type === 'loadstop' && event.url) {
      if (event.url.indexOf('bj_zhima/auth/callback') !== -1) {
        this.closeBrowser();
        console.log(event);
        this.api.getZhiMaCreditProfile().then(profile => {
          this.api.datastore.user.zhiMaCreditProfile = profile;
          ob.next();
          ob.complete();
        }).catch(err => {
          ob.next();
          ob.complete();
        });
      }
    }
  }

  saveForm(): Observable<any> {
    return Observable.create(ob => {
      let name: string = this.form.get('name').value;
      let idCardNumber: string = this.form.get('id_card_number').value;
      this.api.getZhiMaUrl(name, idCardNumber).then(url => {
        if (url) {
          this.url = url;
          this.createBlankBrowser(url, ob);
        } else {
          ob.error();
        }
      }).catch(err => {
        ob.error(err);
      });
    });
  }

  onSaveSuccess(response: any): void {
    // this.navCtrl.setPages([
    //   {
    //     page: this.successPage
    //   }
    // ]);
    var target = document.getElementById("modelcred");
      target.style.display = "block";
      setTimeout(() => {
        target.style.display = "none";
       this.navCtrl.setPages([
        {
          page: this.cardPage
        }
      ]);
      }, 1000)
  }

}
