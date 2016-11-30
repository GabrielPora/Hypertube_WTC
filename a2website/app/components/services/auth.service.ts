import { Injectable, Inject }   from '@angular/core';
import { Http, Headers }        from '@angular/http';

@Injectable()
export class AuthService {
    private LoggedIn;

    constructor(public http: Http) {
        this.LoggedIn = !!localStorage.getItem('auth_token');
    }

    login(username, password) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        
        return this.http
            .post('http://localhost:3001/api/authenticate',
                JSON.stringify({ username, password }),
                {headers})
            .map(res => res.json())
            .map(
                (res) => {
                    console.log(res);
                    if (res.success) {
                        localStorage.setItem('auth_token', res.token);
                        localStorage.setItem('user', res.user);
                        localStorage.setItem('account_type', res.type);
                        this.LoggedIn = true;
                    } else
                        return ({ success: res.success, msg: res.error })
                    return ({ success: res.success });
                }
            );

    }

    login42(tmp_token) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post('http://localhost:3001/api/exchange42',
                JSON.stringify({ tmp: tmp_token }),
                { headers })
            .map(res => res.json())
            .map((res) => {
                if (res.success) {
                    localStorage.setItem('auth_token', res.token);
                    localStorage.setItem('user', res.user);
                    localStorage.setItem('account_type', res.type);
                    this.LoggedIn = true;
                }
                return (res.success);
            });
    }

    loginFacebook(tmp_token) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http.
            post('http://localhost:3001/api/authenticateFacebook',
            JSON.stringify({ tmp: tmp_token }),
            { headers })
            .map(res => res.json())
            .map((res) => {
                if (res.success) {
                    localStorage.setItem('auth_token', res.token);
                    localStorage.setItem('user', res.user);
                    localStorage.setItem('account_type', res.type);
                    this.LoggedIn = true;
                }
                return (res);
            });
    }

    logout() {
        var user = JSON.parse(localStorage.getItem('user'));
        var url = 'http://localhost:3001/api/delete_token/' + user._id;
        this.http.delete(url)
            .subscribe(
                error => console.log(error),
                () => console.log('Deleted')
            );

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('account_type');
        this.LoggedIn = false;
    }

    isLoggedIn() {
        return (this.LoggedIn);
    }
}