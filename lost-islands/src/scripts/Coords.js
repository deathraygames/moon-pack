class Coords {
	constructor(x,y) {
		if (typeof x === 'object') { y = x.y; x = x.x; }
		this.x = x;
		this.y = y;
		this.check(); 
	}
	set(x,y) {
		if (x instanceof Coords) {
			x.check();
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y;
		}
	}	
	/*
	getCopy() {
		var coord = this;
		return new Coords(coord.x, coord.y);
	}
	add(coord) {
		coord.check();
		this.x += coord.x;
		this.y += coord.y;
		return this;
	}
	multiply(n) {
		this.x *= n;
		this.y *= n;
		return this;
	}
	getMultiply(n) {
		var x = this.x * n;
		var y = this.y * n;
		return new Coords(x, y);
	}
	getDot(coord) {
		coord.check();
		// A dot B = ||A|| ||B|| cos theta ?
		// this.getMagnitude() * coord.getMagnitude()    ???
		return ((this.x * coord.x) + (this.y * coord.y));
	}
	clear() {
		this.x = 0;
		this.y = 0;
		return this;
	}
	setTangent() {
		var x = this.x;
		this.x = this.y;
		this.y = x;
		return this;
	}
	setPolar(r, theta) {
		// theta is expected in radians
		this.x = r * Math.cos(theta);
		this.y = r * Math.sin(theta);
	}
	*/
	getDistance(coord) {
		coord.check();
		return Math.sqrt(
			Math.pow( (this.x - coord.x), 2)
			+ Math.pow( (this.y - coord.y), 2)
		);
	}
	/*
	getUnitVector(coord) {
		coord.check();
		var x = 0, y = 0;
		var d = Math.abs(this.getDistance(coord));
		if (this.x != coord.x) {
			var dx = coord.x - this.x;
			x =  dx / d;
		}
		if (this.y != coord.y) { 
			var dy = coord.y - this.y;
			y = dy / d;
		}
		return new Coords(x, y);
	}
	getMagnitude() {
		return Math.sqrt(
			Math.pow(this.x, 2)
			+ Math.pow(this.y, 2)
		);
	}
	isEqual(coord) {
		return (this.x == coord.x && this.y == coord.y);
	}
	isEqualInteger(coord) {
		return (Math.round(this.x) == Math.round(coord.x) && Math.round(this.y) == Math.round(coord.y));
	}
	*/
	check() {
		if (typeof this.x !== "number" || isNaN(this.x)) {
			console.error("Bad coord.x", this.x);
			this.x = 0;
		}
		if (typeof this.y !== "number" || isNaN(this.y)) {
			console.error("Bad coord.y", this.y);
			this.y = 0;
		}
		return this;    
	}
}