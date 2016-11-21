import { Component, OnInit, OnDestroy, ViewChild } 	from '@angular/core';
import { Router, ActivatedRoute } 					from '@angular/router';
import { Http } 									from '@angular/http';
import { ModalComponent } 							from 'ng2-bs3-modal/ng2-bs3-modal';
import { AuthService } 								from '../services/auth.service';
import { Subscription } 							from 'rxjs';
import { MoviesService } from '../services/movies.service';

@Component({
	moduleId: module.id,
	selector: 'movie',
	providers: [MoviesService],
	styleUrls: ['./movie.style.css', './home.style.css'],
	templateUrl: 'movie.component.html'
})
export class MovieComponent implements OnInit, OnDestroy {
	private subscription: Subscription; 
	private user;

	/*Movie Variables*/
	private movieID;
	private entireMovie = null;
	private movieTorrents;
	private imdbCode;
	private movieQuality;

	private imdb = null;

	constructor(private auth: AuthService, 
				private router: Router,
				private activatedRoute: ActivatedRoute, 
				private authService: AuthService,
				public moviesService: MoviesService) {
		this.user = JSON.parse(localStorage.getItem('user'));
	}

	ngOnInit() {
		this.subscription = this.activatedRoute.queryParams.subscribe(
			(param: any) => {
				let code = param['mid'];
				if (code !== undefined){
					this.movieID = code;
					this.populateMovie(code);
				} else
					this.router.navigate(['/home']);
				this.movieQuality = param['quality'];
				if (this.movieQuality === undefined || this.movieQuality === null)
					this.movieQuality = '720p';
			});
	}

	populateMovie(mid) {
		this.moviesService.getMovie(mid)
			.subscribe(
				data => {
					console.log(data.data.movie);
					this.entireMovie = data.data.movie;
					this.movieTorrents = this.entireMovie.torrents;
					this.imdbCode = this.entireMovie.imdb_code;

					this.moviesService.getMovieIMDB(this.imdbCode)
						.subscribe(
							data => {
								this.imdb = data;
							},
							error => console.log(error),
							() => console.log("Loaded Imdb")
						);
				},
				error => console.log(error),
				() => console.log("Loaded Movie")
			);
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