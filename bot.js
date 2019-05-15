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
	// All strings
	let diceAmount = "";
	let readD = false;
	let diceType = "";
	let results = [];
	let sum = 0;
	let error = false;

	// init diceAmount and diceType
	for(var i=0; i<args.length; i++) {
		if(!readD) {
			if(args[i] != "d") {
				// checking
				if (typeof Number.parseInt(args[i]) == Number && Number.parseInt(args[i]) > 0) {
					diceAmount += args[i];
				} else {
					error = true;
				}
			} else {
				readD = true;
				continue;
			}
		} else {
			if(args[i] != "d") {
				if (typeof Number.parseInt(args[i]) == Number && Number.parseInt(args[i]) > 0) {
					diceType += args[i];
				} else {
					error = true;
				}
			}
		}
	}
	
	if(error) {
		bot.sendMessage({
			to: channelID,
			message: "Make sure the dice amount and dice type are both Numbers greater than 0"
		});
		return;
	} else {
		logger.info(diceAmount + ", " + diceType);
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

// function sendMessages(ID, messageArr, interval) {
// 	var resArr = [], len = messageArr.length;
// 	var callback = typeof(arguments[2]) === 'function' ?  arguments[2] :  arguments[3];
// 	if (typeof(interval) !== 'number') interval = 1000;

// 	function _sendMessages() {
// 		setTimeout(function() {
// 			if (messageArr[0]) {
// 				bot.sendMessage({
// 					to: ID,
// 					message: messageArr.shift()
// 				}, function(err, res) {
// 					resArr.push(err || res);
// 					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
// 				});
// 				_sendMessages();
// 			}
// 		}, interval);
// 	}
// 	_sendMessages();
// }