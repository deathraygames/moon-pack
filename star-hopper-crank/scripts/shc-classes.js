(function(){

const PIXELS_PER_GRID_UNIT = 32;

class Location {
	constructor(options) {
		let dice = new RocketBoots.Dice();
		options = options || {};
		this.name = "System " + RocketBoots.getUniqueId();
		this.originalDistance = (20 + dice.roll1d(100) + dice.roll1d(100));
		this.distance = this.originalDistance; 
		this.solarPower = 1;
		this.asteroid = null;
		if (typeof options.type === "string") {
			this.type = options.type;
		} else {
			this.type = dice.pick(["giant sun", "asteroid belt", "dwarf sun"]);
		}
		switch (this.type) {
			case "giant sun":
				this.solarPower = 2;
				break;
			case "asteroid belt":
				this.asteroid = new Asteroid();	
				break;
			case "dwarf sun":
				this.solarPower = 0.75;
				break;
		}
	}
	hasAsteroid() {
		return (this.asteroid instanceof Asteroid) ? true : false;
	}
	getAsteroids() {
		return (this.hasAsteroid()) ? this.asteroid.mass : 0;
	}
	getNameWithType() {
		return this.name + ' (' + this.type + ')';
	}
	travelTo(d) {
		this.distance -= d;
		this.distance = Math.max(this.distance, 0);
	}
	isThere() {
		return (this.distance <= 0);
	}
	mineAsteroid(ore) {
		if (ore > 0 && this.hasAsteroid()) {
			return this.asteroid.mine(ore);
		} else {
			return 0;
		}
	}
}

class Starship {
	constructor(options) {
		let ss = this;
		this.world = options.world;
		this.pixelsPerGridUnit = PIXELS_PER_GRID_UNIT;
		this.targetLocation = null;
		this.location = new Location({type: "asteroid belt"});
		this.foundLocations = [];
		this.scanProgress = 0;
		// Rates
		this.scanRate = 0;
		this.energyRate = 0;
		this.speedRate = 0;
		this.oreRate = 0;
		
		this.parts = [];
		
		this.entity = new RocketBoots.Entity({
			size: {x: 100, y: 100},
			world: options.world,
			draw: {
				custom: function(ctx, entStageCoords, entStageCoordsOffset, layer, ent, entStageSize) { 
					return ss.draw(ctx, entStageCoords, entStageCoordsOffset, layer, ent, entStageSize); 
				}
			}
		});
		this.entity.name = "Ship-" + this.entity.name;
		this.world.putIn(this.entity, ["ships"]);

		// Add new core part
		this.core = new Part({
			partTypeKey: "core",
			starship: this,
			gridPos: {x: 0, y: 0},
			world: options.world
		});
		this.parts.push(this.core);
	}
	hasTargetLocation() {
		return (this.targetLocation instanceof Location);
	}
	getEnergy() {
		let e = 0;
		let max = 0;
		_.each(this.parts, function(part){
			e += part.energy;
			max += part.type.energyMax;
		});
		return Math.max(Math.min(e, max), 0);
	}
	getEnergyMax() {
		let max = 0;
		_.each(this.parts, function(part){
			max += part.type.energyMax;
		});
		return Math.max(max, 0);		
	}
	getStorageUsed() {
		let ore = 0;
		let max = 0;
		_.each(this.parts, function(part){
			ore += part.ore;
			max += part.type.storageMax;
		});
		return Math.max(Math.min(ore, max), 0);
	}
	getStorageLeft() {
		let left = 0;
		_.each(this.parts, function(part){
			left += part.getAvailableStorage();
		});
		return left;
	}
	getOre() {
		return this.getStorageUsed();
	}
	getStorageMax() {
		let max = 0;
		_.each(this.parts, function(part){
			max += part.type.storageMax;
		});
		return Math.max(max, 0);
	}
	getDistanceToTarget() {
		if (this.targetLocation instanceof Location) {
			return this.targetLocation.distance;
		}
		return null;
	}
	getOriginalDistanceToTarget() {
		if (this.targetLocation instanceof Location) {
			return this.targetLocation.originalDistance;
		}
		return null;
	}
	getScanProgress() {
		return Math.min(this.scanProgress, 100);
	}
	crankCore() {
		this.core.addEnergy(1);
	}
	getNearestPartsByPart(ogPart) {
		let ship = this;
		let nearestDistance = Infinity;
		let nearestParts = [];
		_.each(this.parts, function(part){
			let d = part.gridPos.getDistance(ogPart.gridPos);
			if (d < nearestDistance && d > 0) {
				nearestDistance = d;
			}
		});
		_.each(this.parts, function(part){
			let d = part.gridPos.getDistance(ogPart.gridPos);
			if (d == nearestDistance) {
				nearestParts.push(part);
			}
		});
		return nearestParts;		
	}
	getPartPos(part) {
		let halfPPGU = (this.pixelsPerGridUnit/2);
		let pos = this.entity.pos.clone();
		let gridOffset = part.gridPos.clone().multiply(this.pixelsPerGridUnit);
		pos.add(gridOffset);
		//pos.add({x: halfPPGU, y: halfPPGU});
		return pos;
	}
	getNearestPart(pos) {
		let ship = this;
		let nearestDistance = Infinity;
		let nearest = null;
		_.each(this.parts, function(part){
			let d = ship.getPartPos(part).getDistance(pos);
			if (d < nearestDistance) {
				nearestDistance = d;
				nearest = part;
			}
		});
		return nearest;
	}
	getNearestPositionOnGrid(pos) {
		let nearestPart = this.getNearestPart(pos);
		return this.getPartPos(nearestPart);
	}
	getNearestEmptyPositionOnGrid(pos) {
		let nearestPos = this.getNearestPositionOnGrid(pos);
		let distX = pos.x - nearestPos.x;
		let distY = pos.y - nearestPos.y;
		let delta = {x: 0, y: 0};
		if (Math.abs(distX) > Math.abs(distY)) {
			delta.x = ((distX < 0) ? -1 : 1) * this.pixelsPerGridUnit;
		} else {
			delta.y = ((distY < 0) ? -1 : 1) * this.pixelsPerGridUnit;
		}
		return nearestPos.add(delta);
	}
	getNearestEmptyGridPosition(pos) {
		let nearestPart = this.getNearestPart(pos);
		let nearestPos = this.getNearestPositionOnGrid(pos);
		let distX = pos.x - nearestPos.x;
		let distY = pos.y - nearestPos.y;
		let delta = {x: 0, y: 0};
		if (Math.abs(distX) > Math.abs(distY)) {
			delta.x = ((distX < 0) ? -1 : 1);
		} else {
			delta.y = ((distY < 0) ? -1 : 1);
		}
		return nearestPart.gridPos.clone().add(delta);
	}
	addPart(partTypeKey, pos, rotationIndex){
		let part = new Part({
			partTypeKey: partTypeKey,
			starship: this,
			gridPos: pos,
			world: this.world,
			rotationIndex: rotationIndex
		});
		this.parts.push(part);
	}
	removePart(part) {
		let i = this.parts.indexOf(part);
		return this.parts.splice(i, 1);
	}
	draw(ctx, entStageCoords, entStageCoordsOffset, layer, ent, entStageSize) {
		let ppgu = this.pixelsPerGridUnit;
		let halfPPGU = (this.pixelsPerGridUnit/2);
		/*
		ctx.fillStyle = "rgba(160, 160, 160, 0.5)";
		ctx.fillRect(entStageCoordsOffset.x, entStageCoordsOffset.y, 
						entStageSize.x, entStageSize.y);
		*/
		_.each(this.parts, function(part){
			let image = part.getImage();
			let offset = {x: -1 * halfPPGU, y: halfPPGU};
			// TODO: Fix this?
			if (part.gridPos.x === 0 && part.gridPos.y === 0) {
				//offset.y *= -1;
			}
			let realSize = {
				x: part.type.gridSize.x * ppgu,
				y: part.type.gridSize.y * ppgu
			};
			ctx.drawImage( 
				image,
				entStageCoords.x + (part.gridPos.x * ppgu) + (offset.x), 
				entStageCoords.y - (part.gridPos.y * ppgu) - (offset.y),
				realSize.x, 
				realSize.y
			);
		});
	}
	switchByProperty(prop, on) {
		_.each(this.parts, function(part){
			if (part.type[prop] > 0) {
				part.switch(on);
			}
		});
		return on;	
	}
	countByProperty(prop) {
		let c = 0;
		_.each(this.parts, function(part){
			if (part.type[prop] > 0) { c++;	}
		});
		return c;
	}
	countOnByProperty(prop) {
		let c = 0;
		_.each(this.parts, function(part){
			if (part.type[prop] > 0 && part.isOn) {	c++; }
		});
		return c;
	}
	getMiners() {		return this.countByProperty("oreGain"); }
	getScanners() {		return this.countByProperty("scanPower"); }
	getEngines() {		return this.countByProperty("speed"); }
	getMinersOn() {		return this.countOnByProperty("oreGain");	}
	getScannersOn() {	return this.countOnByProperty("scanPower");	}
	getEnginesOn() {	return this.countOnByProperty("speed");	}
	switchMiners(on) {
		return this.switchByProperty("oreGain", on);
	}
	switchScanners(on) {
		return this.switchByProperty("scanPower", on);
	}
	switchEngines(on) {
		return this.switchByProperty("speed", on);
	}
	switchCore(on) {
		return this.core.switch(on);
	}
	toggleMiners() {
		let switchTo = (this.getMinersOn() > 0) ? false : true;
		return this.switchMiners(switchTo);
	}
	toggleScanners() {
		let switchTo = (this.getScannersOn() > 0) ? false : true;
		return this.switchScanners(switchTo);
	}
	toggleEngines() {
		let switchTo = (this.getEnginesOn() > 0) ? false : true;
		return this.switchEngines(switchTo);
	}
	toggleCore() {
		let switchTo = this.core.isOn ? false : true;
		return this.switchCore(switchTo);
	}
	getAllOreContainers() {
		let oreContainers = [];
		_.each(this.parts, function(part){
			if (part.type.storageMax > 0) {
				let availPercent = part.getAvailableStorage() / part.type.storageMax;
				if (availPercent < 0.5) {
					oreContainers.unshift(part);
				} else {
					oreContainers.push(part);
				}
			}
		});
		return oreContainers;
	}
	getOreContainers() { // only those with available space
		let oreContainers = [];
		_.each(this.parts, function(part){
			if (part.type.storageMax > 0) {
				let availPercent = part.getAvailableStorage() / part.type.storageMax;
				if (availPercent > 0.5) {
					oreContainers.unshift(part);
				} else if (availPercent > 0) {
					oreContainers.push(part);
				}
			}
		});
		return oreContainers;
	}
	gainOre(ore) {
		let oreContainers = this.getOreContainers();
		let amountEach = Math.min(1, ore);
		if (ore <= 0) { return 0; }
		_.each(oreContainers, function(part){
			let oreToAdd = Math.min(amountEach, ore);
			let oreAdded = part.addOre(oreToAdd);
			ore -= oreAdded;
		});
		if (oreContainers.length > 0 && ore > 0) {
			return this.gainOre(ore);
		} else {
			return 0;
		}
	}
	removeOre(ore) {
		let oreContainers = this.getAllOreContainers();
		let amountEach = Math.ceil(ore / oreContainers.length);
		let totalOreRemoved = 0;
		if (ore <= 0) { return 0; }
		_.each(oreContainers, function(part){
			let oreRemoved = part.removeOre(amountEach);
			totalOreRemoved += oreRemoved;
			ore -= oreRemoved;
		});
		if (oreContainers.length > 0 && ore > 0 && totalOreRemoved > 0) {
			return this.removeOre(ore);
		} else {
			return ore;
		}
	}
	isScanDone() {
		const MAX_PROGRESS = 100;
		return (this.scanProgress === MAX_PROGRESS) ? true : false;
	}
	findLocation(location) {
		if (location instanceof Location) {
			this.foundLocations.push(location);
		}
	}
	resetScan() {
		this.scanProgress = 0;
	}
	resetFoundLocations() {
		this.foundLocations.splice(0, this.foundLocations.length);
	}
	scan(t) {
		const MAX_PROGRESS = 100;
		this.scanProgress += (this.scanRate * t);
		this.scanProgress = Math.min(this.scanProgress, MAX_PROGRESS);
		if (this.scanProgress === MAX_PROGRESS) {
			//this.switchScanners(false);
		}
	}
	travel(t) {
		if (this.targetLocation instanceof Location) {
			return this.targetLocation.travelTo(this.speedRate * t);
		} else {
			// just flying for no reason
			return null
		}
	}
	mine(t) {
		let ore = (this.oreRate * t);
		if (this.location instanceof Location) {
			let asteroidOre = this.location.mineAsteroid(ore);
			if (asteroidOre === 0) {
				// Need to always allow some amount of ore to be gained
				// or it is easy to get stuck
				let stardustAmount = (ore / 7);
				this.gainOre(stardustAmount);
			} else {
				this.gainOre(asteroidOre);
			}
		} else {
			return null;
		}
	}
	simulate(t) {
		const MINE_STARDUST_MULTIPLIER = 0.2;
		let ship = this;
		let energy = 0; 
		let hasAsteroid = false;
		ship.energyRate = 0;
		ship.speedRate = 0;
		ship.scanRate = 0;
		ship.oreRate = 0;
		if (this.location !== null) {
			if (this.location.hasAsteroid()) {
				hasAsteroid = true;
			}
		}
		// Find nearest parts and zero out rates
		_.each(this.parts, function(part){
			part.nearParts = ship.getNearestPartsByPart(part);
		});
		// Use up power and produce things
		_.each(this.parts, function(part){
			if (part.isRunning()) {
				let efficiency = 1;
				let energyNeeded = (t * part.type.energyUse)
				let energyUsed = part.removeEnergy(energyNeeded);
				ship.energyRate -= energyUsed / t;
				if (energyNeeded > 0 && energyUsed < energyNeeded) {
					efficiency = energyUsed/energyNeeded;
				}
				if (part.type.oreGain > 0) {
					ship.oreRate += (part.type.oreGain * efficiency);
					if (!hasAsteroid) {
						ship.oreRate = ship.oreRate * MINE_STARDUST_MULTIPLIER;
					}
				}
				if (part.type.scanPower > 0) {
					ship.scanRate += (part.type.scanPower * efficiency);
				}
				if (part.type.speed > 0) {
					ship.speedRate += (part.type.speed * efficiency);
				}
				part.lastEfficiency = efficiency;
			}
		});
		ship.scan(t);
		ship.travel(t);
		ship.mine(t);
		// Gain energy
		_.each(this.parts, function(part){
			if (part.isOn && part.type.energyGain > 0) {
				let energyGenerated = (part.type.energyGain * t);
				let energyMade = part.addEnergy(energyGenerated, true);
				ship.energyRate += energyMade / t;
			}
		});
		// Redistribute
		_.each(this.parts, function(part){			
			// TODO: tweak the redistribution
			if (part.isOn) {
				let energySpace = part.type.energyMax - part.energy;
				if (energySpace > 0) {
					_.each(part.nearParts, function(nearPart){
						let diff = nearPart.energy - part.energy;
						if (nearPart.isOn && diff > 0) {
							let e = (t * diff) / 10;
							e = Math.max(1, e);
							e = nearPart.removeEnergy(e);
							part.energy += e;
						}
					});
				}
			}
		});
		// Pull energy from nearby sources if needed
		_.each(this.parts, function(part){
			if (part.isOn) {
				if (part.type.energyUse > 0) {
					let energyNeeded = (t * part.type.energyUse) - part.energy;
					if (energyNeeded > 0) {
						let energyNeededPerPart = energyNeeded / part.nearParts.length;
						_.each(part.nearParts, function(nearPart){
							let e = (t * energyNeededPerPart);
							e = nearPart.removeEnergy(e);
							part.energy += e;
						});
					}
				}
			}
		});

		// Lose excess energy
		_.each(this.parts, function(part){
			let lostEnergy = part.loseExcessEnergy();
			ship.energyRate -= lostEnergy / t;
		});
	}

}

class Part {
	constructor(options) {
		let part = this;
		let rotations = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
		let rotationIndex = options.rotationIndex || 0;
		this.starship = options.starship;
		this.partTypeKey = options.partTypeKey;
		this.isCore = (this.partTypeKey === "core") ? true : false;
		this.type = data.partTypes[this.partTypeKey];
		if (this.type === undefined) {
			console.error("Unknown part type:", this.partTypeKey);
		}
		this.gridPos = new RocketBoots.Coords(options.gridPos.x, options.gridPos.y);
		this.energy = 0;
		this.ore = 0;
		this.isOn = (this.type.energyUse) ? false : true;
		this.rotation = rotations[rotationIndex];
		this.animationFrame = null;
		this.lastEfficiency = 0;
		if (this.type.animations) {
			this.animationFrame = 0;
		}
		/*
		this.entity = new RocketBoots.Entity({
			size: {x: options.starship.pixelsPerGridUnit, y: options.starship.pixelsPerGridUnit},
			world: options.world,
			draw: {
				custom: function(ctx, entStageCoords, entStageCoordsOffset, layer, ent, entStageSize) { 
					return part.draw(ctx, entStageCoords, entStageCoordsOffset, layer, ent, entStageSize); 
				}
			}
		});
		this.entity.name = "Part-" + this.entity.name;
		*/
	}
	getAvailableStorage() {
		return this.type.storageMax - this.ore;
	}
	addEnergy(e, allowOverflow) {
		if (!allowOverflow) {
			let possibleEnergy = this.type.energyMax - this.energy;
			e = Math.min(possibleEnergy, e);
		}
		this.energy += e;
		return e;
	}
	removeEnergy(e) {
		e = Math.min(e, this.energy);
		this.energy -= e;
		return e;
	}
	addOre(ore) {
		let possibleOre = this.getAvailableStorage();
		ore = Math.min(possibleOre, ore);
		this.ore += ore;
		return ore;
	}
	removeOre(ore) {
		ore = Math.min(this.ore, ore);
		this.ore -= ore;
		return ore;
	}
	isRunning() {
		return (this.isOn && (this.energy > 0 || this.isCore));
	}
	toggleSwitch() {
		if (this.isOn) { return this.switch(false); }
		else { return this.switch(true); }
	}
	switch(on) {
		this.isOn = (on) ? true : false;
		return this.isOn;
	}
	incrementAnimation() {
		this.animationFrame++;
		if (this.animationFrame > (this.type.animations - 1)) {
			this.animationFrame = 0;
		}
	}
	getImage() {
		let imageVariation = (this.isRunning()) ? "on" : "off";
		let arr = this.type.images[imageVariation];
		let image = arr[0];
		if (this.animationFrame !== null && imageVariation == "on") {
			image = arr[(this.animationFrame+1)];
		}
		return image;
	}
	loseExcessEnergy() {
		let lost = Math.max((this.energy - this.type.energyMax), 0);
		lost = this.removeEnergy(lost);
		return lost;
	}
}

class Asteroid {
	constructor(options) {
		let dice = new RocketBoots.Dice();
		this.mass = dice.roll1d(6) * 500; 
	}
	mine(amount) {
		amount = Math.min(amount, this.mass);
		this.mass -= amount;
		this.mass = Math.max(this.mass, 0);
		return amount;
	}
	isDestroyed() {
		return (this.mass <= 0);
	}
}


// Expose
window.Location = Location;
window.Starship = Starship;
window.Part = Part;
window.Asteroid = Asteroid;

})();