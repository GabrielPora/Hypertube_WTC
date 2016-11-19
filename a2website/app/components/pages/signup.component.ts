import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions, RequestMethod, Request, Response } from '@angular/http';

const contentHeader = new Headers();
contentHeader.append('Accept', 'application/json');
contentHeader.append('Content-Type', 'application/json');

@Component({
  moduleId: module.id,
  selector: 'signup',
  templateUrl: 'signup.component.html'
})
export class SignupComponent {
    constructor (public router: Router, public http: Http) {
    }

    signup (event, username, firstName, lastName, email, password, confirmPassword) {
        event.preventDefault();
        if (password !== confirmPassword){
            alert('Password do not match!');
            return;
        }
        var requestOptions = new RequestOptions({
            method: RequestMethod.Post,
            url: 'http://localhost:3001/api/users',
            headers: contentHeader,
            body: JSON.stringify({ username, firstName, lastName, email, password })
        });
        this.http.request(new Request(requestOptions))
            .subscribe(
                data => console.log(data),
                Error => console.log(Error), //Handle errors better, dialog
                () => {
                    alert('Success');
                    this.router.navigate(['/login']);
                }
            );
    }
}