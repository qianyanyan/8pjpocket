import {Component} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';

import {Page} from './page';

@Component({
  template: `form page`
})
export class FormPage extends Page {
  form: FormGroup;

  ngOnInit(): void {
    this.form = this.buildForm();
    this.loadForm();
  }

  buildForm(): FormGroup {
    return this.ui.fb.group({});
  }

  saveForm(): Observable<any> {
    return Observable.empty();
  }

  loadForm(): void {

  }

  onSaveSuccess(response: any): void {
    this.navCtrl.popToRoot();
  }

  onSaveError(error: any): void {
    console.log(123222);
  }

  onSubmit() {
    if (this.form.status != 'VALID') {
      return;
    }

    this.ui.presentLoading(this.saveForm()).subscribe(
      response=>this.onSaveSuccess(response),
      error=>this.onSaveError(error)
    );
  }

}
