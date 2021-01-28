(function(){

	function Coords (x,y) {
		if (typeof x === 'object') {
			y = x.y;
			x = x.x;
		}
		this.x = (typeof x == 'number') ? x : 0;
		this.y = (typeof y == 'number') ? y : 0;
		return this;
	}

	Coords.prototype = {
		get r () {
			return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
		}, 
		set r (val) {
			this.setByPolarCoords(val, this.theta);
			return this.r;
		},
		get theta () {
			return Math.atan2(this.y, this.x); // http://stackoverflow.com/a/8898965/1766230
		},
		set theta (val) {
			this.setByPolarCoords(this.r, val);
			return this.theta;
		}
	};

	Coords.prototype.check = function(){
		return this.checkCoords(this);
	};
	Coords.prototype.checkCoords = function(coord){
		if (typeof coord.x != "number") {
			console.error("Bad coord.x", coord.x);
			coord.x = 0;
		} else if (isNaN(coord.x)) {
			console.error("coord.x Not a Number", coord);
			coord.x = 0;
		}
		if (typeof coord.y != "number") {
			console.error("Bad coord.y", coord.y);
			coord.y = 0;
		} else if (isNaN(coord.y)) {
			console.error("coord.y Not a Number", coord);
			coord.y = 0;
		}
		return coord;
	};
	Coords.prototype.getCopy = function () {
		var coord = this;
		return new Coords(coord.x, coord.y);
	};
	Coords.prototype.clone = Coords.prototype.getCopy;
	Coords.prototype.copy = Coords.prototype.getCopy;
	Coords.prototype.set = function(coord){
		this.checkCoords(coord);
		this.x = coord.x;
		this.y = coord.y;
	};
	Coords.prototype.add = function(coord){
		this.checkCoords(coord);
		this.x += coord.x;
		this.y += coord.y;
		return this;
	};
	Coords.prototype.subtract = function(coord){
		this.checkCoords(coord);
		this.x -= coord.x;
		this.y -= coord.y;
		return this;
	};
	Coords.prototype.multiply = function(n){
		this.x *= n;
		this.y *= n;
		return this;
	};
	Coords.prototype.round = function(){
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	};
	Coords.prototype.clear = function(){
		this.x = 0;
		this.y = 0;
		return this;
	};
	Coords.prototype.abs = function() {
		this.x = Math.abs(this.x);
		this.y = Math.abs(this.y);
		return this;
	};

	Coords.prototype.getMultiply = function(n){
		var x = this.x * n;
		var y = this.y * n;
		return new Coords(x, y);
	};
	Coords.prototype.getDot = function(coord){
		this.checkCoords(coord);
		// A dot B = ||A|| ||B|| cos theta ?
		// this.getMagnitude() * coord.getMagnitude()    ???
		return ((this.x * coord.x) + (this.y * coord.y));
	};
	Coords.prototype.setTangent = function(){
		var x = this.x;
		this.x = this.y;
		this.y = x;
		return this;
	};
	Coords.prototype.getTangent = function(){
		var x = this.y;
		var y = this.x;
		return new Coords(x, y);
	};

	Coords.prototype.getDistance = function(coord){
		this.checkCoords(coord);
		return Math.sqrt(
			Math.pow( (this.x - coord.x), 2)
			+ Math.pow( (this.y - coord.y), 2)
		);
	};
	Coords.prototype.getUnitVector = function(coord){
		this.checkCoords(coord);
		var x = 0, y = 0;
		var d = Math.abs(this.getDistance(coord));
		if (this.x != coord.x) {
			var dx = coord.x - this.x;
			x = (d == 0) ? 0 : dx / d;
		}
		if (this.y != coord.y) { 
			var dy = coord.y - this.y;
			y = (d == 0) ? 0 : dy / d;
		}
		return new Coords(x, y);
	};
	Coords.prototype.getUnitVectorTangent = function(coord){
		this.checkCoords(coord);
		var x = 0, y = 0;
		var d = Math.abs(this.getDistance(coord));
		if (d != 0) {
			x = (coord.y - this.y) / d;
			y = (this.x - coord.x) / d;
		}
		return new Coords(x, y);
	};
	Coords.prototype.normalize = function(){
		var vectorLength = this.getMagnitude();
		if (vectorLength == 0) {
			this.x = 0;
			this.y = 0;
		} else {
			this.x = this.x / vectorLength;
			this.y = this.y / vectorLength;
		}
		return this;		
	};
	Coords.prototype.setMagnitude = function(m) {
	 	return this.normalize().multiply(m);
	};
	Coords.prototype.getMagnitude = function(){
		return Math.sqrt(
			Math.pow(this.x, 2)
			+ Math.pow(this.y, 2)
		);
	};

	Coords.prototype.isEqual = function(coord){
		return (this.x == coord.x && this.y == coord.y);
	};
	Coords.prototype.isEqualInteger = function(coord){
		return (Math.round(this.x) == Math.round(coord.x) && Math.round(this.y) == Math.round(coord.y));
	};
	Coords.prototype.equals = Coords.prototype.isEqual;

	// Polar Coordinate functions
	Coords.prototype.setByPolarCoords = function(r, theta) {
		return this.set({
			x: (r * Math.cos(theta)),
			y: (r * Math.sin(theta))
		}) ;
	};
	Coords.prototype.convertPolarToCartesianCoords = function(r, theta) {
		var x = r * Math.cos(theta);
		var y = r * Math.sin(theta);
		return (new Coords(x, y));
	};
	Coords.prototype.rotate = function (deltaTheta, aroundOriginCoords) {
		this.subtract(aroundOriginCoords);
		this.setByPolarCoords(this.r, (this.theta + deltaTheta));
		this.add(aroundOriginCoords);
		return this;
	};
	

	const component = {
		fileName: 		"Coords",
		classes:		{"Coords": Coords},
		description:	"2D Coordinates", // Originally created for stardust.js
		credits:		"By Luke Nickerson, 2014, 2017"
	};

	// Install into RocketBoots if it exists otherwise put the classes on the global window object
	if (RocketBoots) {
		RocketBoots.installComponent(component);
	} else if (window) {
		for (let className in component.classes) {
			window[className] = component.classes[className];
		}
	}
})();