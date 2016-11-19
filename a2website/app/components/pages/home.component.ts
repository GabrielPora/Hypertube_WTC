import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { MoviesService } from '../services/movies.service';
import { AuthService } from '../services/auth.service';

import 'rxjs/add/operator/map';

@Component({
  moduleId: module.id,
  providers: [ MoviesService ],
  styleUrls: [ './home.style.css' ],
  selector: 'home',
  templateUrl: 'home.component.html'
})
export class HomeComponent {
  @ViewChild('modal')
  modal: ModalComponent;

  private user;
  private currPage = 1;
  private viewMovies;
  private selectedMovie = null;

  constructor(public moviesService: MoviesService, 
              window: Window, 
              private auth: AuthService,
              private router: Router) {
    this.loadMovies(this.currPage);
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  loadMovies(page) {
    this.moviesService.getMovies(page)
      .subscribe(
        data => {
          this.viewMovies = data.data.movies;
          this.selectedMovie = this.viewMovies[0];
        },
        error => console.log(error),
        () => console.log(this.viewMovies)
      )
  }

  onScrollDown() {
    this.currPage += 1;
    this.moviesService.getMovies(this.currPage)
      .subscribe(
        data => {
          for (var i = 0; i < data.data.movies.length; i++) {
            this.viewMovies.push(data.data.movies[i]);
          }
          this.selectedMovie = this.viewMovies[0];
        },
        error => console.log(error),
        () => console.log(this.viewMovies)
      );
  }

  nextPage(scrollToTop = false) {
    this.currPage += 1;
    console.log('Going to Next Page: %d', this.currPage);
    this.loadMovies(this.currPage);
    if (scrollToTop) //possibly add animation to this process
        window.scrollTo(0, 0);
  }
  previousPage(scrollToTop = false) {
    if (this.currPage > 1){
      this.currPage -= 1;
      console.log('Going to Previous Page: %d', this.currPage);
      this.loadMovies(this.currPage);
      if (scrollToTop) //possibly add animation to this process
        window.scrollTo(0, 0);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
    console.log('Logging You Out')
  }

  viewMovie(movie) {
    this.selectedMovie = movie;
    this.modal.open();
  }

  playMovie() {
    this.modal.dismiss();
    console.log('goto Movie: %s', this.selectedMovie.title);
    this.selectedMovie = null;
  }
}