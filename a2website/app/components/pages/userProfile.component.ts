import { Component, OnInit, OnDestroy, ViewChild } 	from '@angular/core';
import { Router, ActivatedRoute } 					from '@angular/router';
import { Http, 
			Headers, 
			RequestOptions, 
			RequestMethod,
			Request, 
			Response } 								from '@angular/http';
import { ModalComponent } 							from 'ng2-bs3-modal/ng2-bs3-modal';
import { AuthService } 								from '../services/auth.service';
import { Subscription } 							from 'rxjs';

@Component({
	moduleId: module.id,
	selector: 'userProfile',
	styleUrls: ['./home.style.css'],
	templateUrl: 'userProfile.component.html'
})
export class UserProfile implements OnInit, OnDestroy {
	private subscription: Subscription; 
	private user;
	private viewUser = null;

	constructor(private auth: AuthService, 
				private router: Router,
				private activatedRoute: ActivatedRoute, 
				private authService: AuthService,
				private http: Http) {
		this.user = JSON.parse(localStorage.getItem('user'));
	}

	ngOnInit() {
		const contentHeader = new Headers();
		contentHeader.append('Accept', 'application/json');
		contentHeader.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));
		this.subscription = this.activatedRoute.queryParams.subscribe(
			(param: any) => {
				let username = param['username'];
				if (username !== undefined) {
					this.http.get('http://localhost:3001/api/user/' + username, { headers: contentHeader})
						.map(res => res.json())
						.subscribe(
							data => {
								if (!data.success)
									this.router.navigate(['/home']);
								this.viewUser = data.user;
								console.log(this.viewUser);
							},
							error => console.log(error),
							() => console.log('Got User')
						);
				}// else
				//	this.router.navigate(['/home']);
			});
		
	}

	logout() {
		this.auth.logout();
		this.router.navigate(['/login']);
		console.log('Logging You Out')
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}