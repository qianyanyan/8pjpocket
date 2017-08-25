import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {Contact, IContactField} from '@ionic-native/contacts';
import * as _ from 'lodash';

import {AppModule} from '../../../app/app.module';
import {User, MobileOperatorProfile} from '../../../app/app.models';
import {FormPage} from '../../form-page';
import {AccountLoginPage} from '../../account/login/login';
import {PersonalInformationProfile, ImageFile, Province, City, District} from '../../../app/app.models';
import {AuthMobilePage} from '../mobile/mobile';
import {citys} from './citys';
import {AccountPersonAgreePage} from './person-agree';
declare global {
  interface Window {
    FaceID: any;
  }
}

@Component({
  selector: 'page-auth-personal',
  templateUrl: 'personal.html'
})
export class AuthPersonalPage extends FormPage {
  loginPage = AccountLoginPage;
  personAgreePage = AccountPersonAgreePage;


  platform: Platform = AppModule.injector.get(Platform);
  mobilePage = AuthMobilePage;
  profile: PersonalInformationProfile;
  profilemo:MobileOperatorProfile;
  

  // totalContacts: number = 0;
  totalContacts: any;
  // totalContacts=[{'钱燕燕':'15201917382'}];
  user: User;
 Contacts:any;
 paramy:any;
  isAuthComplete = false;

  cityData: any[]; //城市数据
  cityName:string = '北京市-北京市-东城区'; //初始化城市名
  code:string; //城市编码
  citys: any;
  name:any;
  key:any;
  // provinces: Province[];
  // cities: City[];
  // districts: District[];
  provinces:any;
  cities: any;
  districts:any;
  headshot: ImageFile;
  frontIDCard: ImageFile;
  rearIDCard: ImageFile;

  provin: any;
  citi: any;
  distr: any;
  ionViewWillEnter() {
    if (!this.api.isUserLoggedIn()) {
      this.navCtrl.push(this.loginPage);
      return ;
    }

    this.user = this.api.datastore.user;

    this.isAuthComplete = this.datastore.user.personalInformationProfile && this.datastore.user.personalInformationProfile.isCompleted();
    // this.isAuthComplete = this.datastore.user;
    // if (!this.provinces) {
    //   this.provinces = this.api.getProvinces();
    // }
    this.citys=citys;
    this.setCityPickerData();
    if (this.api.datastore.user.mobileOperatorProfile) {
      this.profilemo = this.api.datastore.user.mobileOperatorProfile;
    } else {
      this.profilemo = this.api.datastore.createRecord(MobileOperatorProfile);
    }
  }


  buildForm(): FormGroup {
    return this.ui.fb.group({
      huotijiance: ['', Validators.required],
      name: ['', Validators.required],
      cardid: ['', Validators.required],
      // province: ['', Validators.required],
      // city: ['', Validators.required],
      // district: ['', Validators.required],
      xiangxidizhi: ['', Validators.required],
      juzhu: ['', Validators.required],
      qinshuguanxi: ['', Validators.required],
      qinshudianhua: ['', Validators.required],
      shehuiguanxi: ['', Validators.required],
      shehuidianhua: ['', Validators.required],
      danweimingcheng: [''],
      danweidizhi: [''],
      region:['', Validators.required],
    });
  }

