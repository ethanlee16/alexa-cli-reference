var Command = require('../speech-definitions')

module.exports = function(req, res) {
	Command.findOne({name: req.slot("Command")}).then(command => {
		if (!command) return res.say("I couldn't find that command. Try another.");
		
	}).catch(e => console.error);
}