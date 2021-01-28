////////////////////////////////////////////////////////

function Galaxy(rings){
	this.rings = rings;
	this.systems = [];
	this.generate();
};
Galaxy.prototype.generate = function(){
	var n = 7;
	for (var i = (this.rings.length - 1); i >= 0; i--) {
		n++;
		if (n > 8) { n = 1; }
		this.systems.push(new System(this, this.rings[i], n));
	}
};

function System(galaxy, ring, octant){
	this.galaxy = galaxy;
	this.name = ring + '-' + octant;
	this.ring = ring;
	this.radius = 4000 + randInt(4000);
	this.center = new Coords(0, 0);
	this.sun = null;
	this.planets = [];
	this.generate();
};
System.prototype.generate = function(){
	var o=this;
	var scale = o.radius / 2;
	var p = (o.ring == "Z") ? 2 : randInt(10);
	var romanNumerals = ["I","II","III","IV","V","VI","VII","VII","IX","X"];
	var planet;
	var totalJumpFuel = 100 + randInt(80);
	var R = size() * 2;
	var theta, coords;
	function x(){ 
		var x = scale * 0.5;
		return rand(x * 2) - x;
	}
	function size(){ return (rand(scale/20) + 10); }
	o.sun = new Sun({ name: o.name + ' sun', x: 0, y: 0, r: R });
	for(var i=0; i < p; i++){
		R += (rand(scale/p) + scale/50);
		theta = rand(PI2);
		coords = new Coords(0,0);
		coords.setPolar(R, theta);
		planet = new Planet({ name: o.name + '-' + romanNumerals[i], x: coords.x, y: coords.y, r: size() });
		planet.jumpFuel = Math.ceil(totalJumpFuel / p);
		console.log(planet.name, Math.ceil(totalJumpFuel / p), R);
		o.planets.push(planet);	
	}
};

function Sun(opt) {
	Obj.call(this, opt);
	this.isImmovable = true;
	this.isEdgeBound = true;
	this.isPlasma = true;
	this.isMassAbsorbing = true;
	this.color.r = 255;
	this.color.g = 150;
	this.generate();
	this.fireArea = this.earthArea;
};
Sun.prototype = new Obj();
Sun.prototype.generate = function(){
	this.setAreaBySize("earth", this.radius);
	this.setup();
}