  loadForm(): void {
    this.api.getPersonalInformationProfile().then(profile => {
      if (!profile) {
        profile = this.api.datastore.createRecord(PersonalInformationProfile);
        profile.uid = this.api.datastore.user;
      }

      profile.id = profile.uuid;

      this.form.controls['huotijiance'].setValue(profile.field_huotijihuobiaoshi);
      this.form.controls['name'].setValue(profile.field_name);
      this.form.controls['cardid'].setValue(profile.field_id);
      this.form.controls['xiangxidizhi'].setValue(profile.field_xiangxidezhi);
      this.form.controls['juzhu'].setValue(profile.field_juzhu);
      this.form.controls['qinshuguanxi'].setValue(profile.field_qinshuguanxi);
      this.form.controls['qinshudianhua'].setValue(profile.field_qinshudianhua);
      this.form.controls['shehuiguanxi'].setValue(profile.field_shehuiguanxi);
      this.form.controls['shehuidianhua'].setValue(profile.field_shehuidianhua);
      this.form.controls['danweimingcheng'].setValue(profile.field_danweimingcheng);
      this.form.controls['danweidizhi'].setValue(profile.field_address);
      this.profile = profile;
      this.headshot =  profile.field_renlianshibie;
     
      if(profile.field_idpicture){
        this.frontIDCard = profile.field_idpicture[0];
        this.rearIDCard = profile.field_idpicture[1] ;
      }
      if(profile.field_province && profile.field_city && profile.field_area){
           this.cityName = profile.field_province +((profile.field_city)?('-' + profile.field_city):('')) + ((profile.field_area)?('-' + profile.field_area):(''));
      }else{
           this.cityName = '北京市-北京市-东城区';
      }
      
    });

  }

  saveForm(): Observable<any> {
    let profile: PersonalInformationProfile = this.profile;

    profile.field_name = this.form.get('name').value;
    profile.field_id = this.form.get('cardid').value;
    // profile.field_province = this.form.get('province').value;
    // profile.field_city = this.form.get('city').value;
    // profile.field_area = this.form.get('district').value;

    profile.field_province = this.provinces ? this.provinces : "北京市";
    profile.field_city = this.cities ? this.cities : "北京市" ;
    profile.field_area = this.districts ? this.districts : "东城区";

    profile.field_xiangxidezhi = this.form.get('xiangxidizhi').value;
    profile.field_juzhu = this.form.get('juzhu').value;
    profile.field_qinshuguanxi = this.form.get('qinshuguanxi').value;
    profile.field_qinshudianhua = this.form.get('qinshudianhua').value;
    profile.field_shehuiguanxi = this.form.get('shehuiguanxi').value;
    profile.field_shehuidianhua = this.form.get('shehuidianhua').value;
    profile.field_danweimingcheng = this.form.get('danweimingcheng').value;
    profile.field_address = this.form.get('danweidizhi').value;
    profile.field_huotijihuobiaoshi = true;
    profile.field_phone = '123123123';

    profile.field_renlianshibie = this.headshot;
    profile.field_idpicture = [this.frontIDCard, this.rearIDCard];

    return Observable.create(ob => {
      this.api.savePersonalInformationProfile(profile).then(
        profile => {
          this.api.datastore.user.personalInformationProfile = this.profile = profile;
          ob.next(profile);
        },
        err => ob.error(err)
      );
    });
  }

  onSaveSuccess(response) {
    this.user = this.api.datastore.user;
    if(this.isAuthComplete){
              // this.navCtrl.push(this.resultPage);
      var target=document.getElementById("modelcred");
      target.style.display="block";
      setTimeout(()=>{
          target.style.display="none";
      },2000)
      
    }
    
    if(this.user && this.user.isMobileOperatorCompleted()){
         this.navCtrl.pop();
    }else{
      console.log(this.paramy);
      console.log(this.Contacts);
        this.navCtrl.setPages([
          {
            page: this.mobilePage,
            params: {
              contacts: this.totalContacts
            }
          }
        ]);
    }
  }

