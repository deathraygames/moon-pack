class Person {
	constructor(n) {
		this.n = n;
		this.name = Math.round(Math.random() * 1000000000000);
		this.happiness = 50;
		this.x = 0;
		this.y = 0;
		this.homeIndex = null; // reference to building
		this.workIndex = null;
		this.direction = (Math.random() < 0.5) ? 1 : -1;
		this.sprite = null;
		this.target = new RocketBoots.Coords(0, 0);
		this.busyCooldown = 1;
		this.speed = 80 + Math.round(Math.random() * 20);
	}
	hasHome() {
		return (this.homeIndex !== null);
	}
	hasWork() {
		return (this.workIndex !== null);
	}
	lookForNewHome(buildings, world) {
		let foundHomeIndex = null;
		// TODO: look for proximity to water and to work (if any)
		buildings.forEach((b, i) => {
			if (b.hasResidentVacancy()) {
				foundHomeIndex = i;
				return;
			}
		});
		if (foundHomeIndex !== null) {
			this.moveHome(world, foundHomeIndex);
		}
	}
	lookForNewWork(buildings, world) {
		// TODO: look for proximity to home or self
		let foundBuildingIndex = null;
		buildings.forEach((b, i) => {
			if (b.hasWorkerVacancy()) {
				foundBuildingIndex = i;
				return;
			}
		});
		if (foundBuildingIndex !== null) {
			this.moveWork(world, foundBuildingIndex);
		}
	}
	moveHome(world, buildingIndex) {
		const building = world.buildings[buildingIndex];
		const added = building.addResident(this);
		if (!added) { return false; }
		this.homeIndex = buildingIndex;
		//this.x = building.x;
		//this.y = building.getYCoordinate(world);
		this.targetHome(world.buildings);
	}
	moveWork(world, buildingIndex) {
		const building = world.buildings[buildingIndex];
		const added = building.addWorker(this);
		if (!added) { return false; }
		this.workIndex = buildingIndex;
		this.targetWork(world.buildings);
	}
	setHappiness(buildings, world) {
		const home = this.getHome(buildings);
		const waterProximity = (home ? home.getWaterProximity(world) : Infinity);
		this.happiness = (
			(this.hasHome() ? 50 : 0) +
			(this.hasWork() ? 20 : 0) +
			( 30 * (Math.max(500 - waterProximity, 0)/500) )
		);
	}
	getHome(buildings) {
		return buildings[this.homeIndex];
	}
	getWork(buildings) {
		return buildings[this.workIndex];
	}
	isInWater(world) {
		return (this.y >= world.getCurrentWaterLevel()) ? true : false;
	}
	removeWork() {
		this.workIndex = null;
	}
	removeHome() {
		this.homeIndex = null;
	}
	move(delta, world) {
		//this.x = this.target.x; // - this.y) / 2;
		//this.y = this.target.y; // - this.y) / 2;
		
		// if (this.isInWater(world)) { }
		// TODO: fix this
		const pos = new RocketBoots.Coords(this.x, this.y);
		const distanceAway = pos.getDistance(this.target);
		const unitVector = pos.getUnitVector(this.target).normalize(); // .multiply(-1);
		const speed = (this.isInWater(world)) ? this.speed / 2 : this.speed;
		const distance = Math.min(speed * (delta/1000), distanceAway);
		const deltaPos = unitVector.multiply(distance);
		const newPos = pos.add(deltaPos);
		const terrainY = world.getTerrainAtX(newPos.x);
		const waterY = world.getCurrentWaterLevel();
		if (newPos.y < terrainY) { // simulate gravity
			newPos.y = (newPos.y + terrainY) / 2;
		}
		// newPos.y = Math.max(newPos.y, terrainY);
		newPos.y = Math.min(waterY, newPos.y);
		if (newPos.y === waterY && terrainY < waterY) {
			newPos.y -= 4; // jump out of water
		}
		const maxY = world.getTerrainAtX(newPos.x);
		this.setPosition(newPos);
		// if (this.n == 1) {
		// 	console.log(pos.x, pos.y, 'to', this.target.x, this.target.y, 
		// 		'\n-->', unitVector, deltaPos, this.x, this.y);
		// }
	}
	setPosition(position) {
		this.direction = (position.x < this.x) ? -1 : 1;
		this.x = position.x;
		this.y = position.y;
		this.syncSprite();
	}
	syncSprite() {
		if (!this.sprite) { return false; }
		this.sprite.x = Math.round(this.x);
		this.sprite.y = Math.round(this.y);
		this.sprite.scale.x = this.direction * -1;
	}
	setTarget(position) {
		if (!position) {
			return;
		}
		const newTarget = new RocketBoots.Coords(position.x, position.y);
		this.target.set(newTarget);
	}
	findTarget(world) {
		if (this.busyCooldown > 0) {
			return;
		}
		const r = Math.random();
		if (r < 0.3) {
			this.targetHome(world.buildings);
		} else if (r < 0.6) {
			this.targetWork(world.buildings);
		} else {
			this.setTarget(world.getRandomTerrainPosition());
		}
		this.busyCooldown = 3 + (Math.random() * 10);
	}
	targetHome(buildings) {
		return this.setTarget(this.getHome(buildings));
	}
	targetWork(buildings) {
		return this.setTarget(this.getWork(buildings));
	}
	cooldown(delta) {
		this.busyCooldown -= delta/1000;
		this.busyCooldown = Math.max(this.busyCooldown, 0);
	}
}






