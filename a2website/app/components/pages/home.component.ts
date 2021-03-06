import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { MoviesService } from '../services/movies.service';
import { AuthService } from '../services/auth.service';
import { Http, Headers, RequestOptions, RequestMethod, Request, Response } from '@angular/http';

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

  @ViewChild('advSearch')
  advModal: ModalComponent;

  private user;
  private currPage = 1;
  private viewMovies;
  private selectedMovie = null;
  private selectedMovieViewed = null;
  private selectedTorrent = null;

  constructor(public moviesService: MoviesService, 
              window: Window, 
              private auth: AuthService,
              private router: Router,
              private http: Http) {
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
            if (this.viewMovies !== undefined)
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
    this.selectedTorrent = movie.torrents;

    const contentHeader = new Headers();
		contentHeader.append('Accept', 'application/json');
		contentHeader.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));
    this.http.get('http://localhost:3001/api/viewed/' + movie.id, { headers: contentHeader })
      .map(res => res.json())
      .subscribe(
        data => {
          if (data.success && data.viewed) {
            this.selectedMovieViewed = true;
          } else {
            this.selectedMovieViewed = false;
          }
          this.modal.open();
        },
        error => console.log(error),
        () => console.log('Got View')
      );
  }

  search(event, searchValue) {
    event.preventDefault();
    this.moviesService.searchBasic(searchValue)
      .subscribe(
        data => {
          this.viewMovies = data.data.movies;
          this.selectedMovie = this.viewMovies[0];
        },
        error => console.log(error),
        () => console.log(this.viewMovies)
      )
      console.log('Searched');
  }

  showAdv(event) {
    event.preventDefault();
    console.log('Open Advanced');
    this.advModal.open();
  }
  
  private searchURL = "";

  advSrch(event, query, genre1, genre2, genre3, quality, sortby) {
    event.preventDefault();
    console.log('Advanced Search', query, genre1, genre2, genre3, quality, sortby);
    
    if (query && query.length() > 0)
      this.searchURL += "&query_term=" + query;
    if (genre1 && genre1 !== "(Unselected)")
      this.searchURL += "&genre=" + genre1;
    if (genre2 && genre2 !== "(Unselected)")
      this.searchURL += "&genre=" + genre2;
    if (genre3 && genre3 !== "(Unselected)")
      this.searchURL += "&genre=" + genre3;
    if (quality && quality !== "(Unselected)")
      this.searchURL += "&quality=" + quality;
    if (sortby && sortby !== "(Unselected)")
      this.searchURL += "&sort_by=" + sortby;

    this.moviesService.searchAdvanced(this.searchURL)
      .subscribe(
        data => {
          this.viewMovies = data.data.movies;
          this.selectedMovie = this.viewMovies[0];
        },
        error => console.log(error),
        () => console.log(this.viewMovies)
      )
      console.log('Searched');
      this.searchURL = "";
  }
}