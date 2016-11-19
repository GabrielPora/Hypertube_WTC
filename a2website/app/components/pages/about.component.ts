import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Component({
  moduleId: module.id,
  selector: 'about',
  styleUrls: ['./home.style.css'],
  templateUrl: 'about.component.html'
})
export class AboutComponent {
  private user;

  constructor(private auth: AuthService, private router: Router) {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    console.log('Logging You Out')
  }
}