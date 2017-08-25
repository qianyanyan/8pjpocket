import {Injectable} from "@angular/core";

import {AlertController, Platform} from 'ionic-angular';
import {FileTransfer, FileTransferObject} from '@ionic-native/file-transfer';
import {File} from "@ionic-native/file";
import {Native} from "./native.service";
import {API} from "./api.service";
import {AppVersion} from "@ionic-native/app-version";
import {FileOpener} from "@ionic-native/file-opener";

@Injectable()
export class CheckUpdateService {

  constructor(public alert: AlertController,
              public platform: Platform,
              public transfer: FileTransfer,
              public native: Native,
              public file: File,
              public api: API,
              public appVersion: AppVersion,
              public fileOpener: FileOpener) {
  }

  public checkVersion() {
    let package_name = '', app_name = '',
      version_code = '', version_number = '';
    if (this.isMobile()) {
      this.appVersion.getPackageName().then((res) => {
        package_name = res;
        this.appVersion.getAppName().then((res) => {
          app_name = res;
          this.appVersion.getVersionNumber().then((res) => {
            version_number = res;
            this.appVersion.getVersionCode().then((res) => {
              version_code = res;
              this.api.http.post(`${this.api.baseUrl}bj_core/update`, {
                package_name: package_name,
                app_name: app_name,
                version_code: version_code,
                version_number: version_number
              }).subscribe(res => {
                let resp = res.json(), buttons = [];
                if (resp.level === 'force') {
                  buttons = [{
                    text: "立即升级",
                    handler: () => {
                      this.downloadApp(resp);
                    }
                  }];
                } else if (resp.level === 'normal') {
                  buttons = [
                    {text: "取消"},
                    {
                      text: "立即升级",
                      handler: () => {
                        this.downloadApp(resp);
                      }
                    }
                  ];
                }
                if (resp && resp.title && resp.desc) {
                  let alert = this.alert.create({
                    title: resp.title,
                    subTitle: resp.desc,
                    buttons: buttons,
                    enableBackdropDismiss: false
                  });
                  alert.present();
                }
              });
            });
          });
        });
      });
    }
  }

  downloadApp(data) {
    if (this.isAndroid()) {
      let alert = this.alert.create({
        title: "下载进度0%",
        enableBackdropDismiss: false,
      });
      alert.present();
      const fileTransfer: FileTransferObject = this.transfer.create();
      const apk = this.file.externalRootDirectory + 'android.apk';
      fileTransfer.download(data.android.url, apk).then(() => {
        this.fileOpener.open(apk, "application/vnd.android.package-archive").then(() => {

        }, () => {

        })
      });
      fileTransfer.onProgress((event: ProgressEvent) => {
        let num = Math.floor(event.loaded / event.total * 100);
        if (num === 100) {
          alert.dismiss();
        } else {
          let title = document.getElementsByClassName('alert-title')[0];
          title && (title.innerHTML = `下载进度${num}%`);
        }
      });
    } else if (this.isIos()) {
      this.openUrlByBrowser(data.ios.url);
    }
  }

  /**
   * 通过浏览器打开url
   */
  openUrlByBrowser(url: string): void {
    this.native.inAppBrowser.create(url, '_system');
  }

  /**
   * 是否真机环境
   * @return {boolean}
   */
  isMobile(): boolean {
    return this.platform.is('mobile') && !this.platform.is('mobileweb');
  }

  /**
   * 是否android真机环境
   * @return {boolean}
   */
  isAndroid(): boolean {
    return this.isMobile() && this.platform.is('android');
  }

  /**
   * 是否ios真机环境
   * @return {boolean}
   */
  isIos(): boolean {
    return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'));
  }
}
