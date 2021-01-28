//==== Generic Physical Object (Planetoid/Sun)

function Obj(opt) {
	if (typeof opt !== 'object') { 
		opt = {name: '', x: 0, y: 0, r: 100}; 
	}
	if (typeof opt.x !== 'number') { opt.x = 0; }
	if (typeof opt.y !== 'number') { opt.y = 0; }
	this.name = opt.name;
	this.pos 	= new Coords(opt.x, opt.y);
	this.vel 	= new Coords(0,0);
	this.acc 	= new Coords(0,0);
	this.force 	= new Coords(0,0);
	this.impulse = new Coords(0,0);

	this.radius = opt.r;

	this.fireArea = 0;
	this.earthArea = 0;
	this.airArea = 0;
	this.waterArea = 0;
	this.fireSize = 0;
	this.earthSize = 0;
	this.waterSize = 0;
	this.airSize = 0;

	this.structure = 0; // hit points
	this.mass = 0;
	this.color = { r: 80, g: 70, b: 50 };
	this.isMassAbsorbing = false;
	this.isPlasma = false;
	this.isImmovable = false;
	this.isEdgeLooping = false;
	this.isEdgeBound = false;
	this.elasticity 	= 0.9;
	this.groundFriction = 0.5;
	this.waterFriction 	= 0.9;
	this.airFriction 	= 0.95;
	this.plasmaFriction = 0.9;
	this.illumination = 0;
	this.luminosity = 0;
	this.density = 1;
	this.heat = 0;
	this.collisionHeat = 0;
	this.isFrozen = false;
	this.isBoiling = false;
	this.colliding = [];
	this.isGrounded = false;
	this.life = 0;
	this.evolution = 0; // 0-100%

	this.trail = [];
	this.maxTrail = 12;
}
Obj.prototype.hotThreshold = 900;
Obj.prototype.absorbEarthRate = 0.01;
Obj.prototype.absorbWaterRate = 0.2;
Obj.prototype.absorbAirRate = 0.4;
Obj.prototype.bigG = 0.5;

