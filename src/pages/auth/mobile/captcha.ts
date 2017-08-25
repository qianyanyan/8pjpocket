import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

import { FormPage } from '../../form-page';
import { AccountLoginPage } from '../../account/login/login';
import { MobileOperatorProfile } from '../../../app/app.models';
import { AuthMobileSuccessPage } from './success';
import {AuthMobilePage} from './mobile';
@Component({
  selector: 'page-auth-mobile-captcha',
  templateUrl: 'captcha.html'
})
export class AuthMobileCaptchaPage extends FormPage {

  loginPage = AccountLoginPage;
  successPage = AuthMobileSuccessPage;
  mobilePage = AuthMobilePage ;
  profile: MobileOperatorProfile;
  sendVerificationCodeText = "获取验证码";
  sendVerificationCodeDisabled = false;

  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
      return ;
    }

    if (this.api.datastore.user.mobileOperatorProfile) {
      this.profile = this.api.datastore.user.mobileOperatorProfile;
    } else {
      this.profile = this.api.datastore.createRecord(MobileOperatorProfile);
    }

    this.profile.field_fuwu = this.navParams.get('password');
    this.profile.field_phone = this.navParams.get('mobile');
    this.profile.field_hulu_mobile_token = this.navParams.get('token');
    this.profile.field_contact_count = this.navParams.get('contacts');

    if (!this.profile.field_phone) {
      this.navCtrl.parent.select(1);
    }
    const start = 180;
    Observable
      .timer(0, 1000)
      .map(i => start - i)
      .take(start + 1)
      .subscribe(
        i => {
          this.sendVerificationCodeText = `${i}s`;
          this.sendVerificationCodeDisabled = true;
        },
        err => console.log(err),
        () => {
          this.sendVerificationCodeText = '重新发送';
          this.sendVerificationCodeDisabled = false;
        }
      );
  }

  buildForm(): FormGroup {
    return this.ui.fb.group({
      captcha: ['', Validators.required],
    });
  }

  saveForm(): Observable<any> {
    return Observable.create(ob => {
      let captcha: string = this.form.get('captcha').value;

      this.api.verifyHuluLogin(this.profile.field_fuwu, captcha).then(resp => {
        if (_.has(resp, 'info.code') && resp.info.code == 12291 && _.has(resp, 'info.data.token')) {
          this.profile.field_hulu_mobile_token = resp.info.data.token;
          this.profile.field_mobile_finished = true;  
        //    ob.next();
        // ob.complete();
        } else if(_.has(resp, 'info.code') && resp.info.code == 12544){//密码错了
               ob.error(resp.message);
                this.ui.showAlert(resp.message);
               this.navCtrl.setPages([{
                  page: this.mobilePage
                }]);
        } else if(resp.code == 0 && _.has(resp,'message')){
          this.profile.field_mobile_finished = false; 
          this.ui.showAlert(resp.message);
        } else {
           this.profile.field_mobile_finished = false; 
           this.ui.showAlert('验证失败，请重试');
        }

        ob.next();
        ob.complete();
      }).catch(() => {
        this.ui.showAlert('验证失败，请重试');
         this.profile.field_mobile_finished = false; 
        ob.next();
        ob.complete();
      });
    });
  }

  onSaveSuccess(response: any): void {
    // if(this.profile.field_mobile_finished){
    //   this.api.saveMobileOperatorProfile(this.profile).then(profile => {
    //     this.api.datastore.user.mobileOperatorProfile = profile;
    //     this.navCtrl.setPages([{
    //       page: this.successPage
    //     }]);
    //   }).catch(() => this.ui.showAlert('保存失败，请重试'));
    // }else{
      
    // }
    if(this.profile.field_mobile_finished){
         this.navCtrl.setPages([{
          page: this.successPage
        }]);
    }
      
  }
  
  sendVerificationCode() {
    const start = 180;
    Observable
      .timer(1000, 1000)
      .map(i => start - i)
      .take(start + 1)
      .subscribe(
        i => {
          this.sendVerificationCodeText = `${i}s`;
          this.sendVerificationCodeDisabled = true;
        },
        err => console.log(err),
        () => {
          this.sendVerificationCodeText = '重新发送';
          this.sendVerificationCodeDisabled = false;
        }
      );

    this.api.sendHuluVerificationCode(this.profile.field_hulu_mobile_token);
  }

}