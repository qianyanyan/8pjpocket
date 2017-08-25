import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Datastore} from './datastore.service';
import {Addresses} from './address.service';
import {UI} from './ui.service';
import {AlertController, Events} from 'ionic-angular';
import {JsonApiQueryData} from 'angular2-jsonapi';
import * as M from '../app/app.models';
import * as _ from 'lodash';

@Injectable()
export class API {
  // baseUrl: string = 'http://192.168.4.70/';
  baseUrl: string = 'https://8jpocket.com/';
  // baseUrl: string = 'http://test2.8jpocket.com/';

  // constructor(public datastore: Datastore, public http: Http, public alertCtrl: AlertController) {
  constructor(public datastore: Datastore, public http: Http, public ui: UI, public events: Events) {

  }

  isUserLoggedIn(): boolean {
    return this.datastore.user != null;
  }

  login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!username || !password) {
        resolve(false);
        return;
      }
      this.loginByToken(btoa(`${username}:${password}`))
        .then((result) => {
          resolve(result);
        });
    });
  }

  loginByToken(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.sendHalJSONRequest("bjipa/v1/gui", null, new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Basic ${token}`
      })).then(
        resp => {
          if (resp && "uuid" in resp && resp.uuid) {
            this.setCurrentUser(resp.uuid, resp.username, token, resp.loan_times);
            this.datastore.user.field_user_status = resp.field_user_status;
            this.datastore.user.old_user = resp.old_user;
            // fetch related profiles
            Promise.all([
              this.getPersonalInformationProfile(),
              this.getMobileOperatorProfile(),
              this.getZhiMaCreditProfile(),
              this.getBankCardProfile()
            ]).then(profiles => {
              if (profiles.length == 4) {
                this.datastore.user.personalInformationProfile = profiles[0];
                this.datastore.user.mobileOperatorProfile = profiles[1];
                this.datastore.user.zhiMaCreditProfile = profiles[2];
                this.datastore.user.bankCardProfile = profiles[3];
                console.log(this.datastore.user.personalInformationProfile);
                console.log(this.datastore.user.zhiMaCreditProfile);
              }
              this.handleEvents('user:logged:in');
              resolve(true);
            }, err => resolve(true)).catch(err => resolve(true));
          } else {
            resolve(false);
          }
        },
        err => resolve(false)
      ).catch(err => resolve(false));
    });
  }

  logout() {
    // this.datastore.removeByKey('token').then(() => {
    // }, () => {
    // });
    this.datastore.clearStorage().then(() => {

    });
    this.datastore.user = null;
    this.handleEvents('user:log:out');
  }

  handleEvents(name, ...args) {
    this.events.publish(name, args);
  }

  setCurrentUser(uuid, username, token, loan_times) {
    this.datastore.user = this.datastore.createRecord(M.User, {
      uuid: uuid,
      name: username
    });

    this.datastore.user.id = uuid;
    this.datastore.user.token = token;
    this.datastore.user.loan_times = loan_times;

    this.datastore.saveKeyValue('token', token)
      .then((result) => {

      });

    this.datastore.setHeaders(new Headers({
      'Content-Type': 'application/vnd.api+json',
      'Authorization': `Basic ${token}`,
      'Accept': 'application/vnd.api+json'
    }));
  }

  register(username: string, password: string, vcode: string, vid: string): Promise<any> {
    return this.sendUserRequest(username, password, vcode, vid);
  }


  refreshAuthStatus(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isUserLoggedIn()) {
        resolve();
        return;
      }

      let user = this.datastore.user;
      this.sendHalJSONRequest("bjipa/v1/gui").then(
        resp => {
          if (!resp || !_.has(resp, "verify_data")) {
            resolve();
            return;
          }

          if (user.personalInformationProfile) {
            user.personalInformationProfile.field_cert_compeleted = resp.verify_data.personal_information && resp.verify_data.personal_information == '1';
          }

          if (user.mobileOperatorProfile) {
            user.mobileOperatorProfile.field_mobile_finished = resp.verify_data.mobile_operator && resp.verify_data.mobile_operator == '1';
          }

          if (user.bankCardProfile) {
            user.bankCardProfile.field_bankcard_finished = resp.verify_data.bankcard && resp.verify_data.bankcard == '1';
          }

          resolve();
        }
      ).catch(err => resolve());
    });
  }

  getStorageConfig(id: string): Promise<M.StorageConfig> {
    return this.datastore.findStorageConfig(id);
  }

  // getRenlianshibieProfile(): Promise<M.ImageFile> {
  //   return this.datastore.findLatestOneForCurrentUser(M.ImageFile);
  // }
  getUserProfile(): Promise<M.User> {
    return this.datastore.findWithId(M.User, this.datastore.user.uuid);
  }

  getPersonalInformationProfile(): Promise<M.PersonalInformationProfile> {
    // return this.datastore.findLatestOneForCurrentUser(M.PersonalInformationProfile);
    return this.datastore.findRecordForCurrentUserWith(M.PersonalInformationProfile, 'field_renlianshibie,field_idpicture');
  }

  savePersonalInformationProfile(profile: M.PersonalInformationProfile): Promise<M.PersonalInformationProfile> {
    return this.datastore.saveForCurrentUser(profile);
  }

  getZhiMaCreditProfile(): Promise<M.ZhiMaCreditProfile> {
    return this.datastore.findLatestOneForCurrentUser(M.ZhiMaCreditProfile);
  }

  getBankCardProfile(): Promise<M.BankCardProfile> {
    return this.datastore.findLatestOneForCurrentUser(M.BankCardProfile);
  }

  saveBankCardProfile(profile: M.BankCardProfile): Promise<M.BankCardProfile> {
    return this.datastore.saveForCurrentUser(profile);
  }

  getMobileOperatorProfile(): Promise<M.MobileOperatorProfile> {
    return this.datastore.findLatestOneForCurrentUser(M.MobileOperatorProfile);
  }

  saveMobileOperatorProfile(profile: M.MobileOperatorProfile): Promise<M.MobileOperatorProfile> {
    return this.datastore.saveForCurrentUser(profile);
  }

  createLoan(loan: M.Loan): Promise<M.Loan> {
    return this.datastore.saveForCurrentUser(loan);
  }

  abandonLoan(loan: M.Loan): Promise<M.Loan> {
    loan.id = loan.uuid;
    loan.promote = false;
    return this.datastore.saveForCurrentUser(loan);
  }

  getLastLoan(): Promise<M.Loan> {
    return new Promise(((resolve, reject) => {
      this.datastore.findUnlimitForCurrentUser(M.Loan, {
        promote: {value: 0},
        field_order_status: {value: 'completed'}
      }).then((loan) => {
        resolve(loan);
      }, () => {
        reject(null);
      }).catch(err => resolve(null));
    }));
  }

  getLoan(): Promise<M.Loan> {
    return new Promise((resolve, reject) => {
      this.datastore.findOneForCurrentUser(M.Loan, {
        promote: {value: 1}
      }).then(loan => {
        loan.id = loan.uuid;
        this.datastore.findOneForCurrentUser(M.Payment, {
          "field_related_order.uuid": {value: loan.uuid}
        }).then(payment => {
          loan.payment = payment;
          resolve(loan);
        }, err => resolve(loan)).catch(err => resolve(loan));
      }, err => resolve(null)).catch(err => resolve(null));
    });
  }

  resetLoan(loan: M.Loan): Promise<M.Loan> {
    return new Promise((resolve, reject) => {
      loan.promote = false;

      loan.save().subscribe(
        loan => resolve(loan),
        err => reject(err)
      );
    });
  }

  createPayment(payment: M.Payment): Promise<M.Payment> {
    return this.datastore.saveForCurrentUser(payment);
  }

  getPayment(): Promise<M.Payment> {
    return this.datastore.findLatestOneForCurrentUser(M.Payment);
  }

  /**
   * {
   "rlx": "0.05",
   "ptyyf": "4.29",
   "xxllf": "2.89",
   "zxshf": "7.15"
}
   */
  getPoundageRate(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isUserLoggedIn()) {
        resolve();
        return;
      }

      this.http.get(`${this.baseUrl}bjipa/v1/poundage-rate?_format=json`, new RequestOptions({
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.datastore.user.token}`
        })
      })).subscribe(
        resp => resolve(resp.json()),
        err => reject()
      );
    });
  }

  /**
   * 获取葫芦token
   * @param name 姓名
   * @param id 身份证号
   * @param mobile 手机号
   * @param password 服务密码
   * @param uid 用户uid
   */
