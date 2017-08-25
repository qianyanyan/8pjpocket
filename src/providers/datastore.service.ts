import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {JsonApiDatastoreConfig, JsonApiDatastore, JsonApiModel, ModelType, JsonApiQueryData} from 'angular2-jsonapi';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {Storage} from '@ionic/storage';

import * as M from '../app/app.models';
import {StorageConfig} from "../app/app.models";
// http://192.168.4.70/
// http://test2.8jpocket.com/bjipa/
@Injectable()
@JsonApiDatastoreConfig({
  baseUrl: 'https://8jpocket.com/bjipa/',
  // baseUrl: 'http://test2.8jpocket.com/bjipa/',
  models: {
    'user--user': M.User,
    'profile--mobile_operator': M.MobileOperatorProfile,
    'profile--personal_information': M.PersonalInformationProfile,
    'field_storage_config--field_storage_config': M.StorageConfig,
    'profile--bankcard': M.BankCardProfile,
    'file--image': M.ImageFile,
    'node--loan': M.Loan,
    'node--payment': M.Payment
  }
})
export class Datastore extends JsonApiDatastore {

  user: M.User;

  // userLoaded: boolean = false;

  constructor(http: Http, public storage: Storage) {
    super(http);

    // this.headers = new Headers({
    //   'Content-Type': 'application/vnd.api+json',
    //   'Authorization': 'Basic OGpwb2NrZXQ6OGpwb2NrZXQ=',
    //   'Accept': 'application/vnd.api+json'
    // });

    // this.user = this.createRecord(M.User, {
    //   uuid: 'fcaa6437-a590-4810-bd8b-45547a919b33',
    //   name: '15201917382',
    //   token: btoa('15201917382:123456789')
    // });

    // this.user.id = '1ebae0a1-3e33-4745-94a0-4374361720d2';

  }

  setHeaders(headers: Headers) {
    this.headers = headers;
  }

  // loadUser(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     if (this.userLoaded) {
  //       resolve();
  //       return ;
  //     }

  //     this.userLoaded;

  //     this.storage.get("user").then(
  //       data => {
  //         if (!data) {
  //           resolve();
  //           return ;
  //         }

  //         data = JSON.parse(data);
  //         if (!data || !("uuid" in data) || !("token" in data)) {
  //           resolve();
  //           return ;
  //         }

  //         this.user = this.createRecord(M.User, {
  //           uuid: data.uuid
  //         });

  //         this.user.id = data.uuid;
  //         this.user.token = data.token;

  //         resolve();
  //       },

  //       err => resolve()
  //     ).catch(
  //       err => resolve()
  //     );
  //   });
  // }

  // set user(user: M.User) {
  //   this.storage.set("user", JSON.stringify({
  //     uuid: user.uuid,
  //     token: user.token
  //   }));
  // }

  findStorageConfig<T extends StorageConfig>(id: string): Promise<T> {
    return new Promise(((resolve, reject) => {
      this.findRecord(StorageConfig, id).subscribe(
        (res: StorageConfig) => {
          resolve(res);
        }, err => {
          resolve(null)
        });
    }))
  }

  findLatestOneForUser<T extends JsonApiModel>(user: M.User, type: ModelType<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!user.uuid) {
        resolve(null);
        return;
      }

