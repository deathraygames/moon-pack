RocketBoots.loadComponents([
	"coords",
	"entity",
	"sound_cannon",
	"image_overseer",
	"state_machine",
	"dice",
	"looper",
	"physics",
	"keyboard",
	"world",
	"stage",
	"image_overseer"
]).ready(function(rb){

	var TWO_PI = 2 * Math.PI;
	var WORLD_X = 640;
	var WORLD_Y = 100;
	var GROUND_Y = 12;
	var CRUST_Y = 20;

	var STARTING_POP = 80;

	var MELT_RATE = 1.4;
	var DECIDED_STRENGTH = 0.8;
	var VERY_FEARFUL = 0.7;
	var FEARFUL = 0.2;
	var CALM_RATE = -0.01;
	var MAX_SPEECH_RANGE = 30;
	
	var SPEECH_DECAY = -1;
	var SPEECH_MANA_RECOVERY = 20;
	var SPEECH_MANA_RECOVERY_ACTIVE = 2;
	var SPEECH_MANA_COST = -1;
	var SPEECH_COOLDOWN = 5;
	var PERSUATION_POWER = 0.5;
	var DISSUASION_POWER = -0.2;

	var BASE_BEAM_STRENGTH = 0.1;
	var DEADLY_BEAM_STRENGTH = 0.8;
	var FEARFUL_BEAM_STRENGTH = 0.12;
	var ADBUCT_RANGE = 10;
	var NOTICE_RANGE = 30;
	var UFO_NOTICE_RANGE = 45;
	var BEAM_RANGE = 70;
	var BEAM_COOLDOWN_RATE = -0.01;

	var WIN_VOTE_PERCENT = 50;

	window.g = new rb.Game({
		"name": "Reptilian President",
		instantiateComponents: [
			{"state": "StateMachine"},
			{}
		],
		"stages": [{
			"id": "game-stage",
			"size": {"x": WORLD_X, "y": WORLD_Y}
		}],
		"world": {
			"dimensions": 2,
			//"trackTime": true,
			"isBounded": true,
			"size": {"x": WORLD_X, "y": WORLD_Y}
		}
	});

	/*
	g.state.transition("preload");
	
	g.images = new rb.ImageBank();
	g.images.load({
		"dirt1" : "dirt1.png"
		,"dirt2" : "dirt2.png"
		,"grass1" : "grass1.png"
		,"grass2" : "grass2.png"
	});
	*/	
	
	//g.state.transition("mainmenu");
	

//==== States and Keys

	g.state.addStates({
		"walking": {
			viewName: "game",
			start: function(){
				g.keyboard.setup({
					wasd: true,
					keyDownActions: {
						"LEFT": moveLeft,
						"RIGHT": moveRight,
						"UP": 	moveUp,
						"DOWN": moveDown,
						"1": 	speech,
						"2": 	secondaryAction,
						"TAB": 	beamUp,
						"x": 	placeFlag,
						"z": 	speech,
						"SPACE": speech,
						"ESC": 	escMenu,
						"p": 	pause
					}
				});
				g.stage.camera.follow(g.character.pos).lockY(31);
				g.mainLoop.start();
				g.meltingLoop.start();
				g.speechLoop.start();
			},
			end: function(){
				g.keyboard.clear();
				g.stage.camera.stop();
				g.mainLoop.stop();
				g.meltingLoop.stop();
				g.speechLoop.stop();
			}			
		},
		"flying": {
			viewName: "game",
			start: function(){
				g.keyboard.setup({
					wasd: true,
					keyDownActions: {
						"LEFT": 	moveUFOLeft,
						"RIGHT": 	moveUFORight,
						"1": 		abduct,
						"2": 		beamDown,
						"TAB": 		beamDown,
						"x": 		abduct,
						"z": 		beamDown,
						"SPACE": 	abduct,
						"p": 		pause
					}
				});
				g.stage.camera.follow(g.ufo.pos).lockY(31);
				g.mainLoop.start();
				g.ufoPowerLoop.start();
			},
			end: function(){
				g.keyboard.clear();
				g.stage.camera.stop();
				g.mainLoop.stop();
				g.ufoPowerLoop.stop();
			}			
		},
		"beaming-up": {
			viewName: "game",
			start: function(){
				// g.keyboard.setup({
				// 	keyDownActions: {
				// 		"2": beamDown,
				// 		"TAB": beamDown,
				// 		"z": beamDown,
				// 		"ESC": escMenu
				// 	}
				// });
				g.stage.camera.follow(g.character.pos);
			},
			end: function(){
				// g.keyboard.clear();
				g.stage.camera.stop();
			}
		},
		"beaming-down": {
			viewName: "game",
			start: function(){
				// g.keyboard.setup({
				// 	keyDownActions: {
				// 		"2": beamUp,
				// 		"TAB": beamUp,
				// 		"z": beamUp,
				// 		"ESC": escMenu
				// 	}
				// });
				g.stage.camera.follow(g.character.pos);
			},
			end: function(){
				// g.keyboard.clear();
				g.stage.camera.stop();
			}
		},
		"win": {
			start: function(){
				g.notifiedOfWin = true;
				g.keyboard.setup({
					keyDownActions: { 
						"TAB": goBack
					},
					preventDefault: ["SPACE", "UP", "DOWN", "LEFT", "RIGHT"]
				});				
			},
			end: function(){
				g.keyboard.clear();
			}
		},
		"splash": {
			start: function(){
				g.keyboard.setup({
					keyDownActions: { "ANY": gotoGame }
				});
			},
			end: function(){
				g.keyboard.clear();
			}
		},
		"pause": {
			viewName: "game",
			start: function(){
				g.keyboard.setup({
					keyDownActions: { "ANY": goBack }
				});
			},
			end: function(){
				g.keyboard.clear();
			}
		}
	});

	g.notifiedOfWin = false;

	function gotoGame(){
		g.state.transition("walking");
	}
	function goBack () {
		g.state.back();
	}
	function pause() {
		g.state.transition("pause");
	}
	function moveLeft () {
		g.character.move({x: -1, y: 0});
	}
	function moveRight () {
		g.character.move({x: 1, y: 0});
	}
	function moveUp () {
		g.character.move({x: 0, y: 1});
	}
	function moveDown () {
		g.character.move({x: 0, y: -1});
	}
	function moveUFOLeft () {
		g.ufo.move({x: -2, y: 0});
	}
	function moveUFORight () {
		g.ufo.move({x: 2, y: 0});
	}
	function secondaryAction () {
		var isBeamed = beamUp();
		if (!isBeamed) {
			placeFlag();
		}
	}
	function speech () {
		if (g.character.speechMana > 0 && g.character.speechCooldown <= 0 && !g.character.isReptileForm) {
			g.character.action = "speaking";
			addSpeechBubble(1);
			addSpeechMana(SPEECH_MANA_COST);
		}
	}
	function addSpeechBubble (delta) {
		g.character.speechRadius += delta;
		g.character.speechRadius = Math.max(Math.min(g.character.speechRadius, MAX_SPEECH_RANGE), 0);
		if (g.character.speechRadius == MAX_SPEECH_RANGE) {
			g.character.speechCooldown = SPEECH_COOLDOWN;
		}
	}
	function addSpeechMana (delta) {
		g.character.speechMana += delta;
		g.character.speechMana = Math.max(Math.min(g.character.speechMana, g.character.maxSpeechMana), 0);
	}
	function beamUp () {
		if (g.character.pos.getDistance(g.ufo.pos) <= BEAM_RANGE) {
			g.character.isVisible = false;
			g.state.transition("beaming-up");
			g.ufo.beamStrength = 0.5;
			g.state.transition("flying");
			return true;
		} else {
			return false;
		}
	}
	function beamDown () {
		g.state.transition("beaming-down");
		g.ufo.beamStrength = 0.2;
		g.character.pos.x = g.ufo.pos.x;
		g.character.isVisible = true;
		g.state.transition("walking");

	}
	function placeFlag () {
		// *** Doesn't work yet
	}
	function escMenu () {

	}
	function addBeamStrength (n) {		
		g.ufo.beamStrength += n;
		g.ufo.beamStrength = Math.max(BASE_BEAM_STRENGTH, Math.min(1, g.ufo.beamStrength));
	}
	function abduct () {
		var beamPos = new rb.Coords(g.ufo.pos.x, GROUND_Y);
		var fleshHarvested = 0;

		addBeamStrength(0.05);
		
		g.ufo.target = g.world.getNearestEntity("citizens", beamPos, ADBUCT_RANGE);
		if (g.ufo.target && g.ufo.beamStrength >= DEADLY_BEAM_STRENGTH) {
			g.world.removeEntity(g.ufo.target);
			fleshHarvested = 40 + g.dice.roll1d(20);
			g.character.replenish(fleshHarvested);
			g.world.loopOverEntitiesWithinRange("citizens", beamPos, NOTICE_RANGE, function(i, ent){
				ent.panic(g.ufo);
			});
		}
	}



	
//==== The things in the world
	var SKIN_ARRAY = ["#663931", "#8F563B", "#D9A066"];
	var Person, Building, Vehicle;
	Person = function (options) {
		var ent = this;
		rb.Entity.call(this, options); // Use entity's constructor
		this.name = options.name;
		this.isAPerson = true;
		this.isCandidate = false;
		this.flying = false;
		this.fear = 0;
		this.partyPreference = g.dice.roll1d(2);
		this.partyPreferenceStrength = g.dice.random();
		this.action = "standing";
		this.target = null;
		this.facingBit = g.dice.flip(0, 1);
		this.walkingBit = 0;
		this.blinkBit = 0;
		this.wearingShirt = g.dice.selectRandom([false, true]);
		this.wearingTie = false;
		this.wearingHat = false;
		this.partyShirt = false;
		this.partyHat = false;
		this.color = g.dice.flip('#fff', '#eee'),
		this.skinColor = g.dice.selectRandom(SKIN_ARRAY);
		this.lipColor = g.dice.selectRandom(["#663931", "#8F563B", "#D9A066"]);
		this.eyeColor = g.dice.selectRandom(["#5B6EE1", "#222034", "#4B692F", "#524B24", "#323C39", "#3F3F74"]);
		this.shirtColor = g.dice.selectRandom(["#696A6A", "#8A6F30", "#524B24"]);
		this.tieColor = g.dice.selectRandom(["#696A6A", "#8A6F30", "#524B24", "#222034"]);
		this.hatColor = g.dice.selectRandom(["#696A6A", "#8A6F30", "#524B24"]);
		this.mouthSize = g.dice.selectRandom([3,3,3,3,2,2,1]);
		this.leftArmPos = g.dice.selectRandom([{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: -2}]);
		this.leftArmSize = g.dice.selectRandom([{x: 2, y: 1}, {x: 1, y: 2}]);
		this.rightArmPos = g.dice.selectRandom([{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: -2}]);
		this.rightArmSize = g.dice.selectRandom([{x: 2, y: 1}, {x: 1, y: 2}]);
		this.mouthType = "closed";
		this.bodySize = new rb.Coords(4, 7);
		ent.draw.custom = function(ctx, stageXY, stageXYOffset){
			var mainOffsetX = 3;
			var footY = stageXYOffset.y + ent.bodySize.y + 2;
			var shoulderY = stageXYOffset.y + 6;
			var armY = shoulderY + 1;
			// shadow
			ctx.fillStyle = "rgba(0,0,0, 0.25)";
			ctx.fillRect(stageXYOffset.x + mainOffsetX - 0.5, stageXYOffset.y + ent.size.y - 0.25, ent.bodySize.x + 1, 1.75);			
			// shoulders
			ctx.fillStyle = (ent.wearingShirt) ? ent.shirtColor : ent.skinColor;
			ctx.fillRect(stageXYOffset.x + 2, shoulderY, ent.bodySize.x + 2, 1);
			// body
			ctx.fillStyle = ent.skinColor;
			ctx.fillRect(stageXYOffset.x + mainOffsetX, stageXYOffset.y + 2, ent.bodySize.x, ent.bodySize.y);
			ctx.fillRect(stageXYOffset.x + mainOffsetX + 1, stageXYOffset.y + 1, (ent.bodySize.x / 2), 1);
			// shirt and tie
			if (ent.wearingShirt) {
				ctx.fillStyle = ent.shirtColor;
				ctx.fillRect(stageXYOffset.x + mainOffsetX, shoulderY, ent.bodySize.x, 2);
			}
			if (ent.wearingTie) {
				ctx.fillStyle = ent.tieColor;
				ctx.fillRect(stageXYOffset.x + mainOffsetX + 1 + ent.facingBit, shoulderY, 1, 2);	
			}
			// feet
			ctx.fillStyle = ent.skinColor;
			ctx.fillRect(stageXYOffset.x + mainOffsetX + ent.walkingBit, footY, 1, 1);
			ctx.fillRect(stageXYOffset.x + mainOffsetX - 1 + ent.bodySize.x - ent.walkingBit, footY, 1, 1);
			// arms
			// TODO: this isn't exact enough...
			ctx.fillStyle = ent.skinColor;
			ctx.fillRect(stageXYOffset.x + 1 + ent.leftArmPos.x, armY, ent.leftArmSize.x, ent.leftArmSize.y);
			ctx.fillRect(stageXYOffset.x + ent.bodySize.x + 4 - ent.leftArmPos.x, armY, ent.rightArmSize.x, ent.rightArmSize.y);
			// eyes
			if (ent.blinkBit == 0) {
				ctx.fillStyle = ent.eyeColor;
				ctx.fillRect(stageXYOffset.x + 3 + ent.facingBit, stageXYOffset.y + 3, 1, 1);
				ctx.fillRect(stageXYOffset.x + 5 + ent.facingBit, stageXYOffset.y + 3, 1, 1);
			}
			// mouth
			if (ent.mouthType == "open") {
				ctx.fillStyle = "#111111";
			} else if (ent.mouthType == "grin") {
				ctx.fillStyle = "#F3F3F1";
			} else {
				ctx.fillStyle = ent.lipColor;
			}
			ctx.fillRect(stageXYOffset.x + 3 + ent.facingBit, stageXYOffset.y + 5, ent.mouthSize, 1);
			//ctx.save();
			// hat
			if (ent.wearingHat) {
				ctx.fillStyle = ent.hatColor;
				ctx.fillRect(stageXYOffset.x + mainOffsetX, stageXYOffset.y + 1, ent.bodySize.x, 2);
				ctx.fillRect(stageXYOffset.x + mainOffsetX + 1, stageXYOffset.y, 2, 1);
				ctx.fillRect(stageXYOffset.x + mainOffsetX - 1 + ent.facingBit, stageXYOffset.y + 2, ent.bodySize.x + 1, 1);
			}
		}
	};
	Person.prototype = new rb.Entity({name: "Person", world: g.world, size: {x: 10, y: 10}});
	Person.prototype.constructor = Person;
	Person.prototype.move = function(delta) {
		var delta = new rb.Coords(delta.x, delta.y);
		if (this.fear > VERY_FEARFUL) {
			delta.multiply(3);
		} else if (this.fear > FEARFUL) {
			delta.multiply(2);
		}
		delta.check().round();
		//console.log("Moving ", this.name, d, " to target:", (this.target) ? this.target.pos : "none");
		this.pos.add(delta);
		if (!this.flying) { 
			this.stayOnGround(); 
			if (this.walkingBit == 0) { this.walkingBit = 1} else {this.walkingBit = 0};
			if (delta.x > 0) { 
				this.facingBit = 1; 
			} else if (delta.x < 0) { 

				this.facingBit = 0; 
				/*
				var temp;
				temp = this.leftArmPos;
				this.leftArmPos = this.rightArmPos;
				this.rightArmPos = temp;
				temp = this.leftArmSize;
				this.leftArmSize = this.rightArmSize;
				this.rightArmSize = temp;
				*/
			}
		}
		//console.log("Moving", this.name, delta, this.pos);
	};
	Person.prototype.moveToTarget = function () {
		if (this.target && this.target.pos instanceof rb.Coords) {
			var moveDelta = this.pos.getUnitVector(this.target.pos);
			this.move(moveDelta);
		}
	};
	Person.prototype.selectNewTarget = function (targetPos) {
		if (!targetPos) {
			targetPos = new rb.Coords(this.pos.x + g.dice.getRandomIntegerBetween(-60, 60), this.pos.y + g.dice.getRandomIntegerBetween(-5, 5));
		}
		var spot = {pos: targetPos};
		this.target = spot;
		return spot;
	};
	Person.prototype.panic = function (fearTarget) {
		var newPos = this.pos.clone().getUnitVector(fearTarget.pos).multiply(-100);
		this.fear = 1;
		this.partyPreferenceStrength = 0;
		this.selectNewTarget(newPos);
	}
	Person.prototype.stayOnGround = function () {
		var footPos = this.getFootPos();
		//console.log(footPos);
		if (footPos.y < 0) {
			this.pos.y -= footPos.y;
			//console.log('too low');
		} else if (footPos.y > GROUND_Y) {
			this.pos.y -= Math.abs(footPos.y - GROUND_Y);
			//console.log('too high');
		}
		g.world.keepCoordsInBounds(this.pos);
	};

	Reptilian = function (options) {
		options.size = {x: 10, y: 10};
		Person.call(this, options);
		this.isAReptile = true;
		this.isCandidate = true;
		this.isReptileForm = false;
		this.speechRadius = 0;
		this.speechCooldown = 0;
		this.speechMana = 100;
		this.maxSpeechMana = 100;
		this.color = "#33ff99";
		this.humanSuitDurability = 99;
	};
	Reptilian.prototype = new Person({name: "Reptilian", world: g.world});
	Reptilian.prototype.constructor = Reptilian;
	Reptilian.prototype.melt = function (n) {
		if (this.humanSuitDurability < 30) {
			n = n + g.dice.selectRandom([0,0,0,1,1,1,1,1,2,3,5,8]);
		}
		this.humanSuitDurability -= n;
		this.humanSuitDurability = Math.max(0, this.humanSuitDurability);
		if (this.humanSuitDurability == 0) {
			this.skinColor = "#37946E";
			this.wearingShirt = false;
			this.wearingTie = false;
			this.isReptileForm = true;
			this.mouthType = "open";
		}
	}
	Reptilian.prototype.replenish = function (n) {
		this.humanSuitDurability += n;
		this.humanSuitDurability = Math.min(this.humanSuitDurability, 100);		
		this.skinColor = g.dice.selectRandom(SKIN_ARRAY);
		this.wearingShirt = true;
		this.wearingTie = true;
		this.isReptileForm = false;
		this.mouthType = "grin";
	}

	Building = function (options) {
		options.size = {x: 20, y: g.dice.selectRandom([10,18,28,36])}; // {x: 20, y: 36};
		rb.Entity.call(this, options); // Use entity's constructor
		this.name = options.name;
		this.isABuilding = true;
		this.color = "#94A6B0"; // "#9BADB7";
		//console.log(this.pos.y, this.getFootPos().y, GROUND_Y);
		this.pos.y = GROUND_Y + this._halfSize.y;
	};
	Building.prototype = new rb.Entity({name: "Building", world: g.world});
	Building.prototype.constructor = Building;

	Vehicle = function (options) {
		var veh = this;
		rb.Entity.call(this, options); // Use entity's constructor
		this.name = options.name;
		this.isAVehicle = true;
		this.beamStrength = 0.7;
		this.maxBeamStrength = 10;
		this.maxBeamWidth = 40;
		this.draw.before = function (ctx, stageXY, stageXYOffset) {
			var y = stageXY.y + 50;
			var op = veh.beamStrength * 0.65;
			var xDelta = veh.maxBeamWidth - ((veh.maxBeamWidth - 2) * veh.beamStrength);
			ctx.fillStyle = "rgba(255,255,0," + op + ")";
			ctx.beginPath();
			ctx.moveTo(stageXY.x, stageXY.y);
			ctx.lineTo(stageXY.x - xDelta, y);
			ctx.lineTo(stageXY.x + xDelta, y);
			ctx.fill();
		};		
	};	
	Vehicle.prototype = new rb.Entity({name: "Vehicle", world: g.world});
	Vehicle.prototype.constructor = Vehicle;
	Vehicle.prototype.move = function(delta) {
		this.pos.add(delta);
		//console.log("Moving", this.name, delta, this.pos);
	};


//==== Make the World

	g.world.addEntityGroups(["background", "buildings", "vehicles", "people", "citizens", "candidates"]);
	g.world.min.y = 0;
	g.world.max.y = WORLD_Y;
	g.world.fearPercent = 1;
	g.world.citizenCensus = STARTING_POP;

	g.sky = new rb.Entity({
		name: "Sky",
		size: {x: WORLD_X, y: WORLD_Y},
		pos: {x: 0, y: (WORLD_Y/2)},
		color: "#CBDBFC"
	});
	g.world.putIn(g.sky,  ["background"]);

	g.crust = new rb.Entity({
		name: "Crust",
		size: {x: WORLD_X, y: CRUST_Y},
		pos: {x: 0, y: (-1 * (CRUST_Y / 2) + 5)},
		color: "#3F3F74"
	});
	g.world.putIn(g.crust,  ["background", "physical"]);

	g.ground = new rb.Entity({name: "Ground"});
	g.world.putIn(g.ground,  ["background"]);
	g.ground.size.x = WORLD_X;
	g.ground.size.y = GROUND_Y;
	g.ground.pos.x = g.world.min.x;
	g.ground.pos.y = -1 * Math.ceil(g.ground.size.y/2) + GROUND_Y + 1;
	g.ground.color = "#9BADB7"; // "#95A7B1";

	/*
	g.textureOverlay = new rb.Entity({
		name: "Texture",
		size: {x: WORLD_X, y: WORLD_Y},
		pos: {x: 0, y: (WORLD_Y/2)},
		color: "#CBDBFC"
	});
	g.world.putIn(g.textureOverlay,  ["background"]);
	*/


	g.addRandomBuilding = function (i) {
		var bOpt = {
			name: "Building " + g.dice.roll1d(10000),
			pos: g.world.getRandomPosition(g.dice)
		};
		var b = new Building(bOpt);
		//console.log("adding random building:", bOpt, b, b.name);
		g.world.putIn(b, ["buildings"]);
		//b.pos = new rb.Coords(10*i, 10*i); //g.world.getRandomPosition(g.dice);
	};
	g.addRandomBuildings = function (n) {
		for (var i = 0; i < n; i++) {
			g.addRandomBuilding(i);
		}
	};
	g.addRandomBuildings(40);


	function addRandomPerson (i) {
		var p = new Person({
			name: "Person " + i + "-" + g.dice.roll1d(1000000),
			pos: g.world.getRandomPosition(g.dice)
		});
		g.world.putIn(p, ["people", "citizens"]);
		p.stayOnGround();
	}
	function addRandomPeople (n) {
		for (var i = 0; i < n; i++) {
			addRandomPerson(i);
		}
	}
	addRandomPeople(STARTING_POP);

//==== Make the other two candidates

	// *** TODO: Make as actual actors?
	
	g.parties = [
		{	// Team Green
			name: "Reptilian Illuminati Party",
			color1: "#6ABE30", 
			color2: "#37946E",
			votes: 0,
			votePercent: 0,
			person: null
		},{	// Team Red
			name: "Grand Ancients Party",
			color1: "#D95763", 
			color2: "#AC3232",
			votes: 0,
			votePercent: 0,
			person: null			
		},{	// Team Blue
			name: "Demopublican Party",
			color1: "#5B6EE1", 
			color2: "#306082",
			votes: 0,
			votePercent: 0,
			person: null			
		}
	];
	function candidateElectioneering () {
		g.world.loopOverEntities("citizens", function(i, ent){
			var DELTABASE = 0.05;
			var delta = DELTABASE;
			var roll = g.dice.roll1d(100);
			// Low fear is good for blue, high fear is good for red
			if (g.world.fearPercent < 25 && ent.partyPreference == 2) {
				delta += (DELTABASE/2);
			} else if (g.world.fearPercent > 50 && ent.partyPreference == 1) {
				delta += g.world.fearPercent / 500;
			} else if (ent.partyPreference == 0) {
				delta = delta/2; // The power of tinfoil
			}
			delta = delta * g.dice.random();
			//console.log(delta);
			ent.partyPreferenceStrength += delta;
			
			// Small chance that an undecided person randomly changes their party affiliation
			if (roll < 5 && ent.partyPreferenceStrength < DECIDED_STRENGTH) {
				ent.partyPreference = g.dice.roll1d(3) - 1;
				ent.partyPreferenceStrength = 0;
			} else if (roll > 95) { // small chance of doubts
				ent.partyPreferenceStrength -= 0.25;
			}
			ent.partyPreferenceStrength = Math.max(Math.min(ent.partyPreferenceStrength, 1), 0);
		});
	}
	function collectPollingNumbers () {
		var pop = getPopulation();
		var fearCount = 0;
		var census = 0;
		$.each(g.parties, function(i, party){
			party.votes = 0;
			party.votePercent = 0;
		});
		g.world.loopOverEntities("citizens", function(i, ent){
			census++;
			if (ent.isCandidate) {
				ent.partyPreferenceStrength = 1;
				return;
			}
			if (ent.partyPreferenceStrength >= DECIDED_STRENGTH) {
				g.parties[ent.partyPreference].votes++;
				//ent.skinColor = g.parties[ent.partyPreference].color1;
				if (!(ent.partyHat || ent.partyShirt)) {
					var clothing = g.dice.roll1d(3);
					if (clothing == 1 || clothing == 3) {
						ent.wearingHat = true;
						ent.partyHat = true;
						ent.hatColor = g.dice.selectRandom([g.parties[ent.partyPreference].color1, g.parties[ent.partyPreference].color2]);
					}
					if (clothing == 2 || clothing == 3) {
						ent.wearingShirt = true;
						ent.partyShirt = true;
						ent.shirtColor = g.dice.selectRandom([g.parties[ent.partyPreference].color1, g.parties[ent.partyPreference].color2]);
					}
				}
			} else {

			}

			if (ent.fear > FEARFUL) {
				fearCount++;
			}

		});
		//var s = "";
		$.each(g.parties, function(i, party){
			var vp = (party.votes / pop) * 100;
			//s += party.name + ' ' + vp + '   ';
			party.votePercent = Math.round((party.votes / pop) * 100);
		});
		if (g.parties[0].votePercent > WIN_VOTE_PERCENT && !g.notifiedOfWin) {
			g.state.transition("win");
		}
		//console.log(s);
		g.world.citizenCensus = census;
		g.world.fearPercent = Math.ceil((fearCount / pop) * 100);
	}
	function getPopulation () {
		//return g.world.entities.citizens.length;
		return g.world.citizenCensus;
	}

//==== Make the Character

	g.character = new Reptilian({
		name: "Ced Truz",
		pos: {x: 0, y: 10}
	});
	g.character.partyPreference = 0;
	g.character.partyPreferenceStrength = 1;
	g.character.eyeColor = "#FBF236";
	g.character.shirtColor = "#F1F1F1";
	g.character.tieColor = "#222034";
	g.character.wearingShirt = true;
	g.character.wearingTie = true;
	g.character.stayOnGround();
	g.world.putIn(g.character, ["people", "candidates"]);
	g.parties[0].person = g.character;
	g.character.draw.before = function(ctx, stageXY, stageXYOffset){
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.arc(stageXY.x, stageXY.y, g.character.speechRadius, 0, TWO_PI, false);
		ctx.strokeStyle = 'rgba(106,190,48, 0.6)';
		ctx.stroke();
		ctx.beginPath();	
		ctx.arc(stageXY.x, stageXY.y, Math.max(g.character.speechRadius - 3, 0), 0, TWO_PI, false);
		ctx.strokeStyle = 'rgba(106,190,48, 0.4)';
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(stageXY.x, stageXY.y, Math.max(g.character.speechRadius - 6, 0), 0, TWO_PI, false);
		ctx.strokeStyle = 'rgba(106,190,48, 0.2)';
		ctx.stroke();
	}

	g.ufo = new Vehicle({
		name: "Reptilian UFO",
		color: "#ff0000",
		pos: {x: 0, y: 50}
	});
	g.world.putIn(g.ufo, ["vehicles"]);
	g.ufo.draw.custom = function(ctx, stageXY, stageXYOffset){
		
		// top
		ctx.fillStyle = "rgb(143,151,74)"; //"#8F974A";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x - 1, stageXY.y, g.ufo.size.x + 2, 1);
		ctx.fillStyle = "rgb(153,161,84)";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x + 1, stageXY.y - 1, g.ufo.size.x - 2, 1);
		ctx.fillStyle = "rgb(163,171,94)";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x + 3, stageXY.y - 2, g.ufo.size.x - 6, 1);
		ctx.fillStyle = "rgb(173,181,104)";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x + 4, stageXY.y - 3, g.ufo.size.x - 8, 1);
		ctx.fillStyle = "#FBF236";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x + 4, stageXY.y - 2, 2, 1);
		// bottom
		ctx.fillStyle = "rgb(103,111,34)";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x, stageXY.y + 1, g.ufo.size.x, 1);
		ctx.fillStyle = "rgb(93,101,24)";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x + 1, stageXY.y + 2, g.ufo.size.x - 2, 1);
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x + 2, stageXY.y + 3, g.ufo.size.x - 4, 1);
		ctx.fillStyle = "rgb(73,81,4)";
		ctx.fillRect(stageXY.x - g.ufo._halfSize.x + 3, stageXY.y + 3, g.ufo.size.x - 6, 1);
	};