class Building {
	constructor(typeKey, x, fullyBuilt) {
		this.index = null;
		this.x = x || 0;
		this.y = 0;
		this.on = Boolean(fullyBuilt);
		this.typeKey = typeKey; // Shack, Apartment, Coal Faction, Solar Factory
		this.flooded = false;
		this.boxes = 0;
		this.workers = [];
		this.residents = [];
		this.constructionBoxes = 0;
		this.constructionMaterial = 0;
		this.constructionRate = 20;
		this.constructed = (fullyBuilt) ? this.getConstructedMax() : 1;
		this.production = 0;
	}
	construct(delta) {
		if (this.isConstructed() || this.flooded) {
			this.constructed = this.getConstructedMax();
			return;
		}
		// Unpack boxes --> convert to material
		const boxMaterial = 100;
		if (this.boxes >= 1 && this.constructionMaterial <= 0) {
			this.constructionMaterial += boxMaterial;
			this.boxes -= 1;
		}
		const seconds = delta/1000;
		let constructionAmount = Math.min(this.constructionRate * seconds, this.constructionMaterial);
		this.constructed += constructionAmount;
		this.constructionMaterial -= constructionAmount;
		if (this.isConstructed()) {
			this.on = true;
		}
	}
	needsConstructionBoxes() {
		let cBoxesNeeded = (this.getConstructedMax() - this.constructed) / 100;
		const cBoxesHave = this.boxes + (this.constructionMaterial / 100);
		cBoxesNeeded -= cBoxesHave;
		return Math.ceil(Math.max(cBoxesNeeded, 0));
	}
	isConstructed() {
		return (this.constructed >= this.getConstructedMax());
	}
	getConstructionFraction() {
		return this.constructed / this.getConstructedMax();
	}
	getConstructedMax() {
		return this.getType().boxPrice * 100;
	}
	addConstructionBox(n) {
		n = (n === undefined ? 1 : n);
		if (this.boxes > this.getType().maxBoxes - 1) {
			n = 0;
		}
		this.boxes += n;
		return n;
	}

	produce(delta) {
		const type = this.getType();
		const workerMultiplier = this.getWorkerContributionMultiplier();
		let prodRate = type.boxProductionRate * workerMultiplier;
		const isFull = (this.boxes >= type.maxBoxes);
		if (prodRate <= 0 || this.flooded || isFull || !this.isConstructed() || !this.on) {
			this.production = 0;
			return;
		}
		const productionAmount = prodRate * (delta/1000);
		this.production += productionAmount;
		this.production = Math.min(this.production, 100);
		if (this.production === 100) {
			this.boxes += 1;
			this.production = 0;
		}
	}

