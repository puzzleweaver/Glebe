
var express = require("express");
var app = express();
var serv = require("http").Server(app);

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/client/index.html");
});
app.use(express.static(__dirname + "/client"));

serv.listen(2000, "0.0.0.0");
console.log("Server started.");

var SOCKET_LIST = {};

var Player = require("./server/player.js");
var Flag = require("./server/flag.js");

var DEBUG = true;
for(var i = 0; i < 20; i++) {
	Flag.list[i] = Flag();
}

var io = require("socket.io")(serv, {});
io.sockets.on("connection", function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	socket.on("start", function() {
		Player.onConnect(socket);
	});
	socket.on("disconnect", function() {
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on("sendMsgToServer", function(data) {
		var playerName = ("" + socket.id).slice(2, 7);
		for(var i in SOCKET_LIST) {
			SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
		}
	});
	socket.on("evalServer", function(data) {
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit("evalAnswer", res);
	});
});

setInterval(function() {
	var pack = {
			player:Player.update(),
			flags:Flag.update()
	}
	for(var i in SOCKET_LIST) {
		var socket = SOCKET_LIST[i];
		socket.emit("newPositions", pack);
	}
}, 1000/40); //1000/fps