//   {
//     "code": 0,
//     "info": {
//         "code": 12800,
//         "code_description": "COLLECT_CAPTCHA_REQUIRED",
//         "data": {
//             "send_request_time": 1501132374424,
//             "send_response_time": 1501132391058,
//             "time_consuming": 16634,
//             "token": "dccb65b1b14d49fc8c3a441a64a9c138"
//         },
//         "message": "输入短信验证码"
//     },
//     "message": "输入短信验证码"
// }
  getHuluToken(name: string, id: string, mobile: string, password: string, contacsCout: any): Promise<any> {
    return new Promise(((resolve, reject) => {
      this.sendHalJSONRequest("bj_hulu/get/applysign", {
        identity_card_number: id,
        name: name,
        cell_phone_number: mobile,
        password: password,
        contactList: contacsCout
      }).then((resp) => {
        resolve(resp);
      }, () => {
        resolve();
      })
    }))
  }

  // Response:
  // {
  //   code: number;
  //   message: string;
  //   id: string;
  // }
  sendVerificationCode(mobile: string): Promise<any> {
    return new Promise((resolve, reject) => {
      mobile = mobile.trim();

      if (!mobile || mobile.length != 11) {
        reject();
        return;
      }

      this.sendHalJSONRequest('bj_sms/sendVerifyCode', {
        mobile: mobile
      }).then(
        data => {
          if (data && data.code == 1) {
            resolve(data);
          } else {
            reject();
          }
        },
        err => reject()
      );
    });
  }

  getZhiMaUrl(name: string, idCardNumber: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.sendHalJSONRequest('bj_zhima/getZhimaUrl', {
        name: name,
        certNo: idCardNumber
      }).then(data => {
        if (data && _.has(data, 'code') && data.code == 1 && _.has(data, 'message')) {
          resolve(data.message);
        } else {
          reject();
        }
      }).catch(err => {
        reject();
      });
    });
  }

  sendbindcard(cardno: string, phone: string, username: string, idcardno: string): Promise<any> {
    return new Promise((resolve, reject) => {

      if (!phone || phone.length != 11 || !cardno || !username || !idcardno) {
        reject();
        return;
      }

      this.sendHalJSONRequest('bjipa/bindcard', {
        cardno: cardno,
        phone: phone,
        username: username,
        idcardno: idcardno
      }).then(
        data => {
          if (data && data.code == 1) {
            resolve(data);
          } else {
            // reject();
            resolve(data);
          }
        },
        err => reject()
      );
    });
  }

  CardConfirm(requestno: string, code: string): Promise<any> {
    return new Promise((resolve, reject) => {

      if (!requestno || !code) {
        reject();
        return;
      }

      this.sendHalJSONRequest('bjipa/bindCardConfirm', {
        requestno: requestno,
        code: code
      }).then(
        data => {
          if (data && data.code == 1) {
            resolve(data);
          } else {
            // reject();
            resolve(data);
          }
        },
        err => reject()
      );
    });
  }

  loannum(): Promise<any> {
    return this.sendHalJSONRequest('bajie/get/loannum');
  }

  sendHuluVerificationCode(token: string): Promise<any> {
    return this.sendHalJSONRequest('bj_hulu/get/loginResend', {
      token: token
    });
  }

  verifyHuluLogin(password: string, captcha: string): Promise<any> {
    return this.sendHalJSONRequest('bj_hulu/get/submitLogin', {
      password: password,
      captcha: captcha
    });
  }

  verifyHeadshot(image: M.ImageFile, name: string, id: string): Promise<any> {
    return this.sendHalJSONRequest('bj_faceid/get/getOcrVerify', {
      image: image.uri,
      idcard_name: name,
      idcard_number: id
    });
  }

  ocrIDCard(image: M.ImageFile): Promise<any> {
    return this.sendHalJSONRequest('bj_faceid/get/getOcr', {
      image: image.uri
    });
  }

  getProvinces(): M.Province[] {
    let provinces: M.Province[] = [];

    _.each(Addresses, (cities, key) => {
      let province: M.Province = new M.Province();

      province.name = key;
      province.cities = [];

      _.each(cities, (districts, key) => {
        let city: M.City = new M.City();

        city.name = key;
        city.districts = [];

        _.each(districts, value => city.districts.push(new M.District(value)));

        province.cities.push(city);
      });

      provinces.push(province);
    });

    return provinces;
  }

  // resetPassword(username: string, password: string, vcode: string, vid: string): Promise<any> {
  //   return this.sendUserRequest(username, password, vcode, vid);
  // }

  uploadImage(path: string, data: string): Promise<M.ImageFile> {
    return new Promise((resolve, reject) => {
      if (!path || !data) {
        reject();
      }

      this.datastore.createRecord(M.ImageFile, {
        data: data,
        uri: path,
        status: true

      }).save().subscribe(
        resp => {
          if (resp) {
            resp.id = resp.uuid;
          }

          resolve(resp);
        }
      );
    });
  }

  /**
   * Register/Reset password
   *
   * @param username username
   * @param password
   * @param vcode
   * @param vid
   */
  sendUserRequest(username: string, password: string, vcode: string, vid: string): Promise<any> {
    return new Promise((resolve, reject) => {

      if (!username || !password || !vcode || !vid) {
        reject();
        return;
      }

      this.sendHalJSONRequest('bjipa/v1/register', {
        username: username,
        password: password,
        verify_code: vcode,
        verify_id: vid
      }).then(
        data => resolve(data),
        err => reject()
      );
    });
  }

  sendHalJSONRequest(path: string, body?: Object, headers?: Headers): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!headers) {
        headers = new Headers({
          'Content-Type': 'application/json'
        });

        if (this.datastore.user) {
          headers.set('Authorization', `Basic ${this.datastore.user.token}`);
        }
      }

      this.http.post(`${this.baseUrl}${path}?_format=hal_json`, body ? JSON.stringify(body) : "", new RequestOptions({
        headers: headers
      })).subscribe(
        resp => resolve(resp.json()),
        err => reject()
      );
    });
  }
}