//==== Drawing Functions
	

	function drawHorizontalLine (x1, y1, percent, barLength, color1, color2) {
		var x2 = x1 + Math.ceil(barLength * (percent/100));
		var y2 = y1 + 1;
		//console.log(x1, y1, x2);
		//mainLayer.drawStageLine(x1, y1, (x1 + barLength), y1, 1, "#9BADB7");
		//mainLayer.drawStageLine(x1, y2, (x1 + barLength), y2, 1, "#9BADB7");
		mainLayer.drawStageLine(x1, y1, x2, y1, 1, color1);
		mainLayer.drawStageLine(x1, y2, x2, y2, 1, color2);
		return x2;
	}

	function drawStats () {
		var ctx = mainLayer.ctx;
		var fearPercent = Math.ceil(g.world.fearPercent);
		var suitPercent = Math.ceil(g.character.humanSuitDurability);
		var voteGreenPercent = 20;
		var voteRedPercent = 25;
		var voteBluePercent = 20;
		var FULLBAR = 50;
		var HALFBAR = 24;
		var LEFT_X = 7;
		var lastX;
		// Icons
		drawVoteIcon(2, 1);
		drawHumanSuitIcon(1, 5);
		drawFearIcon(59, 5);

		// Blank bars
		drawHorizontalLine(LEFT_X, 1, 100, FULLBAR, "#9BADB7", "#9BADB7"); 
		drawHorizontalLine(LEFT_X, 5, 100, HALFBAR, "#9BADB7", "#9BADB7"); 
		drawHorizontalLine(33, 5, 100, HALFBAR, "#9BADB7", "#9BADB7"); 
		
		// Stat bars
		lastX = LEFT_X;
		$.each(g.parties, function(i, party){
			lastX = drawHorizontalLine(lastX, 1, party.votePercent, FULLBAR, party.color1, party.color2);
		});
		drawHorizontalLine(LEFT_X, 5, suitPercent, HALFBAR, "#8F563B", "#663931");
		drawHorizontalLine(33, 5, fearPercent, HALFBAR, "#D9A066", "#DF7126");
		/*
		lastX = drawHorizontalLine(13, 1, voteGreenPercent, FULLBAR, "#6ABE30", "#37946E");
		lastX = drawHorizontalLine(lastX, 1, voteRedPercent, FULLBAR, "#D95763", "#AC3232");
		lastX = drawHorizontalLine(lastX, 1, voteBluePercent, FULLBAR, "#5B6EE1", "#306082");
		*/
	}

	function drawHumanSuitIcon (x, y) {
		var ctx = mainLayer.ctx;
		ctx.fillStyle = (g.character.isReptileForm ? "#6ABE30" : "#8F563B");
		ctx.fillRect(x + 1, y, 3, 2); // body
		ctx.fillRect(x, y + 1, 5, 1); // arms
		ctx.fillRect(x + 1, y + 2, 1, 1); // legs
		ctx.fillRect(x + 3, y + 2, 1, 1);
		/*		
		ctx.fillRect(x + 1, y, 2, 3); // body
		ctx.fillRect(x, y + 1, 4, 1); // arms
		ctx.fillRect(x, y + 3, 1, 1); // legs
		ctx.fillRect(x + 3, y + 3, 1, 1);
		*/
	}

	function drawVoteIcon (x, y) {
		var ctx = mainLayer.ctx;
		ctx.fillStyle = "#37946E";
		ctx.fillRect(x, y, 1, 2);
		ctx.fillRect(x + 1, y + 2, 1, 1);
		ctx.fillRect(x + 2, y + 1, 1, 1);
		ctx.fillRect(x + 3, y, 1, 1);
	}

	function drawFearIcon (x, y) {
		var ctx = mainLayer.ctx;
		ctx.fillStyle = "#D9A066"; //"#DF7126";
		ctx.fillRect(x, y, 3, 1);
		ctx.fillRect(x, y + 1, 2, 1);
		ctx.fillRect(x, y + 2, 1, 1);
		/*
		ctx.fillRect(x, y, 1, 2);
		ctx.fillRect(x, y + 3, 1, 1);
		*/
	}

	

