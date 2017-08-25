import {Injectable} from '@angular/core';
import {Contacts} from '@ionic-native/contacts';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {ThemeableBrowser} from "@ionic-native/themeable-browser";


@Injectable()
export class Native {
  constructor(public contacts: Contacts, public inAppBrowser: InAppBrowser,public themeableBrowser: ThemeableBrowser) {
  }
}
