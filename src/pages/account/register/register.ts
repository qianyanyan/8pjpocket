import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';

import { validatePhoneNumber } from '../../../app/app.validators';
import { FormPage } from '../../form-page';
import { AccountLoginPage } from '../login/login';
import { LoanLoanPage } from '../../loan/loan/loan';

import { AccountRegisterAgreePage } from './register-agree';
 @Component({
   selector: 'page-account-register',
   templateUrl: 'register.html',
 })
export class AccountRegisterPage  extends FormPage {

  loginPage = AccountLoginPage ;
  loanPage = LoanLoanPage;
  sendVerificationCodeText = "获取验证码";
  sendVerificationCodeDisabled = false;
  agreePage = AccountRegisterAgreePage ;
  buildForm(): FormGroup {
    return this.ui.fb.group({
      mobile: [
        '',
        [
          Validators.required,
          validatePhoneNumber
        ]
      ],
      password: ['',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20)
        ]

      ],
      code: ['',
        [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6)
          ]
     ],
      code_id: ['', Validators.required]
    });
  }
  saveForm(): Observable<any> {
    let mobile = this.form.get('mobile').value;
    let password = this.form.get('password').value;
    let code = this.form.get('code').value;
    let code_id = this.form.get('code_id').value;

    return Observable.create(ob => {
      this.api.register(mobile, password, code, code_id).then(resp => {
        if (resp && _.has(resp, 'code') && resp.code == 1) {

          let token: string = btoa(`${resp.username}:${password}`);
          this.api.setCurrentUser(resp.uuid, resp.username, token,resp.loan_times);
          this.datastore.user.field_user_status = resp.field_user_status;
          this.datastore.user.old_user = resp.old_user;
          ob.next();
          ob.complete();
        } else {
          if (_.has(resp, 'message')) {
            ob.error(resp.message);
          } else {
            ob.error("注册失败，请重试。");
          }
        }
      });
    });
  }

  onSaveSuccess(response) {
    this.navCtrl.pop();
  }

  onSaveError(error) {

  }

  sendVerificationCode() {
    if (this.form.get('mobile').status != 'VALID') {
      this.ui.showAlert("手机号码格式不对");
      return ;
    }

    const start = 120;
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

    this.api.sendVerificationCode(this.form.get('mobile').value).then(resp => {
      this.form.controls['code_id'].setValue(resp.id);
    });

  }

  loginClicked() {
    this.navCtrl.pop();
  }
}
