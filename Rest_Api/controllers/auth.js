var Request = require('request');
var User = require('../models/user.js');
var Token = require('../models/token.js');
var jwt = require('jwt-simple');
var Config = require('../config/database.js');

var functions = {
	authenticate: function (req, res) {
		User.findOne({
			username: req.body.username
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
					console.log("Access Token: %s", jsonResponse.access_token);
					var myDetailsOptions = {
						method: 'GET',
						url: 'https://api.intra.42.fr/v2/me',
						headers: {
							authorization: 'Bearer ' + jsonResponse.access_token
						}
					};
					Request(myDetailsOptions, function (myError, myResponse, myBody) {
						var myUser = JSON.parse(myBody);
						User.findOne({ username: myUser.login }, function (err, regUser) {
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
											if (err.code === 11000) {
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
	deleteToken: function (req, res) {
		Token.remove({user_id: req.params.uid}, function (err, result) {
			if (err)
				return res.json({success: false});
			res.json({success: true})
		});
	}
};
module.exports = functions;