Obj.prototype.absorbEarth = function(b){
	if (this.isMassAbsorbing && b.isMassAbsorbing) {
		var a = this.absorbEarthRate;
		if (this.isPlasma) a *= 10;
		else a *= (this.mass/b.mass);
		a = Math.min(b.earthArea, a)
		this.earthArea += a;
		b.earthArea -= a;
	}
}
Obj.prototype.absorbWater = function(b){   
	if (b.waterArea > 0) {
		var a = (b.isFrozen) ? this.absorbEarthRate : this.absorbWaterRate;
		a *= (this.mass/b.mass);
		a = Math.min(b.waterArea, a);
		this.waterArea += a;
		b.waterArea -= a;
	}
}
Obj.prototype.absorbAir = function(b){   
	if (b.airArea > 0) {
		var a = this.absorbAirRate * (this.mass/b.mass);
		a = Math.min(b.airArea, a);
		this.airArea += a;
		b.airArea -= a;
	}
}
Obj.prototype.setup = function(){
	this.setMass();
	this.setRadiusSizes();
	this.structure = this.mass;
}
Obj.prototype.setMass = function(){
	this.mass = ((this.fireArea + this.earthArea) * this.density)
		+ (this.waterArea / 2)
		+ (this.airArea / 4);
	return this;
}
Obj.prototype.setAreaBySize = function(area, s){
	this[area + "Area"] = Math.PI * Math.pow(s, 2);
}
Obj.prototype.setRadiusSizes = function(){
	var o=this;
	o.fireSize = Math.sqrt(o.fireArea / Math.PI);
	var a = this.fireArea + o.earthArea;
	o.earthSize = Math.sqrt(a / Math.PI);
	if (o.waterArea > 0) {
		a += o.waterArea;
		o.waterSize = Math.sqrt(a / Math.PI);
	} else {
		o.waterSize = 0;
	}
	if (o.airArea > 0) {
		a += o.airArea;
		o.airSize = Math.sqrt(a / Math.PI);
	} else {
		o.airSize = 0;
	}
	if (typeof o.radius === 'undefined') {
		o.radius = o.earthSize;
	}
	return this;
}
Obj.prototype.setNewCollisionVels = function(o2, elasticity){
	// http://www.gamasutra.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php?page=3
	var o1 = this;
	if (o1.mass <= 0 || o2.mass <= 0) {
		return false;
	}
	//console.log(o1.name, o2.name);
	//console.log("original", o1.vel.x, o1.vel.y, o2.vel.x, o2.vel.y);
	//console.log("momentum before", (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude()));
	var p = (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude());
	var n = o1.pos.getUnitVector(o2.pos);
	//console.log("n = ", n);
	var a1 = o1.vel.getDot(n);
	var a2 = o2.vel.getDot(n);
	var optimizedP = (2 * (a1 - a2)) / (o1.mass + o2.mass);
	o1.vel.add( n.getMultiply(-1 * optimizedP * o2.mass) );
	o1.vel.multiply(elasticity);
	o2.vel.add( n.getMultiply(optimizedP * o1.mass) );
	o1.vel.multiply(elasticity);
	//var pNew = (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude());
	//console.log(pNew - p);
	//if (pNew > p) {
		 //console.log(o1.name, o2.name, "pNew > p", pNew, p);
	//}else console.log(o1.name, o2.name, "pNew <= p", pNew, p);
	//console.log("after", newV1.x, newV1.y, newV2.x, newV2.y);
	//console.log("momentum after", (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude()));
	return true;
}
Obj.prototype.physicsOneObject = function(b){
	var o=this;
	if (b.mass > 0) {
		var r = o.pos.getDistance(b.pos);
		var mm, lm; // More Massive, Less Massive
		var edgeToEdgeDistance = r - o.earthSize - b.earthSize;
		var waterToWaterDistance = r - o.waterSize - b.waterSize;
		var airToAirDistance = r - o.airSize - b.airSize;
		var L = 3000;
			
		// Calculate illumination
		if (b.isPlasma && edgeToEdgeDistance <= L) {
			var lum = 1 - (edgeToEdgeDistance / L);
			o.illumination += lum;
			o.heat += (lum * 1000);
		}
		
		// Get the absorder (mm = more massive) 
		// and the absorbee (lm = less massive)
		if ((o.mass >= b.mass && !b.isPlasma) || (o.isPlasma && !b.isPlasma)) {
			mm = o;
			lm = b;
		} else {
			mm = b;
			lm = o;
		}
		
		//if (o.isShip) console.log(Math.round(edgeToEdgeDistance) )

		if (Math.round(edgeToEdgeDistance) <= 0) {    // Earth Collision! No gravity
 
			mm.absorbEarth(lm);
			mm.absorbWater(lm);
			mm.absorbAir(lm);
			
			// Collision overlap issues
			o.collisionHeat += 10;
			o.colliding.push(b);
			
			var pushBack = (edgeToEdgeDistance / 1);
			if (b.isPlasma || o.isPlasma) {
				o.vel.multiply(o.plasmaFriction);
				// Plasma damage (TODO: make separate function for this)
				o.structure -= 1.5;
			} else {
				
				if (o.mass <= b.mass) {
					o.pos.add( o.pos.getUnitVector(b.pos).multiply(pushBack) );
				} else {
					b.pos.add( b.pos.getUnitVector(o.pos).multiply(pushBack) );           
				}
				o.setMass().setRadiusSizes();

				o.setNewCollisionVels(b, o.elasticity);
				o.applyFriction(b, "ground");
			}
			// Damage to life
			o.damageLife(o.life/100);
			b.damageLife(b.life/100);
			//o.applyGravityForce(b);
			
		} else {                					// Not collided, do gravity

			o.applyGravityForce(b);

			if (Math.round(waterToWaterDistance) <= 0) {
				o.applyFriction(b, "water");
				mm.absorbWater(lm);
				mm.absorbAir(lm);
			} else if (Math.round(airToAirDistance) <= 0) {
				o.applyFriction(b, "air");
				mm.absorbAir(lm);
			}
		}
	} 
}
Obj.prototype.applyGravityForce = function(o2) {
	var o1=this;
	// Apply gravity forces: F = G (m1 m2) / r^2
	// http://en.wikipedia.org/wiki/Newton's_law_of_universal_gravitation#Vector_form
	//console.log("Forces on", o1.name, " due to ", o2.name);
	var r = o1.pos.getDistance(o2.pos);
	var rv = o1.pos.getUnitVector(o2.pos);
	//console.log("unit vector", JSON.stringify(rv));
	
	var Gmm = o1.bigG * o1.mass * o2.mass;
	var rSquared = Math.pow(r, 2);
	var n = (rSquared == 0) ? 0 : (Gmm/rSquared);
	rv.multiply(n);
	//console.log(JSON.stringify(rv));
	o1.force.add(rv);
	//console.log("physics", i, b, o1.bigG, o1.mass, o2.mass);
	//console.log(rSquared, rv, fm);
}
Obj.prototype.applyFriction = function(o2, type){
	var o1=this;
	o1.vel.multiply((o1[type + "Friction"] + o2[type + "Friction"])/2);
}
Obj.prototype.physics = function(nearbyEnts){
	var o=this;
	var ne;
	// time = 1
	o.setMass().setRadiusSizes();
	o.colliding = [];
	
	// Cool off
	if (o.collisionHeat > 0) o.collisionHeat -= 10;
	
	if (o.isPlasma) {		// Stay hot if plasma
		o.heat = 1000;
		o.illumination = 1;
	} else {
		o.heat = 0;
		o.illumination = 0;
	}
	
	for(var i = 0; i < nearbyEnts.length; i++) {
		ne = nearbyEnts[i];
		o.physicsOneObject(ne);
	}
	
	if (o.illumination > 1) {
		o.illumination = 1;
	}
	if (o.heat > o.hotThreshold) {
		o.isFrozen = false;
		o.isBoiling = true;        
		var a = Math.min(o.waterArea, 10);
		o.waterArea -= a;
		o.airArea += a;
		var a = Math.min(o.waterArea, 2);
		o.airArea -= a;

		o.damageLife(100);
	} else if (o.heat <= 0) {
		o.isFrozen = true;
		o.isBoiling = false;        
	} else {
		o.isFrozen = false;
		o.isBoiling = false;
	}

	if (o.isImmovable) {
		o.force.clear();
		o.acc.clear();
		o.vel.clear();
	} else if (o.mass > 0) {
		// Friction to slow down suns
		//if (o.isPlasma) o.vel.multiply(0.99);
		// Standard physics...
		o.force.add(o.impulse);
		var forceAcc = new Coords((o.force.x / o.mass), (o.force.y / o.mass));
		o.acc.add(forceAcc);
		o.vel.add(o.acc);
		o.pos.add(o.vel);
		o.acc.clear();
		o.force.clear();
	} else {
		//console.log(o.name + " has mass zero");
	}
	
	o.isGrounded = (o.colliding.length > 0 && o.vel.getMagnitude() < 0.5) ? true : false;
	//if (o.isShip) console.log(o.colliding, o.vel.getMagnitude(), o.isGrounded);
}
Obj.prototype.damageLife = function(a){
	var o=this;
	if (o.life > 0) {
		o.life -= Math.min(o.life, rand(a));
	}
	if (this.life <= 0) {
		o.life = 0;
		o.evolution -= 1;
		if (o.evolution < 0) o.evolution = 0;
	}
}
Obj.prototype.checkLife = function(){
	var o=this;
	if (o.earthArea > 1000 && o.waterArea > 1000 
		&& o.airArea > 1000 && o.heat > 0) 
	{
		if (o.evolution < 100) {
			o.evolution++;
		} else {
			o.life += rand(5);
		}
		
	} else {
		o.damageLife(5);
	}
}
Obj.prototype.getColorString = function(type){
	var o = this;
	var lum = Math.max(o.illumination, 0.35);
	var c = [];
	switch (type){
		case "earth":
		case "fire":      c = [o.color.r, o.color.g, o.color.b];  break;
		case "water":     c = [0,100,255]; break;
		case "air":       c = [230,200,240]; break;
	}
	if (o.isFrozen) {
		if (type == "water") { c = [200,200,255]; }
	} else if (o.isBoiling) {
		var heatOver = (o.heat - o.hotThreshold);
		c[0] += (heatOver / 2);
	}
	if (o.collisionHeat > 0) c[0] += 50;
	var cStr = "rgb(" 
		+ Math.min(Math.floor(c[0] * lum), 255)
		+ "," + Math.min(Math.floor(c[1] * lum), 255)
		+ "," + Math.min(Math.floor(c[2] * lum), 255)
		+ ")";
	//console.log(c);
	return cStr;
}

Obj.prototype.setTrail = function(){
	this.trail.push(this.pos.getCopy());
	if (this.trail.length > this.maxTrail) {
		this.trail.splice(0, 1);
	}
}

//Obj.prototype.draw = function(ctx, zoom, offset){
	// TODO
//}

Obj.prototype.drawTrail = function(ctx, zoom, offset){
	var o=this;
	ctx.save();
	ctx.beginPath();
	ctx.globalAlpha = 0.1;
	ctx.fillStyle = "#aaa";
	function drawTrailItem(i){
		var x = o.trail[i].x * zoom + offset.x;
		var y = o.trail[i].y * zoom + offset.y;
		var a = (o.maxTrail - i);
		var r = o.radius;
		r = r * ( a == 0 ? 0.1 : (0.9 / a + 0.1) );
		r = r * zoom;
		//if (o.isShip) console.log(o.radius, (o.maxTrail - i), o.maxTrail, i, " = ", r);
		ctx.beginPath();
		ctx.arc(x, y, r, 0, PI2, true);
		ctx.closePath();
		ctx.fill();
	}
	for (var i=0; i < o.trail.length-1; i++) {
		drawTrailItem(i);
	}
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

