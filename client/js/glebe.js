
var chatText = document.getElementById("chat-text");
var chatInput = document.getElementById("chat-input");
var chatForm = document.getElementById("chat-form");
var ctx = document.getElementById("ctx").getContext("2d");
var id;
ctx.font = "30px Arial";

var socket = io.connect("localhost:2000");

socket.on("id", function(data) {
	id = data;
});
socket.on("newPositions", function(data) {
	//new information on positions, basically a render function
	ctx.fillStyle = "#444444";
	ctx.fillRect(0, 0, 500, 500);
	var index; //index of this player
	for(var i = 0; i < data.player.length; i++)
		if(data.player[i].id == id)
			index = i;
	/*
		Dimensions of board: (subject to change)
			1000 width
			2000 height
			border line at y = 0
			y < 0 => red side
			y > 0 => blue side
			POSSIBILITY TO THINK ABOUT:
				should the red team view the board inverted,
				as if from their perspective?
				That way home is always in the down direction
	*/
	//draw field, red and blue sides
	ctx.fillStyle = "#ff4444";
	ctx.fillRect(250 - 500 - data.player[index].x - 16, 250 - 1000 - data.player[index].y - 16, 1000 + 32, 1000 + 16);
	ctx.fillStyle = "#4444ff";
	ctx.fillRect(250 - 500 - data.player[index].x - 16, 250 - data.player[index].y, 1000 + 32, 1000 + 16);
	//draw flags
	for(var i = 0; i < data.flags.length; i++) {
		renderFlag(data.flags[i].x, data.flags[i].y, data.player[index].x, data.player[index].y);
	}
	//draw other players relative to this player
	ctx.lineWidth = 4;
	for(var i = 0; i < data.player.length; i++) {
		if(i != index) {
			renderPlayer(data.player[i], data.player[index].x, data.player[index].y);
		}
	}
	renderPlayer(data.player[index], data.player[index].x, data.player[index].y);
});

renderFlag = function(x, y, px, py) {
	ctx.fillStyle = "#ffff00";
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.rect(250 + x - px - 16,
				 250 + y - py - 16, 32, 32);
	ctx.fill();
	ctx.stroke();
}

renderPlayer = function(player, px, py) {
	if(player.team == 0)
		ctx.fillStyle = "#ff0000";
	else
		ctx.fillStyle = "#0000ff";
	//outline player differently
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.arc(250 + player.x - px, 250 + player.y - py, 16, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();
	
	if(player.carryingFlag)
		renderFlag(player.x, player.y-16, px, py);
	
}

socket.on("addToChat", function(data) {
	chatText.innerHTML += "<div>" + data + "</div>";
});
socket.on("evalAnswer", function(data) {
	console.log(data);
});

chatForm.onsubmit = function(e) {
	e.preventDefault();
	if(chatInput.value[0] === '/')
		socket.emit("evalServer", chatInput.value.slice(1));
	else
		socket.emit("sendMsgToServer", chatInput.value);
	chatInput.value = "";
}

document.onkeydown = function(event) {
	if(event.keyCode === 68) //d
		socket.emit("keyPress", {inputId:"right", state:true});
	else if(event.keyCode == 83) //s
		socket.emit("keyPress", {inputId:"down", state:true});
	else if(event.keyCode == 65) //a
		socket.emit("keyPress", {inputId:"left", state:true});
	else if(event.keyCode == 87) //w
		socket.emit("keyPress", {inputId:"up", state:true});
	else if(event.keyCode == 32)
		socket.emit("keyPress", {inputId:"space", state:true});
}
document.onkeyup = function(event) {
	if(event.keyCode === 68) //d
		socket.emit("keyPress", {inputId:"right", state:false});
	else if(event.keyCode == 83) //s
		socket.emit("keyPress", {inputId:"down", state:false});
	else if(event.keyCode == 65) //a
		socket.emit("keyPress", {inputId:"left", state:false});
	else if(event.keyCode == 87) //w
		socket.emit("keyPress", {inputId:"up", state:false});
	else if(event.keyCode == 32)
		socket.emit("keyPress", {inputId:"space", state:false});
}