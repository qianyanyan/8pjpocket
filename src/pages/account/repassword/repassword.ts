import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {FormPage} from '../../form-page';
import {MobileOperatorProfile} from '../../../app/app.models';
import {LoanLoanPage} from '../../loan/loan/loan';
import * as _ from 'lodash';
import {User} from '../../../app/app.models';

@Component({
  selector: 'page-account-repassword',
  templateUrl: 'repassword.html',
})

export class AccountRepasswordPage extends FormPage {
  loanPage = LoanLoanPage;
  sendVerificationCodeText = "获取验证码";
  sendVerificationCodeDisabled = false;

  buildForm(): FormGroup {
    return this.ui.fb.group({
      mobile: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern("^(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$"),
        ]
      ],
      password: ['',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(20)
        ]

      ],
      code: ['', Validators.required],
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
          this.api.setCurrentUser(resp.uuid, resp.username, token, resp.loan_times);
          this.datastore.user.field_user_status = resp.field_user_status;
          this.datastore.user.old_user = resp.old_user;
          ob.next();
          ob.complete();
        } else {
          if (_.has(resp, 'message')) {
            ob.error(resp.message);
          } else {
            ob.error("密码重置失败，请重试。");
          }
        }
      });
    });
  }

  onSaveSuccess(response) {
    this.navCtrl.popToRoot();
  }

  onSaveError(error) {

  }

  sendVerificationCode() {
    if (this.form.get('mobile').status != 'VALID') {
      this.ui.showAlert("手机号码格式不对");
      return;
    }
    const start = 120;
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

    this.api.sendVerificationCode(this.form.get('mobile').value).then(resp => {
      this.form.controls['code_id'].setValue(resp.id);
    });

  }
}
