var Entity = require("./entity.js");
var Map = require("./map.js");

var Flag = function() {
	
	var self = Entity();
	self.x = Map.width * (Math.random() - 0.5);
	self.y = Map.height * (Math.random() - 0.5);
	self.size = Math.random()+0.2;
	var super_update = self.update;

	self.update = function() {
		
		if(self.x-self.size*0.5 < -Map.width*0.5) {
			self.x = -Map.width*0.5+self.size*0.5;
			self.speedX *= -1;
		} else if(self.x+self.size*0.5 > Map.width*0.5) {
			self.x = Map.width*0.5-self.size*0.5;
			self.speedX *= -1;
		} if(self.y-self.size*0.5 < -Map.height*0.5) {
			self.y = -Map.height*0.5+self.size*0.5;
			self.speedY *= -1;
		} else if(self.y+self.size*0.5 > Map.height*0.5) {
			self.y = Map.height*0.5-self.size*0.5;
			self.speedY *= -1;
		}
		
		self.speedZ += 0.1;
		self.z += self.speedZ;
		if(self.z+self.speedZ > 0) {
			self.speedZ *= -0.8;
			self.speedX *= 0.6;
			self.speedY *= 0.6;
			self.z = 0;
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
			y:flag.y,
			z:flag.z,
			size:flag.size
		});
	}
	return pack;
}

module.exports = Flag;