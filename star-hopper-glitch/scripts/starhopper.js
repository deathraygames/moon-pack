// Requires rand.js, Coords.js, Galaxy.js

// Globals
var PI2 = Math.PI*2;

g = {
	galaxy: null,
	maxEnts: 240,
	ents: [],
	stars: [],
	bgStars: [],
	particles: [],
	terra: null,
	intId: 0,
	iteration: 0,
	endIter: 53000000,
	timeBetweenIntervals: 30,
	intId2: 0,
	timeBetweenIntervals2: 1000,
	size: null, // screen size
	halfSize: null,
	player: null,
	canvasElt: null,
	introElt: null,
	hudElt: null,
	isWon: false,
	isObjectInfoOn: false,
	isSplash: true,
	playerSystemIndex: 0,
	zoomLevel: 5,
	HOME: "Terra",
	ZOOM_LEVELS: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 3, 5, 8, 13, 21, 34],
	gebi: function(x){
		return document.getElementById(x);
	}
};
g.getCurrentSystem = function(){
	return this.galaxy.systems[this.playerSystemIndex];
}
g.draw = function(){
	var o=this;
	var c=ctx;
	c.save();
	c.clearRect(0,0,o.size.x,o.size.y);
	//c.fillRect(0,0,100,100);
	//c.beginPath();
	var sys = o.getCurrentSystem();
	var star, p, ent;
	var i, el = o.ents.length;
	var r = 0, g = 0, b = 0;;
	var x, y;
	var nearestSun = null;
	var sunCount = 0;
	var zoom = o.getZoomMultiplier();
	//console.log(o.player.pos.x);
	var offsetX = -1 * o.player.pos.x * zoom + o.halfSize.x,
		offsetY = -1 * o.player.pos.y * zoom + o.halfSize.y,
		sOX = -0.3 * o.player.pos.x * zoom + o.halfSize.x,
		sOY = -0.3 * o.player.pos.y * zoom + o.halfSize.y,
		bgSOX = -0.1 * o.player.pos.x * zoom + o.halfSize.x,
		bgSOY = -0.1 * o.player.pos.y * zoom + o.halfSize.y;
	var offset = new Coords(offsetX, offsetY);
	// Draw background stars
	c.shadowOffsetX = 0;
	c.shadowOffsetY = 0;
	
	for(i = 0; i < o.stars.length; i++) {
		o.drawStar(o.stars[i], sOX, sOY);
	}
	for(i = 0; i < o.bgStars.length; i++) {
		o.drawStar(o.bgStars[i], bgSOX, bgSOY);
	}

	// Draw planet orbit circles and lines
	c.save();
	c.strokeStyle = "#7777ff";
	c.globalAlpha = 0.2;
	for(i=0; i<sys.planets.length; i++) {
		c.beginPath();
		c.arc(offsetX, offsetY, o.getCurrentSystem().center.getDistance(sys.planets[i].pos) * zoom, 0, PI2, true);
		c.shadowColor = '#eee';
		c.shadowBlur = 30 * zoom;
		c.stroke();
		if (o.isObjectInfoOn) {
			c.beginPath();
			c.strokeStyle = "#7777ff";
			c.moveTo(o.halfSize.x, o.halfSize.y);
			c.lineTo(sys.planets[i].pos.x * zoom + offsetX, sys.planets[i].pos.y * zoom + offsetY);
			c.stroke();
		}
	}
	c.restore();
	if (o.isObjectInfoOn) {
		c.save();
		c.strokeStyle = "#aa7733";
		c.globalAlpha = 0.2;		
		c.beginPath();
		c.moveTo(o.halfSize.x, o.halfSize.y);
		c.lineTo(offsetX, offsetY);
		c.stroke();
		c.restore();
	}
	
	
	c.save();
	for(i = el-1; i >= 0; i--){
		ent = o.ents[i];
		if (typeof ent.draw === 'function') {
			ent.draw(c, zoom, offset);
		} else if (ent.isPlasma && ent.earthSize > 0) {
			o.drawSun(ent, zoom, offset);
			// Get distance to player
			nearestSun = ent.pos.getDistance(o.player.pos);
			sunCount++;
		} else if (!ent.isPlasma) {
			x = ent.pos.x * zoom + offsetX;
			y = ent.pos.y * zoom + offsetY;
			//console.log(ent.isShip, "x", x, "ent pos x", ent.pos.x, "player pos x", o.player.pos.x, "halfsize x", o.halfSize.x, "size x", o.size.x); 
		 
			if (ent.earthSize > 0) {
				o.drawCircle(x, y, ent.earthSize * zoom, 1.0, ent.getColorString("earth"));
			}
			if (ent.waterSize > 0) {
				o.drawCircle(x, y, ent.waterSize * zoom, 0.7, ent.getColorString("water"));
			}
			if (ent.airSize > 0) {
				o.drawCircle(x, y, ent.airSize * zoom, 0.3, ent.getColorString("air"));              
			}
		}
		if (ent.mass > 10) {
			o.drawText(ent, x, y);
		}

		//c.stroke();
	} // end for loop over ents
	c.restore();
	

	// Draw ring for system border
	c.save();
	c.beginPath();
	c.globalAlpha = 0.1;
	c.setLineDash([5, 15]);
	c.strokeStyle = "#ee77aa";
	c.arc(offsetX, offsetY, o.getCurrentSystem().radius * zoom, 0, PI2, true);
	var sysR2 = sys.radius * 2 * zoom;
	c.rect(offset.x - sys.radius * zoom, offset.y - sys.radius * zoom, sysR2, sysR2);
	c.stroke();
	c.restore();

	/*
	if (o.isObjectInfoOn) {
		c.fillStyle = "#999";
		c.fillText("-¤ StarHopper ¤- "
			+ o.ents.length + " objects (" 
			+ sunCount + " sun" + ((sunCount==1) ? "":"s") 
			+ "), nearest sun: " 
			+ (Math.round(nearestSun/100)*100) , 20,20);
	}
	*/
}

