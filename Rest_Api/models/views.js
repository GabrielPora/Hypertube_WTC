var mongooese = require('mongoose');

var ViewSchema = mongooese.Schema({
	userId: { type: String, required: true },
	movieId: { type: String, required: true }
});

module.exports = mongooese.model('View', ViewSchema); 