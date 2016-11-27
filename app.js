
var express = require("express");
var app = express();
var serv = require("http").Server(app);

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};

var Entity = function() {
	var self = {
		x:0,
		y:0,
		speedX: 0,
		speedY: 0,
		id:""
	}
	self.update = function() {
		self.updatePosition();
	}
	self.updatePosition = function() {
		self.x += self.speedX;
		self.y += self.speedY;
	}
	return self;
}

var Player = function(id) {
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingLeft = false;
	self.pressingRight = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.maxSpeed = 8;
	self.team = Math.floor(2 * Math.random());
	
	var super_update = self.update;
	self.update = function() {
		self.updateSpeed();
		super_update();
		//check bounds
		if(self.x < -500)
			self.x = -500;
		else if(self.x > 500)
			self.x = 500;
		if(self.y < -1000)
			self.y = -1000;
		else if(self.y > 1000)
			self.y = 1000;
	}
	
	self.updateSpeed = function() {
		if(self.pressingLeft)
			self.speedX = -self.maxSpeed;
		else if(self.pressingRight)
			self.speedX = self.maxSpeed;
		else
			self.speedX = 0;
		
		if(self.pressingUp)
			self.speedY = -self.maxSpeed;
		else if(self.pressingDown)
			self.speedY = self.maxSpeed;
		else
			self.speedY = 0;
	}
	self.respawn = function() {
		self.x = 0;
		self.y = 0;
	}
	
	Player.list[id] = self;
	return self;
}
Player.list = {};
Player.onConnect = function(socket) {
	var player = Player(socket.id);
	socket.emit("id", socket.id);
	socket.on("keyPress", function(data) {
		if(data.inputId === "left")
			player.pressingLeft = data.state;
		else if(data.inputId === "right")
			player.pressingRight = data.state;
		else if(data.inputId === "up")
			player.pressingUp = data.state;
		else if(data.inputId === "down")
			player.pressingDown = data.state;
	});
}
Player.onDisconnect = function(socket) {
	delete Player.list[socket.id];
}
Player.update = function() {
	var pack = [];
	//detect collisions
	var dx, dy;
	for(var i in Player.list) {
		for(var j in Player.list) {
			//opposite teams, but in the same area
			if(Player.list[i].team != Player.list[j].team) {
				dx = Player.list[i].x - Player.list[j].x;
				dy = Player.list[i].y - Player.list[j].y;
				if(dx * dx + dy * dy < 32 * 32) {
					if(Player.list[i].y > 0 && Player.list[j].y > 0) {
						if(Player.list[i].team == 0)
							Player.list[i].respawn();
						else
							Player.list[j].respawn();
					}else if(Player.list[i].y < 0 && Player.list[j].y < 0) {
						if(Player.list[i].team == 0)
							Player.list[j].respawn();
						else
							Player.list[j].respawn();
					}
				}
			}
		}
	}
	//create pack
	for(var i in Player.list) {
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			id:player.id,
			team:player.team
		});
	}
	return pack;
}
var Flag = function() {
	var self = Entity();
	self.x = 1000 * Math.random() - 500;
	self.y = 2000 * Math.random() - 1000;
	return self;
}
Flag.list = {};
Flag.update = function() {
	var pack = [];
	for(var i in Flag.list) {
		var flag = Flag.list[i];
		flag.update();
		pack.push({
			x:flag.x,
			y:flag.y
		});
	}
	return pack;
}

var DEBUG = true;
for(var i = 0; i < 20; i++) {
	Flag.list[i] = Flag();
}

var io = require("socket.io")(serv, {});
io.sockets.on("connection", function(socket) {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
	Player.onConnect(socket);
	
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