g.drawStar = function(star, offsetX, offsetY){
	var x = star.pos.x * this.getZoomMultiplier() + offsetX;
	var y = star.pos.y * this.getZoomMultiplier() + offsetY;
	var twinkle = (rand(1) < 0.002);
	ctx.save();
	ctx.shadowColor = '#ffff00';
	ctx.shadowBlur = (twinkle) ? randInt(80) : 70;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.arc(x, y, star.size, 0, PI2, true);
	ctx.fillStyle = (twinkle) ? "#fff" : "#aa8";
	ctx.fill();
	ctx.closePath();
	ctx.restore();
}
g.drawSun = function(ent, zoom, offset){
	var x = ent.pos.x * zoom + offset.x;
	var y = ent.pos.y * zoom + offset.y;
	ctx.save();
	ctx.fillStyle = ent.getColorString("fire");
	ctx.shadowColor = '#ffff00';
	ctx.shadowBlur = 30;	
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.arc(x, y, (ent.earthSize * zoom), 0, PI2, true);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}
g.drawCircle = function(x, y, radius, alpha, color) {
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.globalAlpha = alpha;
	ctx.arc(x, y, radius, 0, PI2, true);
	ctx.fillStyle = color;
	ctx.shadowColor = '#000';
	ctx.shadowBlur = -30;	
	ctx.fill();
	ctx.restore();
}

g.drawText = function(ent, x, y){
	var R = Math.round;
	ctx.save();
	ctx.font = "14px Verdana";

	if (this.player.isElementScanOn) {
		var esx = x + ent.earthSize + 8;
		ctx.fillStyle = "#ccc";
		ctx.fillText(R(ent.earthArea) + "e" , esx, y-12);
		ctx.fillText(R(ent.waterArea) + "w" , esx, y);
		ctx.fillText(R(ent.airArea) + "a" , esx, y+12);
	}
	if (this.player.isThermoScanOn) {
		if (ent.isFrozen) ctx.fillStyle = "#33a";
		else if (ent.isBoiling) ctx.fillStyle = "#a33";
		else ctx.fillStyle = "#ec3";
		ctx.fillText("" + R(ent.heat) + "°", x - 10, y + ent.earthSize + 24);           
	}
	/*
	if (ent.life > 0) {
		ctx.fillStyle = "#6f6";
		ctx.fillText("Life: " + R(ent.life) , x-30, y-24);
	} else if (ent.evolution > 0) {
		ctx.fillStyle = "#6f6";
		ctx.fillText("evolution: " + R(ent.evolution) + "%", x-45, y-30);
	}
	*/
	/*
	if (this.isObjectInfoOn) {
		ctx.fillStyle = "#77f";
		ctx.fillText(ent.name, x-20, y-20);
		if (ent.isShip) {
			ctx.fillText("" + Math.round(ent.pos.x) + "," + Math.round(ent.pos.y), x-20, y+20);
		}
	}
	*/
	ctx.restore();
}

