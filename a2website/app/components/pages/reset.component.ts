import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http, Headers, RequestOptions, RequestMethod, Request, Response } from '@angular/http';
import { Subscription } from 'rxjs';

const contentHeader = new Headers();
contentHeader.append('Accept', 'application/json');
contentHeader.append('Content-Type', 'application/json');

@Component({
  moduleId: module.id,
  selector: 'reset',
  templateUrl: 'reset.component.html'
})
export class ResetComponent implements OnInit, OnDestroy {
	@ViewChild('modal')
	modal: ModalComponent;
	private token;
	private errMessage;
	private subscription: Subscription;

    constructor (public router: Router, 
				public http: Http,
				private activatedRoute: ActivatedRoute) {
    }

	ngOnInit() {
		this.subscription = this.activatedRoute.queryParams.subscribe(
			(param: any) => {
				let code = param['token'];
				if (code !== undefined)
					this.token = code;
				else
					this.router.navigate(['/login']);
			});
	}

	submitRst(event, password, confpwd) {
		event.preventDefault();

		if (password !== confpwd) {
			this.errMessage = "Password Mismatch, please make sure they are the same";
			this.modal.open();
		}

		const contentHeader = new Headers();
		contentHeader.append('Accept', 'application/json');
		contentHeader.append('Content-Type', 'application/json');

		var requestOptions = new RequestOptions({
			method: RequestMethod.Post,
			url: 'http://localhost:3001/api/reset',
			headers: contentHeader,
			body: JSON.stringify({ password: password, token: this.token })
		});
		this.http.request(new Request(requestOptions))
			.map((res) => res.json())
			.subscribe(
				(res) => {
					if (res.success) {
						this.router.navigate(['/login']);
					} else if (!res.success && res.error) { 
						this.errMessage = res.error;
						this.modal.open();
					}
				},
				error => alert(error)
			);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}