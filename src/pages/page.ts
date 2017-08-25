import {Component} from '@angular/core';
import {NavController, NavParams, AlertController, Events} from 'ionic-angular';
import {UI} from '../providers/ui.service';
import {API} from '../providers/api.service';
import {Native} from '../providers/native.service';
import {Datastore} from '../providers/datastore.service';
@Component({
  template: `page`
})
export class Page {
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public datastore: Datastore,
              public api: API,
              public native: Native,
              public ui: UI,
              public events: Events) {
    let that = this;
    this.registerEvents.forEach(function (value, index, array) {
      that.events.subscribe(value, function () {
        that.handleEvents(value,arguments)
      });
    });
  }

  //订阅事件
  protected registerEvents = [
    'user:logged:in',
    'user:log:out',
    'user:repayment',
    'user:payment'
  ];

  //分发事件
  handleEvents(name: string, ...arg): void {

  }

  redirectToLoginIfNotAuthenticated() {
    // return Observable.timer(3000).toPromise();
    return true;
  }
}
