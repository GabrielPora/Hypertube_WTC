import { Component, OnInit, OnDestroy, ViewChild } 	from '@angular/core';
import { Router, ActivatedRoute }			from '@angular/router';
import { Http } 							from '@angular/http';
import { ModalComponent } 					from 'ng2-bs3-modal/ng2-bs3-modal';
import { AuthService } 						from '../services/auth.service';
import { Subscription } 					from 'rxjs';

@Component({
	moduleId: module.id,
	selector: 'login',
	templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
	@ViewChild('modal')
  	modal: ModalComponent;
	@ViewChild('42login')
	authInProgressModal: ModalComponent;

	private subscription: Subscription;
	private errMessage;

	constructor(private router: Router,
				private activatedRoute: ActivatedRoute, 
				private authService: AuthService) {}

	ngOnInit() {
		this.subscription = this.activatedRoute.queryParams.subscribe(
			(param: any) => {
				let code = param['code'];
				let access_tkn = param['access_token'];
				let facebook = param['facebook'];
				if (code !== undefined && facebook === undefined)
					this.login42(code);
				else if (facebook !== undefined && code !== undefined)
					this.loginFacebook(code);
			});
	}

	loginFacebook(tmp_token) {
		this.authInProgressModal.open();
		this.authService.loginFacebook(tmp_token)
			.subscribe(
				(result) => {
					console.log(result);
					if (result) {
						this.router.navigate(['/home']);
					} else {
						this.errMessage = "Error trying to log into facebook. Please try again later. Internal Server Error.";
						this.modal.open();
					}
				},
				(error) => {
					this.errMessage = "Error trying to log into facebook. Please try again later. Internal Server Error.";
					this.modal.open();
				}
			)
	}

	login42(tmp_token) {
		this.authInProgressModal.open();
		this.authService.login42(tmp_token)
			.subscribe(
				(result) => {
					console.log(result);
					if (result)
						this.router.navigate(['/home']);
					else {
						this.errMessage = "Internal Error in Server. We apologise for the inconvenience.";
						this.modal.open();
					}
				},
				(error) => {
					this.errMessage = "Internal Error in Server. We apologise for the inconvenience.";
					this.modal.open();
				}
			);
	}

	login(event, username, password) {
		event.preventDefault();
		console.log('Login Event');

		this.authService.login(username, password)
			.subscribe(
			(result) => {
				if (result.success) {
					this.router.navigate(['/home']);
				}
			},
			(error) => {
				var msg = JSON.parse(error._body);
				this.errMessage = msg.msg;
				this.modal.open();
			}
		);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}