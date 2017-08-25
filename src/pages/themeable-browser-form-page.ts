import {Component} from '@angular/core';
import {FormPage} from './form-page';
import {ThemeableBrowser, ThemeableBrowserObject, ThemeableBrowserOptions} from "@ionic-native/themeable-browser";
import {Observable} from "rxjs/Observable";

@Component({
  template: `browser form page`
})
export class ThemeableBrowserFormPage extends FormPage {
  options: ThemeableBrowserOptions = {
    statusbar: {
      color: '#ffffffff'
    },
    toolbar: {
      height: 44,
      color: '#f0f0f0ff'
    },
    title: {
      color: '#003264ff',
      showPageTitle: true
    },
    customButtons: [
      {
        // wwwImage: 'assets/done.png',
        // wwwImagePressed: 'assets/done_pressed.png',
        align: 'right',
        event: 'done'
      }
    ],
    backButtonCanClose: false
  };
  themeableBrowser: ThemeableBrowser;
  themeableBrowserObject: ThemeableBrowserObject;

  ngOnInit(): void {
    super.ngOnInit();
    this.themeableBrowser = this.native.themeableBrowser;
  }

  public createBlankBrowser(url: string, ob?: any) {
    this.themeableBrowserObject = this.themeableBrowser.create(url, '_blank', this.options);
    this.themeableBrowserObject.on('done').forEach(event => {
      this.themeableBrowserEvent(event, ob);
    });
    this.themeableBrowserObject.on('loadstop').forEach(event => {
      this.themeableBrowserEvent(event, ob);
    });
  }

  public themeableBrowserEvent(event: any, ob?: any) {
    this.closeBrowser();
  }

  public closeBrowser() {
    this.themeableBrowserObject.close();
  }
}