g.zoom = function(n) {
	var o=this;
	o.zoomLevel = Math.max(Math.min(o.zoomLevel + n, o.ZOOM_LEVELS.length - 1), 0);
}
g.getZoomMultiplier = function(){
	return this.ZOOM_LEVELS[this.zoomLevel];
}



g.jump = function(systemIndex){
	var o=this;
	var jumpAmount = 100;
	if (o.player.jumpFuel < jumpAmount) {
		o.hud.addMessage("Not enough jump fuel");
	} else if (o.getCurrentSystem().ring == "A") {
		o.hud.addMessage("You're at the final system in the galaxy");
	} else {
		o.switchSystem(systemIndex);
		o.hud.renderSystemName();
		o.player.pos.x = o.getCurrentSystem().radius * -0.7;
		o.player.vel.clear();
		o.player.acc.clear();
		o.player.jumpFuel -= jumpAmount;
	}
}
g.switchSystem = function(systemIndex){
	var o=this;
	if (typeof systemIndex === 'number') {
		o.playerSystemIndex = systemIndex;
	} else {
		o.playerSystemIndex += 1;
	}
	o.spawnSystem();
}
g.hud = {
	messages: [],
	timer: 0,
	addMessage: function(m){
		if (m === false) return false;
		this.messages.push({text: m, timestamp: new Date()});
		this.renderMessages();
	},
	renderAll: function(){
		this.renderMessages();
		this.renderSystemName();
		this.renderStats();
	},
	renderMessages: function(){
		var o=this;
		var h = "";
		var now = new Date();
		for(var i=0; i<o.messages.length; i++){
			if ((now - o.messages[i].timestamp) < 6000) {
				h += '<li>' + o.messages[i].text + '</li>';
			}
		}
		g.gebi("hud-messages").innerHTML = h;
	},
	renderSystemName: function(){
		g.gebi("hud-system-name").innerHTML = g.getCurrentSystem().name;	
	},
	renderStats: function(){
		g.gebi("jump-fuel-amount").innerHTML = Math.ceil(g.player.jumpFuel);
		g.gebi("hull-amount").innerHTML = Math.round(g.player.structure * 100 / g.player.mass);
	},
	start: function(){
		var o=this;
		o.stop();
		o.timer = setInterval(function(){ o.renderAll(); }, 500);
	},
	stop: function(){
		clearInterval(this.timer);
	}
}



//==== Make Things

g.makeGalaxy = function(){
	var o=this;
	o.galaxy = new Galaxy(['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']);
	o.terra = o.galaxy.systems[o.galaxy.systems.length - 1];
	o.terra.name = "The Terran System";
	o.terra.planets[0].name = o.HOME;
	o.spawnSystem();
	console.log("Made galaxy", o.galaxy, "\ncurrent system", o.getCurrentSystem(), "\nwith entities", o.ents);
}
// TODO: Move into System generation
g.spawnSystem = function(){
	var o=this;
	o.ents = [o.player];
	o.stars = [];
	o.bgStars = [];
	o.makeStars(o.getCurrentSystem().radius / 20, o.stars);
	o.makeStars(o.getCurrentSystem().radius / 10, o.bgStars);
	o.ents.push(o.getCurrentSystem().sun);
	o.ents = o.ents.concat(o.getCurrentSystem().planets);
	o.makeAsteroids(3); //20);
	//o.makeSun("Sun1");
	//o.makeSun("Sun2");
}
g.makeAsteroid = function(n,x,y,s){
	var o=this;
	if (typeof x == 'undefined') x = 0; //o.player.pos.x;
	if (typeof y == 'undefined') y = 0; //o.player.pos.y;
	if (typeof s == 'undefined') s = (rand(8)) + 1;
	var sz = Math.max(o.size.x, o.size.y);
	x += randAround(sz);
	y += randAround(sz);
	var ent = new Obj({name: n, x: x, y: y});
	ent.isMassAbsorbing = true;
	ent.isEdgeLooping = true;
	ent.vel.x = randAround(20);
	ent.vel.y = randAround(20);
	// Set areas
	ent.setAreaBySize("earth", s);
	if (rand(1) < 0.2) {
		ent.waterArea = rand(300) + 100;
	}
	if (rand(1) < 0.25) {
		ent.airArea =  rand(300) + 100;
	}
	ent.setup();
	o.ents.push(ent);
	return ent;
}
g.makeAsteroids = function(n){
	if ((this.ents.length+n) <= this.maxEnts) {
		for (var i = 0; i < n; i++) {
			this.makeAsteroid("O" + i, this.player.pos.x, this.player.pos.y);
		}
	}
}
g.makeSun = function(n,x,y) {
	var sun = this.makeAsteroid(n,x,y);
	sun.pos.x = rand(this.getCurrentSystem().radius);
	sun.pos.y = rand(this.getCurrentSystem().radius);
	sun.isPlasma = true;
	sun.color.r = 255;
	sun.color.g = 150;
	sun.fireArea = sun.earthArea;
}
g.makeStar = function(starArray){
	var z=this.getCurrentSystem().radius;
	var star = { 
		pos: new Coords(
			randAround(z),
			randAround(z)
		),
		size: (Math.floor(rand(2)) + 1)
	};
	starArray.push(star);
}
g.makeStars = function(n, starArray){
	for (var i = 0; i < n; i++) {
		this.makeStar(starArray);
	}
}
g.makePlayerShip = function(n) {
	var o=this;
	var s = new Ship({name: n, x: 0, y: 0});
	s.color = { r: 50, g: 190, b: 50 };
	s.isMassAbsorbing = false;
	s.earthArea = 200;
	s.luminosity = 0.2;
	s.density = 1.5;
	s.setup();
	o.player = s;
	o.ents.push(s);    
}



