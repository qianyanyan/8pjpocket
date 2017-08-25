import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import * as _ from 'lodash';

import {validatePhoneNumber} from '../../../app/app.validators';

import {FormPage} from '../../form-page';
import {AccountLoginPage} from '../../account/login/login';
import {User, MobileOperatorProfile} from '../../../app/app.models';
import {AuthMobileForgotPasswordPage} from './forgot-password';
import {AuthPersonalPage} from '../personal/personal';
import {AuthCardPage} from '../card/card';
import {AuthMobileCaptchaPage} from './captcha';
import {AuthMobileSuccessPage} from './success';

@Component({
  selector: 'page-auth-mobile',
  templateUrl: 'mobile.html'
})
export class AuthMobilePage extends FormPage {
  loginPage = AccountLoginPage;
  forgotPasswordPage = AuthMobileForgotPasswordPage;
  sendCaptchaPage = AuthMobileCaptchaPage;
  authPersonalPage = AuthPersonalPage;
  successPage = AuthMobileSuccessPage;
 Contacts={};
 paramy:any;
 name:any;
key:any;
  user: User;
  profile: MobileOperatorProfile;
  requireCaptcha: boolean = false;

  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
      return;
    }

    this.user = this.api.datastore.user;
    if (!this.user.isPersonalProfileCompleted()) {
      this.navCtrl.setPages([{page: this.authPersonalPage}]);
      return;
    }

    if (this.api.datastore.user.mobileOperatorProfile) {
      this.profile = this.api.datastore.user.mobileOperatorProfile;
    } else {
      this.profile = this.api.datastore.createRecord(MobileOperatorProfile);
    }
    
  }

  buildForm(): FormGroup {
    return this.ui.fb.group({
      mobile: ['', [Validators.required, validatePhoneNumber]],
      password: ['', Validators.required],
    });
  }

  saveForm(): Observable<any> {
    let name: string = this.user.personalInformationProfile.field_name;
    let mobile: string = this.form.get('mobile').value;
    let id: string = this.user.personalInformationProfile.field_id;
    let password: string = this.form.get('password').value;

    return Observable.create((ob) => {
      this.api.getHuluToken(name, id, mobile, password,this.profile.field_contact_count).then(resp => {
        if (resp.code == 1 && _.has(resp, 'info.code') && _.has(resp, 'info.data.token')) {
          this.requireCaptcha = resp.info.code == 12800;
          this.profile.field_hulu_mobile_token = resp.info.data.token;
          this.profile.field_fuwu = password;
          this.profile.field_phone = mobile;
          this.profile.field_code_flag = true;
          ob.next(resp);
          ob.complete();
        } else{
          if (_.has(resp,'message')){
            // this.ui.showAlert("验证失败，请重试");
            ob.error(resp.message);
          }else{
            ob.error();
          }
          this.profile.field_code_flag = false;
        }
      },()=>{
        ob.error();
      });
    });
  }

  onSaveError(err: any): void {
    this.ui.showAlert(err);
  }

  onSaveSuccess(response: any): void {
    if (this.requireCaptcha) {
      this.navCtrl.setPages([
        {
          page: this.sendCaptchaPage,
          params: {
            mobile: this.profile.field_phone,
            token: this.profile.field_hulu_mobile_token,
            password: this.profile.field_fuwu,
            contacts: this.profile.field_contact_count
          }
        }
      ]);
    }else{
      this.profile.field_mobile_finished = true; 
      this.navCtrl.setPages([
          {
            page: this.successPage,
          }
        ]);
         this.api.getMobileOperatorProfile().then(profile => {
            this.api.datastore.user.mobileOperatorProfile = profile;
            console.log(profile)
          
          
         })
          .catch(() => this.ui.showAlert('保存失败，请重试'));;

        // }).catch(() => this.ui.showAlert('保存失败，请重试'));
        // this.api.datastore.user.mobileOperatorProfile.field_code_flag = true;
        //  this.api.saveMobileOperatorProfile(this.profile).then(profile => {
        //   this.api.datastore.user.mobileOperatorProfile = profile;
        //   this.navCtrl.setPages([
        //     {
        //       page: this.successPage,
        //     }
        //   ]);

        // }).catch(() => this.ui.showAlert('保存失败，请重试'));
    }

  
  }
}
