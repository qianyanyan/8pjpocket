import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { JsonApiDatastoreConfig, JsonApiDatastore, JsonApiModel } from 'angular2-jsonapi';

import { LoadingController, AlertController } from 'ionic-angular';

@Injectable()
export class UI
{
  constructor(
    public fb: FormBuilder,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController) {
  }

  showAlert(title: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: title,
        buttons: [{
          text: '好的',
          handler: () => {
            resolve();
          }
        }]
      });
      alert.present();
    });
  }
  titleAlert(val:string): Promise<any> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: '温馨提示',
        subTitle:val,
        enableBackdropDismiss:false,
        buttons: [{
          text: '已知悉',
         
          handler: () => {
            resolve();
          }
          

        }]
      });
      alert.present();
    });
  }
  presentLoading(observable: Observable<JsonApiModel | JsonApiModel[]>): Observable<JsonApiModel | JsonApiModel[]> {
    return Observable.create((ob) => {

      let loader = this.loadingCtrl.create({
        // content: "请稍等..."
      });

      loader.present();

      observable.subscribe(
        data => {
          loader.dismiss();
          ob.next(data);

          // let alert = this.alertCtrl.create({
          //   title: '提交成功',
          //   buttons: [{
          //     text: 'OK',
          //     handler: () => {
          //     }
          //   }]
          // });
          // alert.present();
        },
        error => {
          loader.dismiss();

          error = error ? error : "未知错误，请重试。";
          ob.error(error);
          // let alert = this.alertCtrl.create({
          //   title: error,
          //   buttons: [{
          //     text: '好的',
          //     handler: () => {
          //       ob.next(error);
          //     }
          //   }]
          // });

          // alert.present();
        }
      );
    });
  }

}
