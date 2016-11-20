var mongoose 	= require('mongoose');

var TokenSchema = new mongoose.Schema({
	account_type:	{ type: String, required: true },
	token:			{ type: String, required: true, unique: true },
	user_id:		{ type: String, required: true }
});

module.exports = mongoose.model('Token', TokenSchema);