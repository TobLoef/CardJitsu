var socket = io();
var canPlayCard = false;
var playerPoints = [],
	opponentPoints = [];
var username, opponentUsername, handSlots, opponentCard, playerCard;

submitUsername(prompt("Please enter a username between 3 and 16 characters.\nOnly letters, number and underscore is allowed."));

//////////  Socket Events  \\\\\\\\\\
socket.on("username response", function(response) {
	if (response.success) {
		username = response.username;
		playButtonVisible = true;
	} else {
		submitUsername(prompt("Username either already exists or is invalid. Please enter a different one."));
	}
});

socket.on("enter match", function(usernames) {
	playButtonVisible = false;
	opponentUsername = (usernames[0] !== username) ? usernames[0] : usernames[1];
	displayCardSlots = true;
});

socket.on("update cards", function(cards) {
	updateCards(cards);
});

socket.on("unknown card played", function() {
	unknownCardPlayed();
});

socket.on("fight result", function(result) {
	displayResult(result);
});

socket.on("end match", function(winner, loser, reason) {
	matchEnded(winner, loser, reason);
});

//////////  Functions  \\\\\\\\\\
function submitUsername(desiredUsername) {
	socket.emit("username submit", desiredUsername);
}

function enterQueue() {
	socket.emit("enter queue");
}

function updateCards(cards) {
	for (var i = 0; i < cards.length; i++) {
		handSlots[i].card = cards[i]
	}
	canPlayCard = true;
}

function playCard(index) {
	if (canPlayCard) {
		socket.emit("play card", index);
		canPlayCard = false;
	}
}

function unknownCardPlayed() {
	opponentCard = {isUnknown: true};
}

function displayResult(result) {
	var player = (result.winner.username === username) ? result.winner : result.loser;
	var opponent = (result.winner.username !== username) ? result.winner : result.loser;
	playerPoints = player.points;
	opponentPoints = opponent.points;
	opponentCard = opponent.card;
	setTimeout(function() {
		canPlayCard = true;
		opponentCard = undefined;
		playerCard = undefined;
		socket.emit("request cards update");
	}, (3 * 1000));
}

function matchEnded(winner, loser, reason) {
	setTimeout(function() {
		canPlayCard = false;
		var delay = 3;
		if (reason === "player left") {
			alert(["Your opponent", "You"][+(username !== winner)] + " left the match. You " + ["lose", "win"][+(username === winner)] + "!");
			delay = 1;
		} else if (reason === "player forfeit") {
			alert(["Your opponent", "You"][+(username !== winner)] + " forfeited the match. You " + ["lose", "win"][+(username === winner)] + "!");
			delay = 1;
		} else {
			alert(["Your opponent", "You"][+(username === winner)] + " have a full set. You " + ["lose", "win"][+(username === winner)] + "!");
		}
		setTimeout(function() {
			opponentCard = undefined;
			playerCard = undefined;
			for (var i = 0; i < handSlots.length; i++) {
				handSlots[i].card = undefined;
			}
			playerPoints = [];
			opponentPoints = [];
			displayCardSlots = false;
			playButtonText = "Play!";
			playButtonVisible = true;
			playButtonClickable = true;
		}, (delay * 1000));
	}, (0.5 * 1000));
}