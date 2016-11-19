var Request	= require('request');
var User 	= require('../models/user.js');
var jwt  	= require('jwt-simple');
var Config	= require('../config/database.js');

var functions = {
 authenticate: function(req, res) {
	User.findOne({
		username: req.body.username
	}, function(err, user){
		if (err) throw err;
		if(!user){
			return res.status(403).send({success: false, msg: 'Authenticaton failed, user not found.'});
		} else {
			user.verifyPassword(req.body.password, function(err, isMatch){
				if(isMatch && !err) {
					var token = jwt.encode(user, Config.secret);
					res.json({success: true, token: token, type: 'local', user: JSON.stringify(user)});
				} else {
					return res.status(403).send({success: false, msg: 'Authenticaton failed, wrong password.'});
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
			 if (!err) {
				 var jsonResponse = JSON.parse(body);
				 if (jsonResponse.error) {
					 console.log(jsonResponse.error_description);
				 	 res.status(200).send({success: false, msg: 'Authenticaton Failed.', err: jsonResponse.error_description });
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
						 var cUser = {
							 _id: myUser.id,
							 username: myUser.login,
							 firstName: myUser.first_name,
							 lastName: myUser.last_name,
							 email: myUser.email,
							 image_link: myUser.image_url
						 }
						 res.json({success: true, token: jsonResponse.access_token, type: '42', user: JSON.stringify(cUser)});
					 });
				 }
			 }
		 });
	 }
 }
};
module.exports = functions;
