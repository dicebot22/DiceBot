// Dependencies
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
	colorize: true
});
logger.level = 'debug';

// init Discord Bot
var bot = new Discord.Client({
	token: auth.token,
	autorun: true
});

// ready bot
bot.on('ready', function(evt) {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function(user, userID, channelID, message, event) {
	if(message.substring(0,1) == "!") {
		// cmd: first letter of command
		// args: following letters in an array
		var args = message.substring(1).split('');
		var cmd = args[0];
		args = args.splice(2);

		switch(cmd) {
			// roll dice randomly
			// !r XXXdXXXX (X is of length >=1)
			case('r'):
				rollDice(channelID, args);
				break;
		}
	}
});

function rollDice(channelID, args) {
	// All Output Variables
	let diceAmount = "";
	let diceType = "";
	let results = [];
	let sum = 0;

	// booleans
	let readD = false;
	let error = false;

	// "d" index
	let dIndex;

	// init diceAmount and diceType
	for(var i=0; i<args.length; i++) {
		if(!readD) {
			if(args[i] != "d") {
				diceAmount += args[i];

				// Error if first character is 0, Error if character is not a number
				if((Math.abs(args[i]) <= 0 && i == 0) || isNaN(Number.parseInt(args[i]))) {
					error = true;
				}
			} else {
				readD = true;
				dIndex = i;
				continue;
			}
		} else {
			if(args[i] != "d") {
				diceType += args[i];
				
				// Error if first character is 0, Error if character is not a number
				if((Math.abs(args[i]) <= 0 && i == dIndex+1) || isNaN(Number.parseInt(args[i]))) {
					error = true;
				}
			}
		}
	}

	// log information to console
	logger.info(diceAmount + ", " + diceType);

	if(error) {
		bot.sendMessage({
			to: channelID,
			message: "Make sure the dice amount and dice type are both Numbers greater than 0"
		});
		return;
	}

	// make results
	for(let i=0; i<diceAmount;i++) {
		let random = Math.floor(Math.random()*diceType+1);
		results[i] = random;
		sum += random;
	}

	bot.sendMessage({
		to: channelID,
		message: "Rolled: " + diceAmount + "d" + diceType + 
			"\n[" + results + "]" +
			"\nTotal: " + sum
	});
	return;
}
