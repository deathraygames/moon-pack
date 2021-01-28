class Portal extends Thing {
	constructor(world, x, y) {
		super(world, x, y);
		let o = this;
		o.world = world;
		o.name = "Moon Gate";
		o.verb = "activate";
		o.mode = false;
		o.allPortals = [];
		o.tpRange = 10;
		o.tpDrop = o.tpRange * 1.5;
		o.redCallback = function(){};
		o.img = null;
		o.minZoom = 0.5;
		o.spriteSheet = new SpriteSheet("moongate_sheet", (s) => {
			o.img = s[0];
		});
		
	}
	connect(allPortals) {
		this.allPortals = allPortals;
	}
	keepAwayFromEdge() {
		let h = this.world.half;
		let d = this.tpDrop;
		let loc = this.loc;
		if (loc.y + d > h) { 			loc.y -= d; }
		else if (loc.y - d < -1 * h) { 	loc.y += d; }
		if (loc.x + d > h) { 			loc.x -= d; }
		else if (loc.x - d < -1 * h) { 	loc.x += d; }		
	}
	checkTeleport(who) {
		let d = this.loc.getDistance(who.loc);
		if (d < this.tpRange) {
			this.teleport(who);
		}
	}
	teleport(who, redCallback) {
		let o = this;
		if (o.mode == "blue") {
			let out;
			o.allPortals.forEach((p) => {
				if (p.mode == "blue" && p !== o) {
					out = p;
				}
			});
			if (!out) {
				out = o.allPortals[randInt(o.allPortals.length - 1)];
			}
			if (out) {
				let outLoc = new Coords(out.loc);
				out.activate();
				if (who.facing == 0) { outLoc.y -= out.tpDrop; }
				else if (who.facing == 1) { outLoc.x += out.tpDrop; }
				else if (who.facing == 2) { outLoc.y += out.tpDrop; }
				else if (who.facing == 3) { outLoc.x -= out.tpDrop; }
				who.loc.set(outLoc.x, outLoc.y);
			}
		} else if (o.mode == "red") {
			o.redCallback();
		}
	}
	activate() {
		let o = this;
		o.img = o.spriteSheet.sprites[1];
		o.mode = "blue";
		let b = 0;
		o.allPortals.forEach((p) => { if (p.mode == "blue") { b++; } });
		console.log("Blues:", b);
		o.verb = "reset all";
	}
	deactivate() {
		let o = this;
		o.img = o.spriteSheet.sprites[0];
		o.mode = false;
		o.verb = "activate";
	}
	deactivateAll() {
		this.allPortals.forEach((p) => { p.deactivate(); });
	}
	toggle() {
		let o = this;
		if (!o.mode) {
			o.activate();
		} else {
			o.deactivateAll();
		}
	}
	activateRed() {
		this.img = this.spriteSheet.sprites[2];
		this.mode = "red";
	}
}