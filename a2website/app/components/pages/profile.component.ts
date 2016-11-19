import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
              private router: Router) {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.account_type = localStorage.getItem('account_type');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    console.log('Logging You Out')
  }
}