import { Injectable }                               from '@angular/core';
import { Http, Response, Headers, RequestOptions }  from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class MoviesService {
    constructor(private http: Http) {
    }

    private getMoviesUrl = "https://yts.ag/api/v2/list_movies.json";
    private getMovieUrl = "https://yts.ag/api/v2/movie_details.json?movie_id=";
    private getMovieImdbUrl = "http://www.omdbapi.com/?plot=full&r=json&i=";

    getMovies(page) {
        var url = this.getMoviesUrl + "?page=" + page.toString();
        return this.http.get(url)
            .map((res:Response) => res.json());
    }

    getMovie(mid) {
        var url = this.getMovieUrl + mid.toString();
        return this.http.get(url)
            .map((res:Response) => res.json());
    }

    getMovieIMDB(imdb_code) {
        var url = this.getMovieImdbUrl + imdb_code.toString();
        return this.http.get(url)
            .map((res: Response) => res.json());
    }
}