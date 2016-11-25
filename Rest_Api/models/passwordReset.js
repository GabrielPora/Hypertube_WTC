var mongoose = require('mongoose');

var ResetToken = new mongoose.Schema({
	userId: { type: String, required: true },
	reset_token: { type: String, required: true },
	request_date: { type: String, required: true }
});

module.exports = mongoose.model('ResetToken', ResetToken);