//==== Setup the stages

	var mainLayer = g.stage.addLayer();
	mainLayer.connectEntities( g.world.entities.all );
	g.stage.resize({x: 64, y: 64});

	g.mainLoop = new rb.Looper(function(){
		g.stage.draw();
		drawStats();
	});
	g.meltingLoop = new rb.Looper(function(){
		g.character.melt(MELT_RATE);
	}, 1000);

	// Speech loop
	g.speechLoop = new rb.Looper(function(){
		
		var speechDecay = SPEECH_DECAY;
		if (g.character.speechCooldown > 0) {
			speechDecay = speechDecay / 2;
			g.character.speechCooldown -= 1;
			g.character.speechCooldown = Math.max(0, g.character.speechCooldown);
		}
		//console.log("radius", g.character.speechRadius, "decay", speechDecay, "cooldown", g.character.speechCooldown, "mana", g.character.speechMana);
		addSpeechBubble(speechDecay);
		if (g.character.speechRadius > 0) {
			addSpeechMana(SPEECH_MANA_RECOVERY_ACTIVE);
		} else {
			addSpeechMana(SPEECH_MANA_RECOVERY);
		}
		
		if (g.character.speechMana < (g.character.maxSpeechMana * 0.2)) {
			g.character.blinkBit = 0;
		}
		
	}, 300);

	// UFO ship loop
	g.ufoPowerLoop = new rb.Looper(function(){
		// wobble
		if (g.dice.random() < 0.2) {
			g.ufo.pos.y += g.dice.roll1d(3) - 2;
		}
		addBeamStrength(BEAM_COOLDOWN_RATE);
	}, 300);

	
	g.mainLoop.addModulusAction(1, function(){
		candidateElectioneering();
		collectPollingNumbers();
		//console.log(g.character.speechRadius);
		//console.log(g.character.humanSuitDurability);
	});

	// Thinking loop
	g.mainLoop.addModulusAction(2, function(){
		g.world.loopOverEntities("citizens", function(i, ent){
			var distFromCharacter = ent.pos.getDistance(g.character.pos);
			var distFromUFO = ent.pos.getDistance(g.ufo.pos);
			if (distFromCharacter <= g.character.speechRadius) {
				ent.action = "standing";
				ent.target = null;
				ent.facingBit = (g.character.pos.x > ent.pos.x) ? 1 : 0;
				if (ent.partyPreference === g.character.partyPreference) {
					ent.partyPreferenceStrength += PERSUATION_POWER;
				} else {
					if (ent.partyPreferenceStrength <= 0) {
						ent.partyPreference = g.character.partyPreference;
						ent.partyShirt = false;
						ent.partyHat = false;
					} else {
						ent.partyPreferenceStrength += DISSUASION_POWER;
					}
				}
			} else if (g.character.isReptileForm && distFromCharacter <= NOTICE_RANGE) {
				ent.panic(g.character);
			} else if (distFromUFO <= UFO_NOTICE_RANGE) {
				ent.panic(g.ufo);				
			} else { // Not listening to player
				// Handle targeting
				if (g.dice.roll1d(20) == 1) {
					ent.selectNewTarget();
				}
			}
			// Emotions
			if (ent.fear > 0) {
				ent.fear += CALM_RATE;
			}
			ent.fear = Math.max(0, Math.min(ent.fear, 1));
		});
	});

	// Movement
	g.mainLoop.addModulusAction(5, function(){
		g.world.loopOverEntities("citizens", function(i, ent){
			ent.moveToTarget();
		});
	});

	// Blinking loop
	g.mainLoop.addModulusAction(5, function(){
		g.world.loopOverEntities("people", function(i, ent){
			// Blinking
			if (ent.blinkBit == 1) { 
				ent.blinkBit = 0;
			} else if (g.dice.roll1d(50) == 1) {
				ent.blinkBit = 1;
			}
		});
	});
	
	/*
	g.stage.addClickEvent(function(p){ 
		console.log("clicked world position", p);
	});
	*/

	//g.stage = new rb.Stage("game-stage");

	g.state.transition("game").transition("splash");
});