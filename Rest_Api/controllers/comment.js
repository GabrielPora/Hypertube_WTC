var Comment = require('../models/comment.js');
var User 	= require('../models/user.js');

exports.postComments = function (req, res) {
	if (req.params.movieId) {
		var comment = new Comment({
			userId: req.user._id,
			movieId: req.params.movieId,
			comment: req.body.comment,
			created: req.body.created,
		});
		comment.save(function (err) {
			if (err)
				return res.json({success: false, error: err });
			res.json({ success: true, newComment: comment });
		});
	}
}

exports.getComments = function (req, res) {
	if (req.params.movieId) {
		Comment.find({ movieId: req.params.movieId }, function (err, comments) {
			if (err) return res.json({ success: false, error: err });
			if (!comments) return res.json({ success: false, comments: 'No Comments.' });
			
			User.find(function (err, users) {
				var AllComments = [];

				for (var i = 0; i < comments.length; i++ ) {
					var username = 'Test';
					var img_link = 'test';
					for (var j = 0; j < users.length; j++) {
						if (users[j]._id == comments[i].userId) {
							username = users[j].username;
							img_link = users[j].image_link;
						}
					}
					var comment = {
						username: username,
						image_link: img_link,
						Comment: comments[i]
					};
					AllComments.push(comment);
				}
				res.json({ success: true, Comments: AllComments });
			});
		});
	}
}