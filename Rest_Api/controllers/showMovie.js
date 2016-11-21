var fs =			require('fs');
var path =			require('path');
var Request = 		require('request');
var torrentStream = require('torrent-stream');

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
				path: path.resolve('movies')
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