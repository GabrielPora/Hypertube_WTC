var User	= require('../models/user.js');

exports.postUser = function (req, res, next) {
	var user = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password
	});
	user.save(function (err) {
		if (err) {
			res.json({error: err});
			console.log(err);
		}		
		res.json(user);
	});
}