      this.findAll(type, {
        filter: {
          "uid.uuid": {
            value: user.uuid
          }
        },
        sort: "created",
        page: {limit: 1}
      }).subscribe(
        (res: JsonApiQueryData<T>) => {
          if (res.getModels().length > 0) {
            resolve(res.getModels()[0]);
          } else {
            resolve(null);
          }
        },
        err => resolve(null)
      );
    });
  }

  findWithId<T extends JsonApiModel>(type: ModelType<T>, id?,params?): Promise<T> {
    return new Promise(((resolve, reject) => {
      this.findRecord(type, id,params).subscribe((res: JsonApiModel) => {
        resolve(res);
      }, err => reject(err));
    }));
  }

  findRecordForCurrentUserWith<T extends JsonApiModel>(type: ModelType<T>, withString?: String,withPic?: any): Promise<T> {
    return new Promise(((resolve, reject) => {
      if (!this.user) {
        resolve(null);
      }

      this.findAll(type, {
        filter: {
          "uid.uuid": {
            value: this.user.uuid
          }
        },
        sort: "created",
        page: {limit: 1},
        // include: withString , withPic,
       include: withString,

      }).subscribe((res: JsonApiQueryData<T>) => {
        if (res.getModels().length > 0) {
          resolve(res.getModels()[0]);
        } else {
          resolve(null);
        }
      }, err => reject(err));
    }));
  }

  findUnlimitForCurrentUser<T extends JsonApiModel>(type: ModelType<T>, filter?: Object): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.user) {
        resolve(null);
        return;
      }

      filter = filter ? filter : {};
      filter["uid.uuid"] = {value: this.user.uuid};

      this.findAll(type, {
        filter: filter,
        sort: "created",
        page: {limit: 1},
      }).subscribe(
        (res: JsonApiQueryData<T>) => {
          if (res.getModels().length > 0) {
            resolve(res.getModels()[0]);
          } else {
            resolve(null);
          }
        },
        err => resolve(null)
      );
    });
  }

  findOneForCurrentUser<T extends JsonApiModel>(type: ModelType<T>, filter?: Object): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.user) {
        resolve(null);
        return;
      }

      filter = filter ? filter : {};
      filter["uid.uuid"] = {value: this.user.uuid};

      this.findAll(type, {
        filter: filter,
        page: {limit: 1}
      }).subscribe(
        (res: JsonApiQueryData<T>) => {
          if (res.getModels().length > 0) {
            resolve(res.getModels()[0]);
          } else {
            resolve(null);
          }
        },
        err => resolve(null)
      );
    });
  }

  findLatestOneForCurrentUser<T extends JsonApiModel>(type: ModelType<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.user) {
        resolve(null);
        return;
      }

      this.findLatestOneForUser(this.user, type).then(
        (model: T) => resolve(model),
        err => reject(err)
      );
    });
  }

  saveForUser<T extends JsonApiModel>(user: M.User, instance: T): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!user.uuid) {
        resolve(null);
        return;
      }

      instance.uid = user;

      instance.save().subscribe(
        data => resolve(data),
        err => reject(err)
      );
    });
  }

  saveForCurrentUser<T extends JsonApiModel>(instance: T): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.user) {
        resolve(null);
        return;
      }

      this.saveForUser(this.user, instance).then(
        (model: T) => resolve(model),
        // err => reject(err)
        err => {
          resolve(err)
        }
      );
    });
  }

  saveKeyValue<T extends String>(key: string, instance: T): Promise<boolean> {
    return new Promise(((resolve, reject) => {
      this.readyStorage().then((a) => {
        this.storage.set(key, instance).then((a) => {
          resolve(true);
        }, (b) => {
          reject(false);
        });
      });
    }));
  }

  saveKeyObject<T extends Object>(key: string, instance: T): Promise<T> {
    return new Promise(((resolve, reject) => {
      this.saveKeyValue(key, JSON.stringify(instance)).then((a) => {
        resolve(a);
      }, (b) => {
        reject(b);
      });
    }));
  }

  readyStorage() {
    return this.storage.ready();
  }

  getValueByKey<T extends string>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.readyStorage().then(() => {
        this.storage.get(key).then((val) => {
          resolve(val);
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  }

  getObjectByKey<T extends Object>(key: string): Promise<T> {
    return new Promise(((resolve, reject) => {
      this.getValueByKey(key).then((val) => {
        resolve(JSON.parse(val));
      }, (val) => {
        reject(val);
      })
    }));
  }

  removeByKey<T extends string>(key: string): Promise<boolean> {
    return new Promise(((resolve, reject) => {
      this.readyStorage().then(() => {
        this.storage.remove(key).then(() => {
          resolve(true);
        }, () => {
          resolve(false)
        });
      }, () => {
        reject(false);
      });
    }));
  }

  clearStorage(): Promise<boolean> {
    return new Promise(((resolve, reject) => {
      this.readyStorage().then(() => {
        this.storage.clear().then((a) => {
          resolve(true);
        }, (b) => {
          resolve(false);
        });
      }, () => {
        reject(false)
      });
    }));
  }

}