  pickContact(control) {
    if (this.platform.is('core')) {
      this.form.controls[control].setValue('12345678901');
      return;
    }

    if (!this.totalContacts) {
      
      this.native.contacts.find(["*"]).then(results => {
         this.totalContacts = results;
         this.getContact();
      }).catch(() => this.startPickingContact(control));
    } else {
        this.startPickingContact(control);
    }
      // this.getContact();
      
  }
  getContact(): Observable<any>{
      this.paramy=[];
         for(let i=0; i<this.totalContacts.length;i++){
            this.name = this.totalContacts[i].displayName ?this.totalContacts[i].displayName : "未知";
            this.key =  this.totalContacts[i].phoneNumbers && this.totalContacts[i].phoneNumbers[0] &&this.totalContacts[i].phoneNumbers[0].value ? this.totalContacts[i].phoneNumbers[0].value : "未知";
           let item = {"prodectname":this.name,"prodectphone":this.key};
           this.paramy.push(item);
        }
           console.log(this.Contacts);
           console.log( this.paramy);
           this.profilemo.field_contact_count =this.totalContacts.length;
           this.profilemo.setContactList(this.paramy) ;
        this.api.saveMobileOperatorProfile(this.profilemo).then(profile => {
            this.api.datastore.user.mobileOperatorProfile = profile;
           console.log(profile)

          })
          .catch(
            () => this.ui.showAlert('保存失败，请重试')
          );
          return

  }
  startPickingContact(control) {
    this.native.contacts.pickContact().then((contact: Contact) => {
      if (!contact) {
        return;
      }

      let mobiles: IContactField[] = contact.phoneNumbers;
      if (mobiles && mobiles.length > 0) {

        let set = false;
        _.each(mobiles, mobile => {
          if (mobile.value && mobile.pref) {
            this.form.controls[control].setValue(mobile.value);
            set = true;
          }
        });

        if (!set) {
          this.form.controls[control].setValue(mobiles[0].value);
        }
      }
    });
  }

  faceDetectionTapped() {
    if (this.profile && this.profile.isCompleted()) {
      return;
    }

    this.form.controls['huotijiance'].setValue("");
    this.headshot = null;

    this.startFaceDetection()
      .then(image => {
        this.headshot = image;

        let name: string = this.form.get('name').value;
        let id: string = this.form.get('cardid').value;

        if (!name || !id) {
          return;
        }

        this.verifyHeadshot().catch(() => this.ui.showAlert('活体检测失败'));
      })
      .catch(() => this.ui.showAlert('获取头像失败，请重试。'));
  }

  startFaceDetection(): Promise<ImageFile> {
    return new Promise((resolve, reject) => {
      let image: ImageFile;

      if (this.platform.is('core')) {
        this.ui.showAlert("浏览器下，不支持活体检测，使用默认图片。");

        image = this.api.datastore.createRecord(ImageFile, {
          fid: 18,
          uri: "public://lixu/sample-headshot.png",
          url: "/sites/default/files/lixu/sample-headshot.png",
          uuid: "0a3e1055-3fa3-43a2-bd30-1bea3423ccc6"
        });

        image.id = image.uuid;

        resolve(image);
      } else {
        if (typeof window.FaceID == 'undefined') {
          this.ui.showAlert("未能找到FaceID插件，请重试。");
          reject();
          return;
        }

        const uuid: string = this.api.datastore.user.uuid;

        // call plugin
        window.FaceID.takeHeadshotPicture(headshot => {
          if (!headshot || headshot.length === 0) {
            reject();
          } else {
            let path: string = `public://${uuid}/headshot.png`;
            this.api.uploadImage(path, headshot).then(image => {
              resolve(image);
            }).catch(() => {
              reject();
            });
          }
        }, err => reject());
      }
    });
  }

  verifyHeadshot(): Promise<any> {
    return new Promise((resolve, reject) => {

      let name: string = this.form.get('name').value;
      let id: string = this.form.get('cardid').value;

      if (!this.headshot || !name || !id) {
        resolve(false);
        return;
      }

      if (this.platform.is('core')) {
        this.form.controls['huotijiance'].setValue("1");
        resolve(true);
        return;
      }

      this.api.verifyHeadshot(this.headshot, name, id).then(resp => {
        if (!resp || !_.has(resp, 'message.result_faceid.confidence')) {
          return resolve(false);
        }

        console.log(`Confidence: ${resp.message.result_faceid.confidence}`);

        if (resp.message.result_faceid.confidence >= 50) {
          this.form.controls['huotijiance'].setValue("1");
          resolve(true);
        } else {
          resolve(false);
        }

      }).catch(() => resolve(false));
    });
  }

