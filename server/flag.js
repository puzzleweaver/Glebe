var Entity = require("./entity.js");
var Map = require("./map.js");

var Flag = function() {
	
	var self = Entity();
	self.x = Map.width * (Math.random() - 0.5);
	self.y = Map.height * (Math.random() - 0.5);
	var super_update = self.update;

	self.update = function() {
		
		self.speedX *= 0.88;
		self.speedY *= 0.88;
		if(self.x < -Map.width*0.5) {
			self.x = -Map.width*0.5;
			self.speedX *= -1;
		} else if(self.x > Map.width*0.5) {
			self.x = Map.width*0.5;
			self.speedX *= -1;
		} if(self.y < -Map.height*0.5) {
			self.y = -Map.height*0.5;
			self.speedY *= -1;
		} else if(self.y > Map.height*0.5) {
			self.y = Map.height*0.5;
			self.speedY *= -1;
		}
		super_update();
		
	}
	
	return self;
	
}

Flag.list = [];
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

module.exports = Flag;