var fs =			require('fs');
var url =			require('url');
var path =			require('path');
var http =			require('http');
var unzip =			require('unzip');
var YFsubs = 		require('yify-subs');
var Request = 		require('request');
var torrentStream = require('torrent-stream');

var supportedLanguages = ['en', 'fr', 'de'];

exports.getMovie = function (req, res) {
	if (req.params.mid) {
		var torrents;
		var magnet = "magnet:?xt=urn:btih:"

		var options = {
			method: 'GET',
			url: 'https://yts.ag/api/v2/movie_details.json?movie_id=' + req.params.mid
		};
		Request(options, function (err, response, body) {
			var movie = JSON.parse(body);
			torrents = movie.data.movie.torrents;
			console.log(req.params.quality);
			var index = 0;
			for (var i = 0; i < torrents.length; i++) {
				if (torrents[i].quality === req.params.quality)
					index = i;
			}
			magnet += torrents[index].hash;
			magnet += "&dn=" + escape(movie.data.movie.title_long);
			magnet += "&tr=udp://open.demonii.com:1337/announce";
			magnet += "&tr=udp://tracker.openbittorrent.com:80";
			magnet += "&tr=udp://tracker.coppersurfer.tk:6969";
			magnet += "&tr=udp://glotorrents.pw:6969/announce";
			//console.log(magnet);

			var engine = new torrentStream(magnet, {
				connections: 100,
				uploads: 10,
				verify: true,
				path: path.resolve('public/movies')
			});
			engine.on('ready', function () {
				engine.files.forEach(function (file) {
					var extension = path.extname(file.path)
					if (extension === '.mp4') {
						var stream = file.createReadStream();
						stream.pipe(res);
					}
				});
			});
		});
	}
}

exports.getMovieSubs = function (req, res) {
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	if (req.params.mid) {
		YFsubs.getSubs(req.params.mid).then(function (data) {
			var movieSubs = YFsubs.filter(data, supportedLanguages).subs;
			var zipFileUrl = movieSubs[req.params.lang][0].url;
			if (zipFileUrl === undefined) //If there are no subtitles for this lang, return default english.
				zipFileUrl = movieSubs['en'][0].url;
		
			var fileName = path.basename(url.parse(zipFileUrl).pathname);
			var fileStream = fs.createWriteStream(path.resolve('public/subtitles/' + fileName));
			http.get(zipFileUrl, function (response) {
				response.pipe(fileStream);
				fs.createReadStream(path.resolve('public/subtitles/' + fileName))
					.pipe(unzip.Parse())
					.on('entry', function (entry) {
						var fileName = entry.path;
						if (path.extname(fileName) === '.srt') {
							entry.pipe(res);
							//res.json({ success: true, filePath: 'http://localhost:3001'}); 
						} else {
							entry.autodrain();
						}					
					});
			});
		});
	}
}