
var Entity = function() {
	var self = {
			x:0,
			y:0,
			speedX: 0,
			speedY: 0,
			size: 1,
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

module.exports = Entity;