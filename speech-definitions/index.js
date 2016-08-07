var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

var CommandSchema = new mongoose.Schema({
	synopsis: String,
	name: String,
	paragraphs: Array,
	aliases: Array
});

module.exports = mongoose.model('manpage', CommandSchema, 'manpage');