	getType() {
		return BUILDING_TYPES[this.typeKey];
	}
	getYCoordinate(world) {
		this.y = world.getTerrainAtX(this.x);
		return this.y;
	}
	getPollutionRate() {
		if (!this.on) { return 0; }
		const type = this.getType();
		const m = Math.max(this.getWorkerContributionMultiplier(), 0.2);
		const p = type.pollutionProductionRate * m;
		return p;
	}
	getWorkerContributionMultiplier() {
		const type = this.getType();
		return (type.workerCapacity) ? this.workers.length / type.workerCapacity : 0;
	}
	getWaterProximity(world) {
		const y = this.getYCoordinate(world);
		return world.getCurrentWaterLevel() - y;
	}
	checkFlooded(world) {
		const p = this.getWaterProximity(world);
		this.flooded = p < 0;
		if (this.flooded) {
			this.turnOff();
			this.evacuate();
		}
	}
	evacuate() {
		this.removeWorkers();
		this.removeResidents();
	}
	removeWorkers() {
		this.workers.forEach((worker) => {
			worker.removeWork();
		});
		this.workers.length = 0;
	}
	removeResidents() {
		this.residents.forEach((resident) => {
			resident.removeHome();
		});
		this.residents.length = 0;
	}
	toggleOn() {
		if (this.on || !this.isConstructed() || this.flooded) {
			this.turnOff();
		} else {
			this.turnOn();
		}
	}
	turnOff() {
		this.on = false;
		this.evacuate();
	}
	turnOn() {
		this.on = true;
	}
	getWidth() {
		return this.getType().width;
	}
	getHeight() {
		return this.getType().height;
	}
	addResident(person) {
		if (this.hasResidentVacancy()) {
			this.residents.push(person);
			return true;
		}
		return false;
	}
	addWorker(person) {
		if (this.hasWorkerVacancy()) {
			this.workers.push(person);
			return true;
		}
		return false;
	}
	hasResidentVacancy() {
		if (!this.on || this.flooded || !this.isConstructed()) {
			return false;
		}
		return (this.residents.length < this.getType().residentCapacity);
	}
	hasWorkerVacancy() {
		if (!this.on || this.flooded || !this.isConstructed()) {
			return false;
		}
		return (this.workers.length < this.getType().workerCapacity);
	}
	getStats() {
		const type = this.getType();
		const t = [type.name];
		if (this.flooded) {
			t.push('Flooded');
		}
		if (this.workers.length) {
			t.push(this.workers.length + ' workers');
		}
		if (this.residents.length) {
			t.push(this.residents.length + ' residents');
		}
		if (type.boxProductionRate || this.boxes) {
			t.push('Boxes: ' + this.boxes + ' /' + type.maxBoxes);
			t.push('Production: ' + Math.round(this.production));
		}
		if (!this.isConstructed()) {
			t.push(Math.round(this.constructionMaterial) + ' building widgets');
			t.push(Math.floor(this.getConstructionFraction() * 100) + '% built');
		}
		if (type.pollutionProductionRate && this.on) {
			t.push('Pollution: +' + this.getPollutionRate());
		}
		if (!this.on) {
			t.push('Off');
		}
		return t.join('\n');
	}
}




