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
import { MoviesService } 							from '../services/movies.service';
import { TranslateService } 						from '../translate/translate.service';

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
	private lang = "en";
	private subtitles = null;

	public MovieComments = null;

	constructor(private auth: AuthService, 
				private router: Router,
				private activatedRoute: ActivatedRoute, 
				private authService: AuthService,
				private moviesService: MoviesService,
				private _translate: TranslateService,
				private http: Http) {
		this.user = JSON.parse(localStorage.getItem('user'));
	}

	ngOnInit() {
		this.lang = this._translate.currentLang;
		this.subscription = this.activatedRoute.queryParams.subscribe(
			(param: any) => {
				let code = param['mid'];
				if (code !== undefined){
					this.movieID = code;
					this.populateMovie(code);
					this.loadComments(this.movieID);

					//Set the movie as viewed.
					const contentHeader = new Headers();
					contentHeader.append('Content-Type', 'application/json');
					contentHeader.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));
					var reqOptions = new RequestOptions({
						method: RequestMethod.Post,
						url: 'http://localhost:3001/api/viewed/' + this.movieID,
						headers: contentHeader
					});
					this.http.request(new Request(reqOptions))
						.map(res => res.json())
						.subscribe(
							data => console.log(data),
							error => console.log(error),
							() => console.log('Set as Viewed')
						);
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
					console.log('test');
					console.log(data.data.movie);
					this.entireMovie = data.data.movie;
					this.movieTorrents = this.entireMovie.torrents;
					this.imdbCode = this.entireMovie.imdb_code;

					this.populateSubtitles(this.imdbCode);

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

	populateSubtitles(mid) {
		console.log('Getting Subtitles for: ', mid);
		this.http.get('http://localhost:3001/api/movie_subtitles/' + mid + '/' + this.lang)
			.map(res => res.json())
			.subscribe(
				data => {
					console.log(data);
					this.subtitles = data.subs;
					console.log(this.subtitles);
				},
				error => console.log(error)
			);
	}

	logout() {
		this.auth.logout();
		this.router.navigate(['/login']);
		console.log('Logging You Out')
	}

	createComment(event, comment) {
		event.preventDefault();
		const contentHeader = new Headers();
		contentHeader.append('Accept', 'application/json');
		contentHeader.append('Content-Type', 'application/json');
		contentHeader.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));
		var requestOptions = new RequestOptions({
			method: RequestMethod.Post,
			url: 'http://localhost:3001/api/comments/' + this.movieID,
			headers: contentHeader,
			body: JSON.stringify({ comment: comment, created: new Date() })
		});
		this.http.request(new Request(requestOptions))
			.subscribe(
				data => console.log(data),
				error => console.log(error),
				() => {
					this.loadComments(this.movieID);
				}
			);
	}

	loadComments(movieID) {
		const contentHeader = new Headers();
		contentHeader.append('Accept', 'application/json');
		contentHeader.append('Content-Type', 'application/json');
		contentHeader.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));
		var requestOptions = new RequestOptions({
			method: RequestMethod.Get,
			url: 'http://localhost:3001/api/comments/' + this.movieID,
			headers: contentHeader
		});
		this.http.request(new Request(requestOptions))
			.map(res => res.json())
			.subscribe(
				data => {
					console.log(data.Comments);
					this.MovieComments = data.Comments;
				},
				error => console.log(error),
				() => console.log('Got Comments')
			);
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}
}