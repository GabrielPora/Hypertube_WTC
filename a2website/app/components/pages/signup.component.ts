import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions, RequestMethod, Request, Response } from '@angular/http';
import { ModalComponent } 					from 'ng2-bs3-modal/ng2-bs3-modal';

const contentHeader = new Headers();
contentHeader.append('Accept', 'application/json');
contentHeader.append('Content-Type', 'application/json');

@Component({
  moduleId: module.id,
  selector: 'signup',
  templateUrl: 'signup.component.html'
})
export class SignupComponent {
    @ViewChild('modal')
    modal: ModalComponent;

    public errMessage = 'E-mail already in use.';

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
            .map(res => res.json())
            .subscribe(
                data => {
                    console.log('test');
                    console.log(data)
                },
                (error) => {
                    console.log(error);
                    this.errMessage = JSON.parse(error._body).err;
                    this.modal.open();
                }, 
                () => {
                    alert('Success');
                    this.router.navigate(['/login']);
                }
            );
    }
}