class World {
	constructor() {
		// Constants
		this.terrainSteps = 140;
		this.terrainStepLength = 20; // pixels
		this.length = this.terrainSteps * this.terrainStepLength; // pixels in the x-axis
		this.heightMultiplier = 500;
		this.seaLevel = 0;
		this.landDepthLevel = this.seaLevel + 500;
		// this.minY = -4000;
		// this.maxY = 4000;
		this.naturalCleaningRate = -3;
		
		// Variables
		this.pollutionRate = 0; // updated periodically
		this.pollution = 100;
		this.warming = 0;
		this.meltingRate = 0;
		this.meltedWater = 0;
		this.waterLevel = 0; // y coordinates
		this.waterRiseThreshold = this.resetWaterRiseThreshold();
		this.stormCooldown = 100;
		
		// Lists of things
		this.buildings = [];
		this.people = [];
		this.terrain = []; // y coordinate every ? pixels
		this.smoke = [];
	}
	generateTerrain() {
		this.terrain.length = 0;
		for (let i = 0; i < this.terrainSteps; i++) {
			const y = this.seaLevel + this.getRandomTerrainHeight(this.heightMultiplier);
			this.terrain.push(y);
		}
		for (let i = 0; i < this.terrainSteps; i += 10) {
			this.terrain[i] += this.getRandomTerrainHeight(this.heightMultiplier) * 2;
			
		}
		const baseMountainSize = 1000;
		const baseMountainRange = 20;
		// Raise middle mountain
		const middleStep = this.terrainSteps / 2;
		this.raiseTerrainAtIndex(middleStep, (baseMountainSize * 1.2), baseMountainRange);

		// Raise a few random mountains
		;[1, 0.8, 0.6, 0.3].forEach(() => {
			const mountainIndex = Math.floor(Math.random() * this.terrainSteps);
			this.raiseTerrainAtIndex(mountainIndex, baseMountainSize, baseMountainRange);
		});
		// Drop down edges
		this.terrain[0] = this.seaLevel;
		this.terrain[this.terrain.length - 1] = this.seaLevel;
		this.lowerTerrainAtIndex(0, 100, 10);
		// Blend it all together
		this.smoothTerrain(5);
	}
	checkTerrain() {
		let o = false;
		this.terrain.forEach((v) => {
			if (isNaN(v)) { o = true; }
		});
		console.log(this.terrain, o);
	}
	getRandomTerrainHeight(m) {
		return Math.round((Math.random() + Math.random() * m) - m);
	}
	smoothTerrain(range) {
		const lastIndex = this.terrain.length - 1;
		this.terrain.forEach((y, i) => {
			this.smoothTerrainAtIndex(i, range);
		});
	}
	smoothTerrainAtIndex(i, range) {
		const y = this.terrain[i];
		let left = 0;
		let right = 0;
		for (let r = 1; r <= range; r++) {
			left += this.getTerrainAtIndex(i - r);
			right += this.getTerrainAtIndex(i + r);
		}
		const numbersSmoothed = (1 + (range * 2));
		this.terrain[i] = Math.round(
			(y + left + right) / numbersSmoothed
		);
	}
	lowerTerrainAtIndex(i, amount, range) {
		this.raiseTerrainAtIndex(i, (-1 * amount), range);
	}
	raiseTerrainAtIndex(i, amount, range) {
		this.terrain[i] -= amount;
		this.smoothTerrainAtIndex(i - 1, 10);
		for (let r = 1; r <= range; r++) {
			const amountAtRange = Math.round(amount / (r + 1));
			// const leftIndex = this.getCycledTerrainIndex(i - r);
			// const rightIndex = this.getCycledTerrainIndex(i + r);
			const leftIndex = i - r;
			if (this.isTerrainIndexInBounds(leftIndex)) {
				this.terrain[leftIndex] -= amountAtRange;	
				this.smoothTerrainAtIndex(leftIndex, 1);
			}
			const rightIndex = i + r;
			if (this.isTerrainIndexInBounds(rightIndex)) {
				this.terrain[rightIndex] -= amountAtRange;
				this.smoothTerrainAtIndex(rightIndex, 1);
			}
		}
		this.smoothTerrainAtIndex(i + 1, 10);
	}
	// getCycledTerrainIndex(i) {
	// 	if (i < 0) {
	// 		i = this.terrain.length + i; 
	// 	} else if (i >= this.terrain.length) {
	// 		i = i - this.terrain.length;
	// 	}
	// 	return i;
	// }
	getTerrainAtIndex(i) {
		// return this.terrain[this.getCycledTerrainIndex(i)];
		if (!this.isTerrainIndexInBounds(i)) {
			return 0;
		}
		return this.terrain[i];
	}
	isTerrainIndexInBounds(i) {
		return (i >= 0 && i < this.terrain.length);
	}
	getTerrainAtX(x) {
		const fractionalStep = x / this.terrainStepLength;
		const leftStep = Math.floor(fractionalStep);
		const rightStep = Math.ceil(fractionalStep);
		const leftY = this.getTerrainAtIndex(leftStep);
		const rightY = this.getTerrainAtIndex(rightStep);
		if (fractionalStep === leftStep) {
			return leftY;
		} else if (fractionalStep === rightStep) {
			return rightY;
		}
		const rightX = rightStep * this.terrainStepLength;
		const leftX = leftStep * this.terrainStepLength;
		const slope = (rightY - leftY) / (rightX - leftX);
		const y = (slope * (x - leftX)) + leftY;
		return y;
	}
	loopOverTerrain(callback) {
		this.terrain.forEach((y, i) => {
			const x = i * this.terrainStepLength;
			callback(x, y, i);
		});
	}
	getRandomX() {
		return Math.floor(Math.random() * this.length);
	}
	getRandomTerrainPosition() {
		const x = this.getRandomX();
		const topY = this.getTerrainAtX(x);
		const waterY = this.getCurrentWaterLevel();
		if (waterY < topY) {
			return {x: x, y: waterY};
		}
		return {x: x, y: topY};
	}


	addBuilding(building) {
		this.buildings.push(building);
		building.index = this.buildings.length - 1;
	}
	generateBuildings(type, housesLeft) {
		// this.buildings.length = 0;
		let desiredWaterProximity = 10;
		let n = 0;
		while (housesLeft) {
			const house = new Building(type, this.getRandomX(), true);
			const tooCloseToNeighbor = this.isBuildingTooCloseToNeighbors(house);
			const tooFarFromWater = (house.getWaterProximity(this) > desiredWaterProximity);
			if (tooFarFromWater || tooCloseToNeighbor) {
				n++;
				desiredWaterProximity += 1;
			} else {
				this.addBuilding(house);
				housesLeft--;				
			}
		}
		console.log("generate buildings", type, " - # of tries:", n);
	}
	isBuildingTooCloseToNeighbors(newBuilding) {
		let tooCloseToNeighbor = false;
		this.buildings.forEach((building) => {
			const space = 1 + ((newBuilding.getWidth() + building.getWidth()) / 2);
			if (Math.abs(building.x - newBuilding.x) < space) {
				tooCloseToNeighbor = true;
			}
		});
		return tooCloseToNeighbor;
	}

