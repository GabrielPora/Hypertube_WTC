import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Http, Headers, RequestOptions, RequestMethod, Request, Response } from '@angular/http';

@Component({
  moduleId: module.id,
  selector: 'profile',
  styleUrls: ['./home.style.css'],
  templateUrl: 'profile.component.html'
})
export class ProfileComponent {
  private account_type;
  private user;

  constructor(private auth: AuthService,
              private router: Router,
              private http: Http) {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.account_type = localStorage.getItem('account_type');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    console.log('Logging You Out')
  }

  update(event, username, firstName, lastName, email, password, confirmPassword) {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert('Password do not match!');
      return ;
    }
    const contentHeader = new Headers();
    contentHeader.append('Accept', 'application/json');
    contentHeader.append('Content-Type', 'application/json');
    contentHeader.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));
    var requestOptions = new RequestOptions({
        method: RequestMethod.Put,
        url: 'http://localhost:3001/api/user',
        headers: contentHeader,
        body: JSON.stringify({ username, firstName, lastName, email, password })
    });
    this.http.request(new Request(requestOptions))
      .subscribe(
        data => console.log(data),
        error => console.log(error),
        () => {
          alert('Success');
        }
      );
    console.log('Update Request');
  }

  uploadImage(event) {
    event.preventDefault();
    let fileList: FileList = event.target.files;
    if (fileList.length == 1) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      formData.append('uploadFile', file, file.name);

      const contentHeader = new Headers();
      contentHeader.append('Accept', 'application/json');
      contentHeader.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

      let requestOptions = new RequestOptions({ headers: contentHeader });
      this.http.post('http://localhost:3001/api/upload_image', formData, requestOptions)
        .map(res => res.json())
        .subscribe(
          data => {
            this.user.image_link = data.img_link;
          },
          error => console.log(error)
        );
    }
    console.log(fileList);
  }
}