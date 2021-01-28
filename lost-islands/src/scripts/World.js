class World {
	constructor(sz) {
		let o = this;
		o.size = sz;
		o.half = o.size/2;
		o.light = 1;
		o.hue = [0,0,0];
		o.terrainTypes = {
			"W": [0,50,150], 
			"P": [30,180,20], 
			"F": [30, 120, 50],
			"M": [120,110,120],
			"D": [170,170,90],
			"C": [150,150,70]
		};
		o.terrainMarkers = [];
		o.npcs = [];
		o.terrain = [];
		o.shrines = [];
		o.portals = [];
		o.allThings = [];
	}
	buildTerrainMarkers() {
		let o = this;
		let i = o.size / 7;
		while (i-- > 0) {
			let xy = o.getRandomLoc(o.terrainMarkers, 4);
			o.terrainMarkers.push(new TerrainMarker(o, xy.x, xy.y));
		}
		o.terrainMarkers.push(new TerrainMarker(o, 0, 0, "P"));
	}
	buildNPCs() {
		let o = this;
		let jobTrades = [
			// helpers
			{	job: "farmer", trades: {"grain": "free"},
				gossip: [
					"The crops grow really well here.",
					"This island is our new home."
				]
			},
			{	job: "well-digger", trades: {"water": "free"},
				gossip: [
					"There are strange artifacts deep in the ground.",
					"If you have some water you needn't fear the deserts."
				]
			},
			{	job: "hunter", trades: {"hides": "free"},
				gossip: [
					"Hunting the elusive beasts of this land requires skill and patience.",
					"If only we could move the island..."
				]
			},
			{	job: "lumberjack", trades: {"wood": "free"},
				gossip: [
					"I keep cutting down trees, but the forest stays exactly the same!",
					"The wood from these trees is great for making boats."
				]
			},
			{	job: "bard", trades: {"song": "free"},
				gossip: [
					"Sadly I've forgotten my old songs.",
					"My next song will be about you, Stranger."
				]
			},
			// traders
			{	job: "shepherd", trades: {"wool": "grain"},
				gossip: [
					"Good luck out there!",
					"I can also be a doctor if need be."
				]
			},
			{	job: "torchbearer", trades: {"torch": "bread"},
				gossip: [
					"The night is dark and full of terror.",
					"I've seen monsters in the forest, but they always hide."
				]
			},
			{	job: "baker", trades: {"bread": "grain"},
				gossip: [
					"There isn't a lot to eat around here, but everyone enjoys my bread.",
					"I can't remember much about our old home."
				]
			},
			{	job: "messenger", trades: {"tent": "bread"},
				gossip: [
					"I wish I knew how to use the moon gates.",
					"I try to keep everyone informed and organized."
				]
			},
			// builders
			{	job: "knitter", trades: {"coat": "wool"},
				gossip: [
					"The mountains are cold; you shouldn't go unprepared.",
					"Most of us can't remember anything of our past."
				]
			}, 
			{	job: "torchmaker", trades: {"torch": "wood"},
				gossip: [
					"I used to be a candlestickmaker, but now we rely on torches.",
					"Only the mystics seem to understand the moon gates."
				]
			},
			{	job: "tentmaker", trades: {"tent": "hides"},
				gossip: [
					"I've heard rumors about a mystical stone that can only be used by a hero.",
					"We are all living in tents for now."
				]
			},
			{	job: "shipwright", trades: {"boat": "wood"},
				gossip: [
					"Having your own ship is essential.",
					"I've seen what looks like a shrine out in the sea."
				]
			},
			// special
			{
				job: "mystic", trades: {"moonstone": "enlightenment"}, 
				gossip: [
					"Blue moon gates are for traveling around the world.",
					"Legends say that red moon gates go to other dimensions.",
					"Only virtuous people can use moonstones.",
				]
			}
		];
		let i = 0;
		while (i < 40) {
			let xy = o.getRandomLoc();
			let jt = (i < jobTrades.length) ? jobTrades[i] : jobTrades[randInt(jobTrades.length) - 1];
			let imgName = (randInt(2) == 1) ? "npc" : "villager";
			if (jt.job == "mystic") { imgName = "mystic"; }
			o.npcs.push(new Character(o, xy.x, xy.y, imgName, jt.job, jt.trades, jt.gossip));
			i++;
		}
		o.allThings = o.allThings.concat(o.npcs);
	}
	buildShrines() {
		let o = this;
		let virtues = ["Honesty", "Compassion", "Valor", "Justice", "Honor", "Sacrifice", "Spirituality", "Humility"];
		let mantras = ["Ahm", "Mu", "Ra", "Beh", "Summ", "Cah", "Om", "Lum"];
		let i = 8;
		let minD = o.size / 10; 
		while (i-- > 0) {
			let xy = o.getRandomLoc(o.shrines, minD);
			o.shrines.push(new Shrine(o, xy.x, xy.y, virtues[i], mantras[i]));
		}
		o.allThings = o.allThings.concat(o.shrines);
	}
	buildPortals(redCallback) {
		let o = this;
		let i = 8;
		let minD = o.size / 2;
		while (i-- > 0) {
			let xy = o.getRandomLoc(o.portals, minD);
			let p = new Portal(o, xy.x, xy.y);
			p.keepAwayFromEdge();
			o.portals.push(p);
			o.terrainMarkers.push(new TerrainMarker(o, xy.x, xy.y, "P"));
		}
		o.allThings = o.allThings.concat(o.portals);
		o.portals.forEach((p) => { 
			p.connect(o.portals); 
			p.redCallback = redCallback;
		});
	}
	buildTerrain() {
		let ts = 2;
		let o = this;
		o.loopOverPixels((x, y, i) => {
			let k = o.getTerrainTypeAt(x, y);
			o.terrain.push(new TerrainPoint(o, x, y, k, ts));
		}, ts);
	}	
	getRandomLoc(notNear, minD, c) {
		let o = this;
		let loc = new Coords(randInt(o.size) - o.half, randInt(o.size) - o.half);
		if (typeof c === 'undefined') { c = 10000; }
		if (notNear && c > 0) {
			let tryAgain = false;
			notNear.forEach((w) => {
				let d = w.loc.getDistance(loc);
				if (d < minD) { tryAgain = true; /* console.log(w.name, d, minD, loc.x, loc.y, c); */ }
				//else { console.log(w.name, "OK", d, minD, loc.x, loc.y, c); }
			});
			if (tryAgain) {
				return o.getRandomLoc(notNear, --minD, --c);
			}
		}
		return loc;
	}
	getNearestThing(loc, near) {
		let o = this;
		let nearThing = null;
		near = near || Infinity;
		o.allThings.forEach((thing) => {
			let d = loc.getDistance(thing.loc);
			if (d <= near) {
				near = d;
				nearThing = thing;
			}
		});
		return nearThing;
	}
	loopOverPixels(fn, sz) {
		let h = this.half;
		let x = h * -1;
		let i = 0;
		while (x <= h) {
			let y = h * -1;
			while (y <= h) {
				fn(x, y, i);
				i++;
				y += sz;
			}
			x += sz;
		}
	}
	loopOverTerrainInBounds(fn, bounds) {
		let o = this;
		let i = o.terrain.length - 1;
		while (i >= 0) {
			let t = o.terrain[i];
			if (t.x < bounds.max.x && t.x > bounds.min.x && t.y < bounds.max.y && t.y > bounds.min.y) {
				fn(t);
			}
			i--;
		};
	}
	getTerrainTypeAt(x, y) {
		let at = new Coords(x, y);
		let dMin = Infinity;
		let kMin = "Z";
		let k = "Z";
		this.terrainMarkers.forEach((t) => {
			let d = t.loc.getDistance(at);
			d *= t.power;
			let diff = Math.abs(d - dMin);
			if (d < dMin) {
				dMin = d;
				k = t.typeKey;
				kMin = k;
			}
			if (diff < 50 && kMin == "W" && t.typeKey != "W") {
				dMin = d;
				k = "C";
			}
		});
		return k;
	}
	keepInBounds(loc) {
		let h = this.half;
		loc.x = Math.min(Math.max(loc.x, h * -1), h);
		loc.y = Math.min(Math.max(loc.y, h * -1), h);
	}
	draw(c, s) { 
		let o = this;
		let bounds = s.getBoundaries();
		o.loopOverTerrainInBounds((t) => {
			t.draw(c,s);
		}, bounds);

		/*
		let box = s.getScreenXY(bounds.min.x, bounds.min.y);
		c.strokeStyle = '#ff0';
		c.strokeWidth = 10;
		c.lineWidth = 10;
		c.rect(box.x, box.y, (bounds.max.x - bounds.min.x) * s.zoom, (bounds.max.y - bounds.min.y) * s.zoom);

		let wLoc = s.getScreenXY(o.half * -1, o.half * -1);
		c.rect(wLoc.x, wLoc.y, o.size * s.zoom, o.size * s.zoom);
		c.stroke();
		*/
		/*
		this.terrainMarkers.forEach((t) => {
			t.draw(c, s);
		});
		*/

		//this.drawGrid(c, d);
	}
	/*
	drawGrid(c, s) {
		// Grid
		let i;
		c.strokeStyle = 'rgba(255,255,0,0.15)';
		c.beginPath();
		for (i = 0; i < this.half; i += 10) {
			let m = s.getScreenXY(i, 0);
			let l = s.getScreenXY(i, this.half);
			c.moveTo(m.x, m.y);
			c.lineTo(l.x, l.y);
		}
		for (i = 0; i < this.half; i += 10) {
			let m = s.getScreenXYOffset(0, i);
			let l = s.getScreenXYOffset(this.half, i);
			c.moveTo(m.x, m.y);
			c.lineTo(l.x, l.y);
		}
		c.lineWidth = 1;
		c.stroke();
	}
	*/
}

