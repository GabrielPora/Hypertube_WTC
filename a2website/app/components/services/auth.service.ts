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

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('account_type');
        this.LoggedIn = false;
    }

    isLoggedIn() {
        return (this.LoggedIn);
    }
}