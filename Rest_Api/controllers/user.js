var User	= require('../models/user.js');
var bcrypt	= require('bcrypt-nodejs');
var fs 		= require('fs');
var path	= require('path');

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

//Get User Info Endpoint.
exports.getUser = function (req, res) {
	console.log(req.user);
	res.json({ success: true, user: JSON.stringify(req.user) });
}

//Update User Info Endpoint.
exports.putUser = function (req, res) {
	bcrypt.genSalt(5, function (err, salt) {
		bcrypt.hash(req.user.password, salt, null, function (err, hash) {
			User.update({ _id: req.user._id }, 
				{ username: req.body.username, 
				  firstName: req.body.firstName, 
				  lastName: req.body.lastName,
				  email: req.body.email,
				  password: hash }, 
				function (err, num, raw) {
				if (err)
					return (res.json({ success: false, msg: err }));
				
				res.json({ success: true });
			});
		});
	});
}

exports.putUserImage = function (req, res) {
	console.log('Uploading Image');

	var fStream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldName, file, fileName) {
		fStream = fs.createWriteStream('./user_images/' + req.user.username + '.png');
		file.pipe(fStream);
		fStream.on('close', function () {
			console.log('Finished Uploading');
			var imgUrl = 'http://localhost:3001/api/user_images/' + req.user.username + '.png';
			User.update({ _id: req.user._id }, { image_link: imgUrl }, function (err, num, raw) {
				if (err)
					return (res.json({success: false, msg: 'Error occured while uploading image'}));
				res.json({ success: true, img_link: imgUrl });
			});
		});
	});
}

exports.getUserImage = function(req, res) {
	var imgPath = path.resolve('user_images/' + req.params.user_image);
	res.sendFile(imgPath);
}