g.moment = function(){
	var o=this;
	var sys = o.getCurrentSystem();
	var nearbyEnts;
	var i;
	var ent;
	// Loop over all entities
	for(i = 0; i < o.ents.length; i++) {
		nearbyEnts = o.ents.slice(0);
		nearbyEnts.splice(i,1);
		ent = o.ents[i];
		ent.physics(nearbyEnts);
		o.checkEdges(sys, ent);
		ent.setTrail();
	}
	o.draw();
	o.checkGameOver();
	o.checkVictory();
}
g.checkEdges = function(sys, ent){
	var edge = sys.radius;
	var negEdge = edge * -1;
	if (ent.pos.getDistance(sys.center) > edge) {
		if (ent.isEdgeLooping) {
			if (ent.pos.x < negEdge) 	ent.pos.x += (edge * 2);
			else if (ent.pos.x > edge) 	ent.pos.x += (negEdge * 2);
			if (ent.pos.y < negEdge) 	ent.pos.y += (edge * 2);
			else if (ent.pos.y > edge) 	ent.pos.y += (negEdge * 2);
		}
		if (ent.isEdgeBound) {
			if (ent.pos.x > edge)			{ ent.pos.x = edge; ent.vel.clear(); }
			else if (ent.pos.x < negEdge)	{ ent.pos.x = negEdge; ent.vel.clear(); }
			if (ent.pos.y > edge)			{ ent.pos.y = edge; ent.vel.clear(); }
			else if (ent.pos.y < negEdge)	{ ent.pos.y = negEdge; ent.vel.clear(); }
		}
	}	
}
g.reclaimEnts = function(){
	for(var i = 0; i < this.ents.length; i++){
		if (this.ents[i].mass <= 0) {
			this.ents.splice(i,1);
		}
	}
}
g.checkGameOver = function(){
	var o=this;
	if (o.player.mass <= 0 || o.player.structure <= 0) {
		this.stop();
		this.gebi("gameover").style.display = "block";
	}
}
g.checkVictory = function(){
	var o=this;
	if (!o.isWon && o.player.colliding.length > 0 && o.player.colliding[0].name == o.HOME) {
		o.isWon = true;
		o.stop();
		o.gebi("victory").style.display = "block";	
	}
}
g.start = function(){   
	var o = this;    
	//console.log(this.ents);
	o.intId = window.setInterval(function(){
		o.iteration++;
		if (o.iteration < o.endIter){
			o.moment();
		} else {
			o.stop();
		}
	}, this.timeBetweenIntervals);
	o.intId2 = window.setInterval(function(){
		//for(var i = 0, el = o.ents.length; i < el; i++){
		//	o.ents[i].checkLife();
		//}
		o.reclaimEnts();
		o.checkGameOver();
		o.checkVictory();
	}, this.timeBetweenIntervals2);
}
g.stop = function(){
	console.log("Stopped");
	clearInterval(this.intId);
	clearInterval(this.intId2);
	this.intId = 0;
}


//==== SETUP