  frontIDCardTapped() {
    if (this.profile && this.profile.isCompleted()) {
      return;
    }

    this.takeFrontIDCard()
      .then(image => {
        this.frontIDCard = image;
        return this.api.ocrIDCard(image);
      })
      .catch(() => {
        this.frontIDCardFailed()
      })
      .then(data => {
        if (!data || !_.has(data, 'code') || !_.has(data, 'message') || !_.has(data, 'message.name')) {
          return this.frontIDCardFailed();
        }

        this.form.controls['name'].setValue(data.message.name);
        this.form.controls['cardid'].setValue(data.message.id_card_number);

        this.verifyHeadshot().catch(() => this.ui.showAlert('活体检测失败'));
      })
      .catch(() => {
        this.frontIDCardFailed()
      });
  }

  takeFrontIDCard(): Promise<ImageFile> {
    return new Promise((resolve, reject) => {
      let image: ImageFile;

      if (this.platform.is('core')) {
        this.ui.showAlert("浏览器下，不支持拍照，使用默认图片。");

        image = this.api.datastore.createRecord(ImageFile, {
          fid: 19,
          uri: "public://lixu/sample-front-id-card.png",
          url: "/sites/default/files/lixu/sample-front-id-card.png",
          uuid: "1d29545c-180b-4156-b76b-5ac13da54d92"
        });

        image.id = image.uuid;

        resolve(image);
      } else {
        if (typeof window.FaceID == 'undefined') {
          this.ui.showAlert("未能找到FaceID插件，请重试。");
          reject();
          return;
        }

        // uuid
        const uuid: string = this.api.datastore.user.uuid;

        // call plugin
        window.FaceID.takeIDCardPicture(window.FaceID.ID_CARD.FRONT, image => {
          if (!image || image.length === 0) {
            reject();
          } else {
            let path: string = `public://${uuid}/front-id-card.png`;
            this.api.uploadImage(path, image).then(image => {
              resolve(image);
            }).catch(() => reject());
          }
        }, err => reject());
      }
    });
  }

  frontIDCardFailed() {
    this.frontIDCard = null;

    this.form.controls['name'].setValue('');
    this.form.controls['cardid'].setValue('');
    this.form.controls['xiangxidizhi'].setValue('');

    this.ui.showAlert('拍摄身份证失败，请重试。');
  }

  rearIDCardTapped() {
    if (this.profile && this.profile.isCompleted()) {
      return;
    }

    if (this.platform.is('core')) {
      this.ui.showAlert("浏览器下，不支持拍照，使用默认图片。");

      this.rearIDCard = this.api.datastore.createRecord(ImageFile, {
        fid: 19,
        uri: "public://lixu/sample-front-id-card.png",
        url: "/sites/default/files/lixu/sample-front-id-card.png",
        uuid: "1d29545c-180b-4156-b76b-5ac13da54d92"
      });

      this.rearIDCard.id = this.frontIDCard.uuid;

    } else {
      if (typeof window.FaceID == 'undefined') {
        this.ui.showAlert("未能找到FaceID插件，请重试。");
        return;
      }

      const uuid: string = this.api.datastore.user.uuid;

      // call plugin
      window.FaceID.takeIDCardPicture(window.FaceID.ID_CARD.REAR, image => {
        if (!image || image.length === 0) {
          this.ui.showAlert('拍摄身份证失败，请重试。');
        } else {
          let path: string = `public://${uuid}/rear-id-card.png`;
          this.api.uploadImage(path, image).then(image => {
            this.rearIDCard = image;
          }).catch(() => {
            this.ui.showAlert('上传图片失败，请重试。');
          });
        }
      }, err => {
        if (err != window.FaceID.ERROR_CANCEL) {
          this.ui.showAlert('拍摄身份证失败，请重试。');
        }
      });
    }
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
    this.code = event['region'].value;
    this.provinces=event.province.text;
  this.cities=event.city.text;
  this.districts=event.region.text;
    console.log(this.cityName) 

  }
}
