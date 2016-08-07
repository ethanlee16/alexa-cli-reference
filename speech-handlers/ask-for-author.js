var Command = require('../speech-definitions')

module.exports = function(req, res) {
	console.log("Now handling AskForAuthor intent for " + req.slot("Command"));
	Command.findOne({name: req.slot("Command")}).then(command => {
		if (!command) {
			res.say("I couldn't find that command. Try another.");
			return res.send();
		}
		for (p in command.paragraphs) {
			var paragraph = command.paragraphs[p];
			if (paragraph.section.indexOf("AUTHOR") > -1) {
				res.say(req.slot("Command") + " is " + paragraph.text);
				return res.send();
			}
		}
		res.say("We couldn't find an author for " + req.slot("Command"));
		res.send();
	}).catch(e => console.error);
	return false;
}