function Planet(opt) {
	Obj.call(this, opt);
	this.isImmovable = true;
	this.isEdgeBound = true;
	this.isMassAbsorbing = true;
	this.color = {r: 100, g: 100, b: 100};
	this.jumpFuel = 0;
	this.generate();
}
Planet.prototype = new Obj();
Planet.prototype.generate = function(){
	this.setAreaBySize("earth", this.radius);
	this.setup();
}
function Ship(opt) {
	opt = {name: "ship", x: 0, y: 0};
	Obj.call(this, opt);
	this.isShip = true;
	this.isEdgeBound = true;
	this.jumpFuel = 100;
	this.isElementScanOn = false;
	this.isThermoScanOn = false;
	this.isEngineOn = true;
	//this.isRepairsOn = false;
};
// http://stackoverflow.com/a/15192747 ??
//Ship.prototype = Object.create(Obj);
//Ship.prototype.constructor = Ship;
Ship.prototype = new Obj();
Ship.prototype.propulsion = function(dir){
	if (!this.isEngineOn) { return false; }
	dir.multiply(600 + this.mass/2);
	//console.log(dir);
	this.force.add(dir);
}
Ship.prototype.toggleEngine = function(){
	this.isEngineOn = !this.isEngineOn;
	//if (this.isEngineOn) { this.isRepairsOn = false; }
	return (this.isEngineOn) ? 'Engine On' : 'Engine Off';
}
/*
Ship.prototype.autoSystems = function(){
	
}
Ship.prototype.toggleRepairs = function(){
	if (this.isEngineOn) { return "Cannot activate Repair Bots while Engines are On"; }
	this.isRepairsOn = !this.isRepairsOn;
	return (this.isRepairsOn) ? "Repairs On" : "Repairs Off";
}
*/
Ship.prototype.draw = function(ctx, zoom, offset){
	var x = this.pos.x * zoom + offset.x;
	var y = this.pos.y * zoom + offset.y;
	var r = this.radius * zoom;
	var rBig = r * 1.5;
	var rSmall = r * 0.8;
	var c = ctx;
	this.drawTrail(c, zoom, offset);

	c.save();
	/*
	c.fillStyle = "#ff0";
	c.globalAlpha = 0.5;
	c.beginPath();
	c.arc(x, y, r, 0, PI2, true);
	//c.quadraticCurveTo(x, y + rSmall, x - rSmall, y);
	c.closePath();
	c.stroke();
	*/

	c.globalAlpha = 1.0;
	c.fillStyle = "#f44";
	
	c.lineWidth = r * 0.05;
	c.beginPath();
	//c.moveTo(x, y - r);
	c.moveTo(x, y + (r*0.1));
	c.lineTo(x + rBig, y);
	//c.lineTo(x + r/2, y + rSmall);
	//c.lineTo(x - r/2, y + rSmall);
	c.bezierCurveTo(	x + r * 0.5, y + r * 1.1, x - r * 0.5, y + r * 1.1, 	x - rBig, y); 
	c.lineTo(x - rBig, y);
	c.closePath();
	c.fill();
	//c.stroke();

	// Pilot
	c.save();
	c.fillStyle = "#fff";
	c.globalAlpha = 1.0;
	c.beginPath();
	var u = (r * 0.2);
	c.moveTo(x - u, y + u);
	c.quadraticCurveTo(	x - u * 2.5, y + u * 0.6, 				x - u * 1.5, y); // left cheek
	
	c.bezierCurveTo(	x - u * 3.2, y - u * 4, 	x - u * 1.31, y - u * 4.1, 	x - u, y - u * 0.2); // left ear
	
	c.quadraticCurveTo(	x, y - u * 0.4, 						x + u, y - u * 0.2); // head

	c.bezierCurveTo(	x + u * 1.31, y - u * 4.1, 	x + u * 3.2, y - u * 4, 	x + u * 1.5, y); // right ear
	c.quadraticCurveTo(	x + u * 2.5, y + u * 0.6, 				x + u, y + u); // right cheek
	c.quadraticCurveTo(	x, y + u * 1.4, 							x - u, y + u); // chin
	c.closePath();
	c.fill();
	c.fillStyle = "#000";
	c.beginPath();
	c.arc(x - u * 0.9, y + u * 0.4, u * 0.3, 0, Math.PI, true);
	c.arc(x + u * 0.9, y + u * 0.4, u * 0.3, 0, Math.PI, true);
	//c.arc(x, y + u * 0.5, u * 0.8, Math.PI, PI2, true);
	c.closePath();
	c.fill();
	c.restore();

	c.fillStyle = "#aff";
	c.strokeStyle = "#366";
	c.globalAlpha = 0.5;
	c.beginPath();
	c.arc(x, y - u * 0.2, r * 0.5, 0, PI2, true);
	//c.arc(x, y + u * 0.5, u * 0.8, Math.PI, PI2, true);
	c.closePath();
	c.fill();
	c.stroke();


	c.fillStyle = "#cfc";
	c.strokeStyle = "#f44";
	c.lineWidth = r * 0.2;
	c.globalAlpha = 0.25;
	c.beginPath();
	c.moveTo(x - r, y);
	c.bezierCurveTo(x - u * 3, y - (r * 1.3), x + u * 3, y - (r * 1.3), x + r, y);
	c.quadraticCurveTo(x, y + rSmall, x - r, y);
	c.closePath();
	c.fill();
	c.globalAlpha = 1.0;
	c.stroke();

	c.restore();
}
Ship.prototype.harvestPlanet = function(planet){
	if (typeof planet !== 'object') {
		if (this.colliding.length > 0) {
			planet = this.colliding[0];
		} else {
			return "Not grounded on a planet";
		}
	}
	var f = Math.min(10, planet.jumpFuel);
	if (f == 0) {
		return "No fuel left on this planet";
	} else if (isNaN(f)) {
		return "No fuel";
	}
	planet.jumpFuel -= f;
	this.jumpFuel += f;
	return "Harvesting +" + f + " Fuel";
}
Ship.prototype.repair = function(){
	if (this.isEngineOn) {
		return "Cannot repair while engine is on";
	} else {
		var rep = randInt(9) + 1;
		this.structure += rep;
		this.structure = Math.min(this.structure, this.mass);
		return "Repairing +" + rep + " Hull";
	}
}