class TerrainPoint {
	constructor(w, x, y, k, sz) {
		let o = this;
		o.x = x;
		o.y = y;
		o.size = sz;
		o.loc = new Coords(x,y);
		o.typeKey = k;
		o.world = w;
		o.discovered = 0;
		o.visible = false;
		o.color	= w.terrainTypes[k].slice(0);
		o.color.forEach((c, i) => { 
			o.color[i] = Math.max(c - randInt(25), 0); 
		});
		o.hp = 1;
	}
	getColorStyle(light, hue) {
		let o = this;
		let c = o.color.slice(0);
		if (o.visible) {
			if (o.typeKey == "W") {
				light = light * (randInt(500) == 1) ? 1.1 : 1;
			}
		} else {
			let wa = ((c[0] + c[1] + c[2]) / 3) * 2; // weighted average
			c.forEach((co, i) => { c[i] = (co + wa) / 3; });
			light *= 0.9;
			if (o.typeKey == "W") {
				light *= 0.8;
			}
		}
		light *= o.hp;
		c.forEach((co, i) => { c[i] = Math.round(co * light + hue[i]); });
		return "rgba(" + c.join(",") + "," + o.discovered + ")"	
	}
	draw(c, s) {
		let o = this;
		if (o.discovered) {
			let xy = s.getScreenXY(o.loc);
			let sz = Math.ceil(o.size * s.zoom);
			c.fillStyle = o.getColorStyle(o.world.light, o.world.hue);
			c.fillRect(xy.x, xy.y, sz, sz);
		}
	}
}

class TerrainMarker extends Thing {
	constructor(w, x, y, k) {
		super(w, x, y);
		let r = rand();
		if (typeof k != "string") {
			let d = this.loc.getDistance(new Coords(0,0));
			if (r < (d/w.half)) k ="W";
			else {
				r = rand();
				if (r < 0.5) k = "P";
				else if (r < 0.8) k = "F";
				else if (r < 0.9) k = "M";
				else k = "D";
			}
		}
		this.typeKey = k;
		this.power = 15 + randInt(5);
	}
	draw(c, s) {
		let pos = s.getScreenXY(this.loc);
		let color = this.world.terrainTypes[this.typeKey];
		let r = color[0] + 40, g = color[1] + 40, b = color[2];
		c.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
		c.fillRect(pos.x, pos.y, 4 * s.zoom, 4 * s.zoom);
	}
}