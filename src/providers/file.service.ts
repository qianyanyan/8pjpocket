import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
 
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FileService
{
  private headers = new Headers({
    'Content-Type': 'application/vnd.api+json',
    'Authorization': 'Basic OGpwb2NrZXQ6OGpwb2NrZXQ=',
    'Accept': 'application/vnd.api+json'
  });

  constructor(private http: Http) { }
 
  upload(file, path): any {
    var data = {
      data: {
        type: "file--image",
        attributes: {
          data: file,
          uri: "public://" + path
        }
      }
    };

    return this.http
      .post("http://test2.8jpocket.com/jsonapi/file/image", data, {headers: this.headers})
      .toPromise()
      .then(res => res.json().data)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
