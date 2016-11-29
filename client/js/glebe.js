var SCALE = 32;

var chatText = document.getElementById("chat-text");
var chatInput = document.getElementById("chat-input");
var chatForm = document.getElementById("chat-form");
var ctx = document.getElementById("ctx").getContext("2d");
var id;
ctx.font = "30px Arial";

var startScreenImage = document.getElementById("startscreen");

var socket = io.connect("localhost:2000");
var onStartScreen = true;

socket.on("id", function(data) {
	id = data;
});
socket.on("newPositions", function(data) {
	if(onStartScreen) {
		ctx.drawImage(startScreenImage, 0, 0);
	}else {
		// new information on positions, basically a render function
		ctx.fillStyle = "#888888";
		ctx.fillRect(0, 0, 500, 500);

		var index; //index of this player
		for(var i = 0; i < data.player.length; i++)
			if(data.player[i].id == id)
				index = i;

		// draw bounds
		ctx.fillStyle = "#000000";
		ctx.fillRect(250 + SCALE*(-10 - data.player[index].x), 250 + SCALE*(-10 - data.player[index].y), SCALE*20, SCALE*20);

		// draw flags and their shadows
		for(var i = 0; i < data.flags.length; i++) {
			renderShadow(data.flags[i].x, data.flags[i].y, data.player[index].x, data.player[index].y, data.flags[i].size);
		}
		for(var i = 0; i < data.flags.length; i++) {
			renderFlag(data.flags[i].x, data.flags[i].y+data.flags[i].z, data.flags[i].size, data.player[index].x, data.player[index].y);
		}

		// draw other players relative to this player
		ctx.lineWidth = 4;
		for(var i = 0; i < data.player.length; i++) {
			if(i != index) {
				renderPlayer(data.player[i], data.player[index].x, data.player[index].y);
			}
		}
		renderPlayer(data.player[index], data.player[index].x, data.player[index].y);
	}
});

renderFlag = function(x, y, size, px, py) {
	ctx.strokeStyle = "#ffff00";
	ctx.beginPath();
	ctx.moveTo(250 + SCALE*(x - px), 250 + SCALE*(y - py - 0.5*size));
	ctx.lineTo(250 + SCALE*(x - px - 0.5*size), 250 + SCALE*(y - py + 0.5*size));
	ctx.lineTo(250 + SCALE*(x - px + 0.5*size), 250 + SCALE*(y - py + 0.5*size));
	ctx.closePath();
	//ctx.lineTo(250 + SCALE*(x - px), 250 + SCALE*(y - py - 0.5*size));
	ctx.fill();
	ctx.stroke();
}
renderShadow = function(x, y, px, py, size) {
	ctx.fillStyle = "#000000";
	ctx.fillRect(250 + SCALE*(x - px - 0.5*size),
			250 + SCALE*(y - py - 0.5*size), SCALE*size, SCALE*size);
}

renderPlayer = function(player, px, py) {
	if(player.team == 0)
		ctx.strokeStyle = "#ff0000";
	else
		ctx.strokeStyle = "#0000ff";

	ctx.beginPath();
	ctx.arc(250 + SCALE*(player.x - px), 250 + SCALE*(player.y - py), SCALE*0.5*player.size, 0, 2 * Math.PI);
	ctx.fill();
	ctx.stroke();

	if(player.carryingFlag) {
		renderFlag(player.x, player.y-player.size*0.5, player.carryingFlag, px, py);
	}

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

document.onmousedown = function(event) {
	if(onStartScreen) {
		socket.emit("start", {});
		onStartScreen = false;
	}
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