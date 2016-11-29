var fs =			require('fs');
var url =			require('url');
var path =			require('path');
var http =			require('http');
var unzip =			require('unzip');
var YFsubs = 		require('yify-subs');
var srt2vtt =		require('srt2vtt');
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
			magnet += "&dn=" + encodeURIComponent(movie.data.movie.title_long);
			magnet += "&tr=udp://open.demonii.com:1337/announce";
			magnet += "&tr=udp://tracker.openbittorrent.com:80";
			magnet += "&tr=udp://tracker.coppersurfer.tk:6969";
			magnet += "&tr=udp://glotorrents.pw:6969/announce";
			console.log(magnet);

			var engine = new torrentStream(magnet, {
				connections: 100,
				uploads: 10,
				verify: true,
				path: path.resolve('public/movies'),
				trackers: [
					'udp://tracker.opentrackr.org:1337/announce',
					'udp://torrent.gresille.org:80/announce',
					'udp://p4p.arenabg.com:1337',
					'udp://tracker.leechers-paradise.org:6969'
				]
			});
			engine.on('ready', function () {
				engine.files.forEach(function (file) {
					var extension = path.extname(file.path)
					if (extension === '.mp4' || extension === '.mkv' || extension === '.avi') {
						var stream = file.createReadStream();
						console.log('Return Stream');
						stream.pipe(res);
					}
				});
			});
		});
	}
}

exports.getSubtitle = function (req, res) {
	if (req.params.lang && req.params.mid) {
		var sub = path.resolve('public/subtitles/' + req.params.lang + '/' + req.params.mid + '.vtt');
		res.sendFile(sub);
	}
}

exports.getMovieSubs = function (req, res, next) {
	console.log('\n\n\n');

	var availableSubs = [];
	if (req.params.mid) {
		YFsubs.getSubs(req.params.mid).then(function (data) {
			var allLangs = YFsubs.filter(data, supportedLanguages).subs;
			for (var i = 0; i < supportedLanguages.length; i++) {
				if (allLangs[supportedLanguages[i]] !== undefined) {
					var sub = { languageCode: supportedLanguages[i],
								Language: YFsubs.getlanguageName(supportedLanguages[i]),
								zipUrl: allLangs[supportedLanguages[i]][0].url,
								clientUrl: 'http://localhost:3001/api/subtitles/' + supportedLanguages[i] + '/' + req.params.mid };
					availableSubs.push(sub);
				}
			}
			res.json({ success: true, subs: availableSubs });
			console.log('after response');
			downloadSubs(req.params.mid, availableSubs);			
		});
	}
}

function downloadSubs(mid, avSubs) {
	avSubs.forEach(function (lang) {
		http.get(lang.zipUrl, function (zipResponse) {
			zipResponse.pipe(unzip.Parse())
				.on('entry', function (srtEntry) {
					let buffer = [];
					if (path.extname(srtEntry.path) === '.srt') {
						srtEntry.on('data', data => buffer.push(data));
						srtEntry.on('end', () => {
							srt2vtt(Buffer.concat(buffer), function (err, vttData) {
								if (err) throw new Error(err);
								fs.writeFileSync(path.resolve('public/subtitles/' + lang.languageCode + '/' + mid + '.vtt'), vttData);
							});
						});
					}
				});
		});
	});		
}