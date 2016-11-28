var Entity = require("./entity.js");

var Flag = function() {
	
	var self = Entity();
	self.x = 1000 * Math.random() - 500;
	self.y = 2000 * Math.random() - 1000;
	var super_update = self.update;

	self.update = function() {
		
		self.speedX *= 0.88;
		self.speedY *= 0.88;
		if(self.x < -500) {
			self.x = -500;
			self.speedX *= -1;
		} else if(self.x > 500) {
			self.x = 500;
			self.speedX *= -1;
		} if(self.y < -1000) {
			self.y = -1000;
			self.speedY *= -1;
		} else if(self.y > 1000) {
			self.y = 1000;
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