	// People

	addPerson(person) {
		this.people.push(person);
	}
	generatePeople() {
		let p = 0;
		this.buildings.forEach((building, i) => {
			let n = 0;
			while ((building.residents.length < building.getType().residentCapacity) && n++ < 1000) {
				const person = new Person(p++);
				person.moveHome(this, i);
				person.lookForNewWork(this.buildings, this);
				this.addPerson(person);
				const y = this.getTerrainAtX(building.x);
				const homePos = {x: building.x, y: y};
				person.setPosition(homePos);
				person.targetHome(homePos);
			}
		});
	}


	// Simulation, Calculations

	calculatePollutionRate() {
		let rate = this.naturalCleaningRate;
		this.buildings.forEach((building) => {
			rate += building.getPollutionRate();
		});
		return rate;
	}
	setPollutionRate() {
		this.pollutionRate = this.calculatePollutionRate();
	}
	getPolygonCoordinates() {
		let arr = [0, this.seaLevel];
		// TODO: add edges somehow
		this.loopOverTerrain((x, y, i) => {
			arr.push(x);
			arr.push(y);
		});
		arr = arr.concat([this.length, this.seaLevel, this.length/2, this.landDepthLevel]);
		return arr;
	}
	getCurrentWaterLevel() {
		return this.seaLevel - this.waterLevel;
	}
	progress(elapsedTime) {
		const seconds = (elapsedTime / 1000);
		this.setPollutionRate();
		this.pollution += this.pollutionRate * seconds;
		this.pollution = Math.max(0, this.pollution);
		this.warming = this.pollution;
		this.meltingRate = this.warming;
		this.meltedWater += this.meltingRate * seconds;

		if (this.meltedWater >= this.waterRiseThreshold) {
			this.waterLevel += 2;
			this.meltedWater = 0;
			this.resetWaterRiseThreshold();
		}
		this.buildings.forEach((building) => {
			building.checkFlooded(this);
			building.construct(elapsedTime);
			let boxesNeeded = building.needsConstructionBoxes();
			if (boxesNeeded) {
				this.buildings.forEach((b) => {
					if (boxesNeeded > 0 && b.boxes > 0) {
						// Swap boxes
						const boxesTaken = building.addConstructionBox(1);
						b.boxes -= boxesTaken;
						boxesNeeded -= boxesTaken;
						if (boxesTaken > 0) {
							console.log("Trading", boxesTaken, "boxes from", b, "to", building);
						}
					}
				});
			}
			building.produce(elapsedTime);
		});
		this.people.forEach((p) => {
			p.cooldown(elapsedTime);
			if (!p.hasHome()) {
				p.lookForNewHome(this.buildings, this);
			}
			if (!p.hasWork()) {
				p.lookForNewWork(this.buildings, this);
			}
			p.setHappiness(this.buildings, this);
			p.findTarget(this);
			p.move(elapsedTime, this);
		});
		// console.log("pr", this.pollutionRate, "p", this.pollution, "w", this.warming,
		// 	"mr", this.meltingRate,
		// 	"mw", this.meltedWater, "wrt", this.waterRiseThreshold
		// );
	}
	resetWaterRiseThreshold() {
		this.waterRiseThreshold = 400 + (20 * this.waterLevel);
		return this.waterRiseThreshold;
	}
	getTimeUntilWaterRise() {
		const waterLeft = this.waterRiseThreshold - this.meltedWater;
		const secondsLeft = Math.floor(waterLeft / this.meltingRate);
		return secondsLeft;
	}

	getTotalBoxes() {
		let totalBoxes = 0;
		this.buildings.forEach((b) => {
			totalBoxes += b.boxes;
		});
		return totalBoxes;
	}
	getMaxBoxes() {
		let totalMaxBoxes = 0;
		this.buildings.forEach((b) => {
			if (!b.flooded && b.on) {
				totalMaxBoxes += b.getType().maxBoxes;
			}
		});
		return totalMaxBoxes;
	}
	getTotalHappiness() {
		let hap = 0;
		this.people.forEach((p) => {
			hap += p.happiness;
		});
		return hap / this.people.length;
	}
	getHousingPercentage() {
		let housed = 0;
		this.people.forEach((p) => {
			if (p.homeIndex !== null)  {
				housed++;
			}
		});
		return (housed / this.people.length) * 100;
	}
	getEmploymentPercentage() {
		let employed = 0;
		this.people.forEach((p) => {
			if (p.workIndex !== null)  {
				employed++;
			}
		});
		return (employed / this.people.length) * 100;
	}

}