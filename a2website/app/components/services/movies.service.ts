import { Injectable }                               from '@angular/core';
import { Http, Response, Headers, RequestOptions }  from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class MoviesService {
    constructor(private http: Http) {
    }

    private getMoviesUrl = "https://yts.ag/api/v2/list_movies.json";

    getMovies(page) {
        var url = this.getMoviesUrl + "?page=" + page.toString();
        return this.http.get(url)
            .map((res:Response) => res.json());
    }
}