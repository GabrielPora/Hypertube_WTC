var	User = require('../models/user.js');
var ResetToken = require('../models/passwordReset.js')
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

exports.postForgot = function (req, res) {
	var resetToken = guid();
	User.findOne({ email: req.body.email }, function (err, user) {
		if (err) return res.json({ success: false, error: err });
		if (!user) return res.json({ success: false, error: 'No user with this email' });

		var newResetToken = new ResetToken({
			userId: user._id,
			reset_token: resetToken,
			request_date: new Date()
		});
		newResetToken.save(function (err) {
			if (err) return res.json({ success: false, error: err});

			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'exallowen@gmail.com',
					pass: ''
				}
			}); //Creating the HTML Body
			var text = '<html>'
				+ '<head></head>'
				+ '<body>'
					+ '<h2>Hello ' + user.username + ',</h2>'
					+ '<p>You have requested a password reset, please following the link below to change your password:</p>'
					+ '<a href="http://localhost:3000/reset?token=' + encodeURIComponent(resetToken) + '">Click Here</a>'
					+ '<p>Please Note: If you have not requested this, please ignore it.</p>'
					+ '<p>Kind Regards, <br/>Hyper Staff</p>'
				+ '</body>'
			+ '</html>';
			//Setting up the Mail Options;
			var mailOptions = {
				from: 'no-reply@localhost:3001.42.fr',
				to: req.body.email,
				subject: 'Hypertube: Reset Account Password',
				html: text
			};
			transporter.sendMail(mailOptions, function (err, info) {
				if (err)
					res.json({ success: false, error: err });
				else
					res.json({ success: true });
			});
		});
	});
}

exports.postReset = function (req, res) {
	ResetToken.findOne({ reset_token: req.body.token }, function (err, resetToken) {
		if (err) return res.json({ success: false, error: err });
		if (!resetToken || resetToken == null) 
			return res.json({ success: false, error: 'This token does not exist or is incorrect' });

		if (resetToken.reset_token === req.body.token) {
			bcrypt.genSalt(5, function (err, salt) {
				bcrypt.hash(req.body.password, salt, null, function (err, hash) {
					User.update({ _id: resetToken.userId }, 
						{ password: hash }, 
						function (err, num, raw) {
						if (err)
							return (res.json({ success: false, msg: err }));
						
						ResetToken.remove({ reset_token: req.body.token }, function (err) {
							if (err) return (res.json({ success: false, error: 'Failed to remove token after use.' }));
							res.json({ success: true });
						});
					});
				});
			});
		} else
			res.json({ success: false, error: 'Invalid Token' });
	});
}
