var passport = 			require('passport');
var BearerStrategy = 	require('passport-http-bearer').Strategy;

var User = 				require('../models/user.js');
var Token =				require('../models/token.js');

passport.use(new BearerStrategy(
	function (accessToken, callback) {
		console.log('Token Auth Requested %s\n\n', accessToken);
		
		Token.findOne({ token: accessToken }, function (err, token) {
			console.log(token);

			if (err) return (callback(err));
			if (!token) return (callback(null, false));
			User.findOne({ _id: token.user_id }, function (err, user) {
				console.log(user);

				if (err) return (callback(err));
				if (!user) return (callback(null, false));
				callback(null, user, { scope: '*' });
			});
		});
	}
));
exports.isAuthenticated = passport.authenticate('bearer', { session : false });
