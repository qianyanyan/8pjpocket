import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import { FormPage } from '../../form-page';
import { LoanLoanPage } from '../../loan/loan/loan';
import { User } from '../../../app/app.models';
import { validatePhoneNumber } from '../../../app/app.validators';
@Component({
  selector: 'page-account-changepass',
  templateUrl: 'changepass.html',
})
export class AccountChangepassdPage extends FormPage {

  loanPage = LoanLoanPage;
  sendVerificationCodeText = "获取验证码";
  sendVerificationCodeDisabled = false;

  buildForm(): FormGroup {
    return this.ui.fb.group({
      password1: ['', [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20)
        ]
      ],
      password2: ['', [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20)
        ]
      ],

      code: ['', Validators.required],
      code_id: ['', Validators.required],
    }, {
      validator: this.checkIfMatchingPasswords('password1', 'password2')
    });
  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        //  this.ui.showAlert("密码不一致");
        return passwordConfirmationInput.setErrors({
          notEquivalent: true
        })
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    }
  }

  saveForm(): Observable < any > {
    let password = this.form.get('password1').value;
    let mobile = this.api.datastore.user.name;
    let code = this.form.get('code').value;
    let code_id = this.form.get('code_id').value;

    return Observable.create(ob => {
      this.api.register(mobile, password, code, code_id).then(resp => {
        // this.api.datastore.user.token = btoa(`${mobile}:${password}`);
        if (resp && _.has(resp, 'code') && resp.code == 1) {
          let token: string = btoa(`${resp.username}:${password}`);
          this.api.setCurrentUser(resp.uuid, resp.username, token, resp.loan_times);
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

  // onSaveSuccess(response) {
  //   this.navCtrl.parent.select(0);
  // }

  sendVerificationCode() {
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

    this.api.sendVerificationCode(this.api.datastore.user.name).then(resp => {
      this.form.controls['code_id'].setValue(resp.id);
    });

  }
}