g.setup = function(){
	var o=this;
	
	o.canvasElt = document.getElementById("s");
	o.introElt = document.getElementById("intro");
	o.splashElt = document.getElementById("splash");
	o.hudElt = document.getElementById("hud");
	o.isSplash = true;
	o.splashElt.style.display = "block";
	
	o.setupScreen();
	window.ctx = o.canvasElt.getContext('2d');
	ctx.font = "14px Verdana";
	//ctx.webkitImageSmoothingEnabled = false;
	//ctx.mozImageSmoothingEnabled = false;
	//ctx.imageSmoothingEnabled = false;
	ctx.fillStyle = "red";
	ctx.strokeStyle = "yellow";
	//ctx.fillText("Sample String", 10, 50);    
	ctx.save();

	console.log(o.canvasElt, o.size, o.halfSize);

	o.setupEvents();
	o.makePlayerShip("player");
	o.makeGalaxy();
	o.jump(0);

	o.hud.start();
}

g.setupScreen = function(){
	var o=this;
	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		x = w.innerWidth || e.clientWidth || g.clientWidth,
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;
	x -= 20;
	y -= 20;
	o.size = new Coords(x,y);
	o.halfSize = new Coords(x/2, y/2);
	
	o.canvasElt.style.width = x + "px";
	o.canvasElt.style.height = y + "px";
	o.canvasElt.width = x;
	o.canvasElt.height = y;
}
g.action = function(L){
	var o=this;
	console.log(L);
	switch(L){
		case "e":     o.player.isElementScanOn = !o.player.isElementScanOn; break;
		case "t":     o.player.isThermoScanOn = !o.player.isThermoScanOn; break;
		case "+": 	o.zoom(1); break;
		case "-": 	o.zoom(-1); break;
		case "j": 	o.jump(); break;
		case "r": 	o.hud.addMessage(o.player.repair()); break;
		case "o":  	o.isObjectInfoOn = !o.isObjectInfoOn; break;
		case "m": 	o.hud.addMessage(o.player.harvestPlanet()); break;
		case "n": 	o.hud.addMessage(o.player.toggleEngine()); break;
		case "x": 	o.makeAsteroids(10); break;
		case "p":
			if (o.intId) o.stop(); else o.start();
			break;
		case "enter":
		case "esc":
		case "h":
			if (o.intId) {
				o.stop();
				o.introElt.style.display = "block";
				o.hudElt.style.display = "none";
			} else {
				o.start(); 
				o.introElt.style.display = "none";              
				o.hudElt.style.display = "block";
			}
			break;
	}
	if (o.intId) {
		o.gebi("victory").style.display = "none";
		o.gebi("gameover").style.display = "none";
	}
}
g.setupEvents = function(){
	var o = this;
	/*o.toolsElt.addEventListener("click", function(e){
		console.log(e);
	});*/
	var endSplash = function(){
		o.isSplash = false;
		o.splashElt.style.display = "none";
		o.introElt.style.display = "block";
	}
	document.getElementById("enter").addEventListener("click", function(e){
		o.action("enter");
	});
	o.splashElt.addEventListener("click",function(e){
		endSplash();
	});
	document.addEventListener("keydown", function(e){
		e.pd = e.preventDefault;
		if (o.isSplash) {
			endSplash();
			return false;
		}
		switch(e.keyCode){
			case 37: // left
			case 65: // a
				o.player.propulsion( new Coords(-1, 0) );
				e.pd();
				break;
			case 38: // up
			case 87: // w
				o.player.propulsion( new Coords(0, -1) );
				e.pd();
				break;
			case 39: // right
			case 68: // d
				o.player.propulsion( new Coords(1, 0) );
				e.pd();
				break;
			case 40: // down
			case 83: // s
				o.player.propulsion( new Coords(0, 1) );
				e.pd();
				break;
			case 32: // space
			case 77: o.action("m"); break;
			case 78: o.action("n"); break;
			case 88: o.action("x"); break;
			case 82: o.action("r"); break;
			case 187: o.action("+"); break;
			case 189: o.action("-"); break;
			case 74: o.action("j"); break;
			case 69: o.action("e"); break;
			case 84: o.action("t"); break;
			case 72: o.action("h"); break;
			case 79: o.action("o"); break;
			case 80: o.action("p"); break;
			case 27: o.action("esc"); break;
			case 13: o.action("enter"); break;
			case 81: // q
				break;
			default:
				console.log(e.keyCode);
				console.log(g.player);
		}
		
	}, false);
	window.onresize = function(e){
		o.setupScreen();
	}
}

g.setup();
g.draw();

// For Testing
console.log(g);
galaxy = g.galaxy;
systems = g.galaxy.systems;