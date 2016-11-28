
var Entity = require("./entity.js");
var Flag = require("./flag.js");

var Player = function(id) {
	
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingLeft = false;
	self.pressingRight = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingSpace = false;
	self.carryingFlag = 0;
	self.maxSpeed = 8;
	self.team = Math.floor(2 * Math.random());

	var super_update = self.update;
	
	self.update = function() {
		
		self.updateSpeed();
		super_update();
		self.checkBounds();
		if(self.pressingSpace) {
			if(self.carryingFlag == 0)
				self.pickUpFlag();
			else
				self.dropFlag();
			self.pressingSpace = false;
		}
	}

	self.pickUpFlag = function() {
		var dx, dy;
		for(var i in Flag.list) {
			dx = Flag.list[i].x - self.x;
			dy = Flag.list[i].y - self.y;
			if(dx * dx + dy * dy < 32 * 32) {
				self.carryingFlag = 1; // flag size eventually
				Flag.list.splice(i, 1);
				break;
			}
		}
	}
	self.dropFlag = function() {
		var flag = Flag();
		flag.x = self.x;
		flag.y = self.y;
		flag.speedX = self.speedX*4;
		flag.speedY = self.speedY*4;
		Flag.list.push(flag);
		self.carryingFlag = 0;
	}
	
	self.checkBounds = function() {
		
		if(self.x < -500) {
			self.x = -500;
			self.speedX = 0;
		} else if(self.x > 500) {
			self.x = 500;
			self.speedX = 0;
		} if(self.y < -1000) {
			self.y = -1000;
			self.speedY = 0;
		} else if(self.y > 1000) {
			self.y = 1000;
			self.speedY = 0;
		}
		
	}
	
	self.updateSpeed = function() {
		
		var step = 2;
		var smooth = self.maxSpeed/(step+self.maxSpeed);
		if(self.pressingLeft)
			self.speedX -= step;
		else if(self.pressingRight)
			self.speedX += step;

		if(self.pressingUp)
			self.speedY -= step;
		else if(self.pressingDown)
			self.speedY += step;
		self.speedX *= smooth;
		self.speedY *= smooth;
		
	}
	
	self.respawn = function() {
		if(self.carryingFlag)
			self.dropFlag();
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
		else if(data.inputId === "space")
			player.pressingSpace = data.state;
		
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
					//you're not technically in a zone unless all of you, not just your center, is in the zone.
					//otherwise, some glitchy stuff happens, just trust me fam.
					if(Player.list[i].y > 16 && Player.list[j].y > 16) {
						if(Player.list[i].team == 0)
							Player.list[i].respawn();
						else
							Player.list[j].respawn();
					}else if(Player.list[i].y < -16 && Player.list[j].y < -16) {
						if(Player.list[i].team == 0)
							Player.list[j].respawn();
						else
							Player.list[i].respawn();
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
			team:player.team,
			carryingFlag:player.carryingFlag
		});
	}
	
	return pack;
}

module.exports = Player;