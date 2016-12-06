var Request = require('request');
var User = require('../models/user.js');
var Token = require('../models/token.js');
var jwt = require('jwt-simple');
var Config = require('../config/database.js');

var functions = {
	authenticate: function (req, res) {
		User.findOne({
			email: req.body.username
		}, function (err, user) {
			if (err) throw err;
			if (!user) {
				return res.status(403).send({ success: false, msg: 'Authenticaton failed, user not found.' });
			} else {
				user.verifyPassword(req.body.password, function (err, isMatch) {
					if (isMatch && !err) {
						var access_token = jwt.encode(user, Config.secret);

						var nToken = new Token({
							account_type: 'local',
							token: access_token,
							user_id: user._id
						});
						nToken.save(function (err) {
							if (err && err.code === 11000)
								res.json({ success: true, token: access_token, type: 'local', user: JSON.stringify(user) });
							else if (err) {
								console.log(err);
								res.json({success: false, msg: 'An error has occured while trying to log in.'});
							} else {
								res.json({ success: true, token: access_token, type: 'local', user: JSON.stringify(user) });
							}
						});
					} else {
						return res.status(403).send({ success: false, msg: 'Authenticaton failed, wrong password.' });
					}
				})
			}
		});
	},
	authenticate42: function (req, res) {
		if (req.body.tmp) {
			var options = {
				method: 'POST',
				url: 'https://api.intra.42.fr/oauth/token',
				headers: {
					'content-type': 'multipart/form-data'
				},
				formData: {
					grant_type: 'authorization_code',
					client_id: 'cf355a16a80ff46f91915c6ac4a1ec20ed7cb9f8b45a77ebe9878953f012a673',
					client_secret: '5c9933b5805925398770e300ebea8247a12e6ea4a38a9c6e950b69e34e0a609a',
					redirect_uri: 'http://localhost:3000/login',
					code: req.body.tmp
				}
			}
			Request(options, function (err, response, body) {
				var jsonResponse = JSON.parse(body);
				if (jsonResponse.error) {
					console.log(jsonResponse.error_description);
					res.status(200).send({ success: false, msg: 'Authenticaton Failed.', err: jsonResponse.error_description });
				}
				else {
					//console.log("Access Token: %s", jsonResponse.access_token);
					var myDetailsOptions = {
						method: 'GET',
						url: 'https://api.intra.42.fr/v2/me',
						headers: {
							authorization: 'Bearer ' + jsonResponse.access_token
						}
					};
					Request(myDetailsOptions, function (myError, myResponse, myBody) {
						var myUser = JSON.parse(myBody);
						User.findOne({ email: myUser.email }, function (err, regUser) {
							if (err)
								res.json({success: false, msg: 'Error occured checking for existing user.'});
							if (regUser) {
								var nToken = new Token({
									account_type: '42',
									token: jsonResponse.access_token,
									user_id: regUser._id
								});
								nToken.save(function (err) {
									if (err && err.code === 11000) {
										res.json({ success: true, token: jsonResponse.access_token, type: '42', user: JSON.stringify(regUser) });
									} else if (err) {
										console.log(err);
										res.json({ success: false, msg: 'Another error has occured.' });
									} else {
										res.json({ success: true, token: jsonResponse.access_token, type: '42', user: JSON.stringify(regUser) });
									}
								});
							} else {
								var newUser = new User({ 
									username: myUser.login,
									firstName: myUser.first_name,
									lastName: myUser.last_name,
									email: myUser.email,
									image_link: myUser.image_url,
									password: '8a5b9f7ca36f753574f45'
								});
								newUser.save(function (err) {
									if (err) {
										res.json({ success: false, msg: 'Error occured creating new user'});
									} else {
										var nToken = new Token({
											account_type: '42',
											token: jsonResponse.access_token,
											user_id: newUser._id
										});
										nToken.save(function (err) {
											if (err && err.code === 11000) {
												res.json({ success: true, token: jsonResponse.access_token, type: '42', user: JSON.stringify(newUser) });
											} else if (err) {
												console.log(err);
												res.json({ success: false, msg: 'Another error has occured.' });
											} else {
												res.json({ success: true, token: jsonResponse.access_token, type: '42', user: JSON.stringify(newUser) });
											}							
										});
									}									
								});
							}
						});
					});
				}
			});
		}
	},
	authenticateFacebook: function (req, res) {
		console.log('Logging in via Facebook');
		if (req.body.tmp) {
			var options = {
				method: 'GET',
				url: 'https://graph.facebook.com/v2.8/oauth/access_token?' +
					'client_id=1555593181123503' + 
					'&redirect_uri=' + encodeURIComponent('http://localhost:3000/login?facebook=true') + 
					'&client_secret=be75bbb37aa6b09f6752c4b2d436040c' + 
					'&code=' +req.body.tmp
			};
			Request(options, function (err, response, body) {
				var jsonBody = JSON.parse(body);
				if (jsonBody.error) {
					console.log(jsonBody.error.message);
					res.status(200).send({ success: false, msg: 'Authenticaton Failed.', err: jsonBody.error.message });
				} else {
					console.log(jsonBody.access_token);
					var myDetailsOptions = {
						method: 'GET',
						url: 'https://graph.facebook.com/v2.8/me?fields=id,name,picture,email',
						headers: {
							authorization: 'Bearer ' + jsonBody.access_token
						}
					}
					Request(myDetailsOptions, function (err, response, myBody) {
						var myUser = JSON.parse(myBody);
						User.findOne({ email: myUser.email }, function (err, thisUser) {
							if (err)
								res.json({success: false, msg: 'Error occured checking for existing user.'});
							if (thisUser) {
								var nToken = new Token({
									account_type: 'FB',
									token: jsonBody.access_token,
									user_id: thisUser._id
								});
								nToken.save(function (err) {
									if (err && err.code === 11000) {
										res.json({ success: true, token: jsonBody.access_token, type: 'FB', user: JSON.stringify(thisUser) });
									} else if (err) {
										console.log(err);
										res.json({ success: false, msg: 'Another error has occured.' });
									} else {
										res.json({ success: true, token: jsonBody.access_token, type: 'FB', user: JSON.stringify(thisUser) });
									}
								});
							} else {
								var newUser = new User({ 
									username: myUser.name,
									firstName: myUser.name.split(' ')[0],
									lastName: myUser.name.split(' ')[1],
									email: myUser.email,
									image_link: myUser.picture.data.url,
									password: '8a5b9f7ca36f753574f459622473300GimlZAnt2bgp'
								});
								newUser.save(function (err) {
									if (err) {
										res.json({ success: false, msg: 'Error occured creating new user'});
									} else {
										var nToken = new Token({
											account_type: 'FB',
											token: jsonBody.access_token,
											user_id: newUser._id
										});
										nToken.save(function (err) {
											if (err && err.code === 11000) {
												res.json({ success: true, token: jsonBody.access_token, type: 'FB', user: JSON.stringify(newUser) });
											} else if (err) {
												console.log(err);
												res.json({ success: false, msg: 'Another error has occured.' });
											} else {
												res.json({ success: true, token: jsonBody.access_token, type: 'FB', user: JSON.stringify(newUser) });
											}							
										});
									}									
								});
							}
						});
					});
				}
			});
		}
	},
	authenticateGoogle: function (req, res) {
		console.log('Logging in via Google.');
		if (req.body.tmp) {
			var options = {
				method: 'POST',
				url: 'https://accounts.google.com/o/oauth2/token',
				form: {
					code: req.body.tmp,
					client_id: '719285471351-auffvf1rp7ktf8eqgjkednkl7fmqnj02.apps.googleusercontent.com',
					client_secret: 'WGYNpVEIUHR-ow5QRelKWD4p',
					redirect_uri: 'http://localhost:3000',
					grant_type: 'authorization_code'
				}
			}
			Request(options, function (err, response, body) {
				if (err) return console.error("Error occured: ", err);
                var results = JSON.parse(body);
                if (results.error) return console.error("Error returned from Google: ", results.error);
				var myOptions = {
					method: 'GET',
					url: 'https://www.googleapis.com/oauth2/v1/userinfo',
					headers: {
						authorization: 'Bearer ' + results.access_token
					}
				}
				Request(myOptions, function (err, response, body) {
					if (err) return console.error("Error occured: ", err);
					var jsonUser = JSON.parse(body);
					User.findOne({email: jsonUser.email }, function (err, thisUser) {
						if (err) return res.json({success: false, msg: 'Error occured checking for existing user.'});
						if (thisUser) {
							var nToken = new Token({
								account_type: 'GG',
								token: results.access_token,
								user_id: thisUser._id
							});
							nToken.save(function (err) {
								if (err && err.code === 11000) {
									res.json({ success: true, token: results.access_token, type: 'GG', user: JSON.stringify(thisUser) });
								} else if (err) {
									console.log(err);
									res.json({ success: false, msg: 'Another error has occured.' });
								} else {
									res.json({ success: true, token: results.access_token, type: 'GG', user: JSON.stringify(thisUser) });
								}
							});
						} else {
							var newUser = new User({ 
								username: jsonUser.name,
								firstName: jsonUser.given_name,
								lastName: jsonUser.family_name,
								email: jsonUser.email,
								image_link: jsonUser.picture,
								password: '8a5b9f7ca36f753574f459622473300GimlZAnt2bgp'
							});
							newUser.save(function (err) {
								if (err) {
									res.json({ success: false, msg: 'Error occured creating new user'});
								} else {
									var nToken = new Token({
										account_type: 'GG',
										token: results.access_token,
										user_id: newUser._id
									});
									nToken.save(function (err) {
										if (err && err.code === 11000) {
											res.json({ success: true, token: results.access_token, type: 'GG', user: JSON.stringify(newUser) });
										} else if (err) {
											console.log(err);
											res.json({ success: false, msg: 'Another error has occured.' });
										} else {
											res.json({ success: true, token: results.access_token, type: 'GG', user: JSON.stringify(newUser) });
										}							
									});
								}									
							});
						}
					});
				});
			});
		}
	},
	deleteToken: function (req, res) {
		Token.remove({user_id: req.params.uid}, function (err, result) {
			if (err)
				return res.json({success: false});
			res.json({success: true})
		});
	}
};
module.exports = functions;
