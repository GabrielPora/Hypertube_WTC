var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	movieId: { type: String, required: true },
	comment: { type: String, required: true },
	created: { type: String, required: true }
});

module.exports = mongoose.model('Comment', CommentSchema);