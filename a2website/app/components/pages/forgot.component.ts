import { Component, ViewChild } 			from '@angular/core';
import { Http, Headers, RequestOptions, RequestMethod, Request, Response } from '@angular/http';
import { ModalComponent } 					from 'ng2-bs3-modal/ng2-bs3-modal';
import { Router } 							from '@angular/router';

@Component({
	moduleId: module.id,
	selector: 'forgot',
	templateUrl: 'forgot.component.html'
})
export class ForgotComponent {
	@ViewChild('modal')
	modal: ModalComponent;
	private errMessage;

	constructor(private router: Router,
		private http: Http) {
	}

	submitFrg(event, email) {
		event.preventDefault();

		const contentHeader = new Headers();
		contentHeader.append('Accept', 'application/json');
		contentHeader.append('Content-Type', 'application/json');

		var requestOptions = new RequestOptions({
			method: RequestMethod.Post,
			url: 'http://localhost:3001/api/forgot',
			headers: contentHeader,
			body: JSON.stringify({ email })
		});
		this.http.request(new Request(requestOptions))
			.map((res) => res.json())
			.subscribe(
				(res) => {
					if (res.success) {
						this.errMessage = "An E-mail has been sent with reset instructions.";
						this.modal.open();
					} else if (!res.success && res.error) { 
						this.errMessage = res.error;
						this.modal.open();
					}
				},
				error => alert(error)
			);
	}
}