import {Component, PipeTransform, Pipe} from '@angular/core';
import {NavController} from 'ionic-angular';
import {AuthCardSuccessPage} from './card-success';
import {Page} from '../../page';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import * as _ from 'lodash';
import {FormPage} from '../../form-page';
import { AccountLoginPage } from '../../account/login/login';
import { AuthMobilePage } from '../mobile/mobile';
import {citys} from '../personal/citys';
import {BankCardProfile, Province, City, District} from '../../../app/app.models';
import {validatePhoneNumber} from '../../../app/app.validators';
import {Backs as BacksStorageConfig} from "../../../common/storage-config";

@Component({
  selector: 'page-auth-card',
  templateUrl: 'card.html'
})
export class AuthCardPage extends FormPage {
  loginPage = AccountLoginPage;
  cardsuccessPage = AuthCardSuccessPage;
  authMobilePage = AuthMobilePage;

  sendVerificationCodeText = "获取验证码";
  sendVerificationCodeDisabled = false;
  banks = [];
 
  cityData: any[]; //城市数据
  cityName:string = '北京市-北京市-东城区'; //初始化城市名
  citycode:string; //城市编码
  citys: any;
  name:any;
  key:any;

  // provinces: Province[];
  // cities: City[];
  // districts: District[];
  provinces:string;
  cities: string;
  districts:string;

  profile: BankCardProfile;
  username:string;
  idcardno:string;
  code:string;
  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
      return ;
    }

    /**
     * 重新获取银行卡认证数据(会存在审核失败的情况,同步线上的银行卡数据)
     */
    this.api.getBankCardProfile().then((currentProfile)=>{
      this.profile = this.api.datastore.user.bankCardProfile;
    });

    let user = this.api.datastore.user;
    
   this.citys=citys;
    this.setCityPickerData();

    this.api.getStorageConfig(BacksStorageConfig).then((res) => {
      if (res && res.settings && res.settings.allowed_values) {
        this.banks = res.settings.allowed_values;
      }
    });
     this.api.getPersonalInformationProfile().then(profile => {
       this.username = profile.field_name;
       this.idcardno = profile.field_id;
     })
  }

  sendVerificationCode() {
    if (this.form.get('cardMobile').status != 'VALID') {
      this.ui.showAlert("手机号码格式不对");
      return;
    }

    if (this.sendVerificationCodeDisabled) {
      return ;
    }
   
    let loader = this.ui.loadingCtrl.create({
     
    });
     loader.present();
      let cardno = this.form.get('cardNum').value;
      let phone = this.form.get('cardMobile').value;
   
    // this.api.sendVerificationCode(this.form.get('cardMobile').value).then(resp => {
    this.api.sendbindcard(cardno,phone, this.username, this.idcardno).then(resp => {
       loader.dismiss();
      if(resp && resp.code == 1){
        console.log(resp);
      this.code = resp.info.requestno ;
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

    }else{
       this.ui.showAlert(resp.message);
    }
    });

  }

  buildForm(): FormGroup {
    return this.ui.fb.group({
      cardNum: ['', Validators.required],
      cardtype: ['', Validators.required],
      cardMobile: [
        '',
        [
          Validators.required,
          validatePhoneNumber
        ]
      ],
      cardCode: ['',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6)
        ]
      ],
      // province: ['', Validators.required],
      // city: ['', Validators.required],
      // district: ['', Validators.required],
      code_id: ['123456', ],
      region:['', Validators.required],
    });
  }

  loadForm(): void {
    // this.onProvinceChanged();
    // this.onCityChanged();
    //  this.cityName = profile.field_province +((profile.field_city)?('-' + profile.field_city):('')) + ((profile.field_area)?('-' + profile.field_area):(''));
  }

  saveForm(): Observable<any> {
    let profile: BankCardProfile = this.api.datastore.createRecord(BankCardProfile, {
      field_cardid: this.form.get('cardNum').value,
      field_suoshuyinxing: this.form.get('cardtype').value,
      // field_province: this.form.get('province').value,
      // field_city: this.form.get('city').value,
      // field_area: this.form.get('district').value,

      field_province : (this.provinces ? this.provinces : "北京市"),
      field_city: (this.cities ? this.cities : "北京市" ),
      field_area:( this.districts ? this.districts : "东城区"),

      field_card_owner_phone: this.form.get('cardMobile').value,
      verify_id: this.form.get('code_id').value,
      verify_code: this.form.get('cardCode').value,
    });
    
      return Observable.create(ob => {
       let cardCode = this.form.get('cardCode').value;
          this.api.CardConfirm( this.code,cardCode).then(resp => {
              if(resp && resp.code == 1){
                  this.api.saveBankCardProfile(profile).then(
                profile => {
                  if (profile) {
                    this.api.datastore.user.bankCardProfile = profile;
                  }
                  ob.next();
                  ob.complete();
                },
                err => ob.error(err)
              );
           }else{
              this.ui.showAlert(resp.message);
               ob.next();
               ob.complete();
            }
        });
       
      });
   
   }
  // CardConfirm(){
  //      let cardCode = this.form.get('cardCode').value;
  //      this.api.CardConfirm( this.code,cardCode).then(resp => {
  //      if(resp){
  //       this.saveForm();
  //      }else{
  //        this.ui.showAlert("手机绑定失败");
  //       //  return false;
  //      }
  //     });
  // }

  onSaveSuccess(response: any): void {
    if(this.api.datastore.user.bankCardProfile){
       this.navCtrl.setPages([
      {
        page: this.cardsuccessPage
      }
    ]);
    }
    
  }

  // onProvinceChanged() {
  //   let name: string = this.form.get('province').value;
  //   let province: Province = _.find(this.provinces, {name: name});
  //   if (province) {
  //     this.cities = province.cities;
  //     this.districts = [];
  //   }
  // }

  // onCityChanged() {
  //   if (!this.cities || this.cities.length === 0) {
  //     return;
  //   }

  //   let name: string = this.form.get('city').value;
  //   let city: City = _.find(this.cities, {name: name});
  //   if (city) {
  //     this.districts = city.districts;
  //   }
  // }

  rebind() {
    this.profile = null;
  }
     /**
   * 获取城市数据
   */
  setCityPickerData(){
     this.cityData = this.citys;
  }

  /**
   * 城市选择器被改变时触发的事件
   * @param event
   */
  cityChange(event){
    console.log(event);
    this.citycode = event['region'].value;
    this.provinces=event.province.text;
  this.cities=event.city.text;
  this.districts=event.region.text;
    console.log(this.cityName) 

  }

}
