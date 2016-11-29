
var Entity = require("./entity.js");
var Flag = require("./flag.js");
var Map = require("./map.js");

var Player = function(id) {
	
	var self = Entity();
	self.id = id;
	self.pressingLeft = false;
	self.pressingRight = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingSpace = false;
	self.carryingFlag = 0;
	self.maxSpeed = 0.25;
	self.size = Math.random()+1;
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
			if(Flag.list[i].z < -self.size*0.5 || Flag.list[i].size > self.size)
				continue;
			dx = Flag.list[i].x - self.x;
			dy = Flag.list[i].y - self.y;
			if(dx * dx + dy * dy < self.size+Flag.list[i].size) {
				self.carryingFlag = Flag.list[i].size;
				Flag.list.splice(i, 1);
				break;
			}
		}
	}
	self.dropFlag = function() {
		var flag = Flag();
		flag.x = self.x;
		flag.y = self.y;
		flag.z = -self.size*0.5;
		flag.size = self.carryingFlag;
		var speed = Math.sqrt(self.speedX*self.speedX+self.speedY*self.speedY);
		flag.speedX = 0.25*self.speedX/speed*(1 + self.size/(1+flag.size));
		flag.speedY = 0.25*self.speedY/speed*(1 + self.size/(1+flag.size));
		flag.speedZ = -speed*(1 + self.size/flag.size);
		Flag.list.push(flag);
		self.carryingFlag = 0;
	}
	
	self.checkBounds = function() {
		
		if(self.x-self.size*0.5 < -Map.width*0.5) {
			self.x = -Map.width*0.5+self.size*0.5;
			self.speedX = 0;
		} else if(self.x+self.size*0.5 > Map.width*0.5) {
			self.x = Map.width*0.5-self.size*0.5;
			self.speedX = 0;
		} if(self.y-self.size*0.5 < -Map.height*0.5) {
			self.y = -Map.height*0.5+self.size*0.5;
			self.speedY = 0;
		} else if(self.y+self.size*0.5 > Map.height*0.5) {
			self.y = Map.height*0.5-self.size*0.5;
			self.speedY = 0;
		}
		
	}
	
	self.updateSpeed = function() {
		
		var step = 0.0625;
		var smooth = self.maxSpeed/(step+self.maxSpeed);
		step *= 0.9*(1.111-self.carryingFlag/self.size);
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
	
	//create pack
	for(var i in Player.list) {
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			id:player.id,
			team:player.team,
			size:player.size,
			carryingFlag:player.carryingFlag
		});
	}
	
	return pack;
}

module.exports = Player;