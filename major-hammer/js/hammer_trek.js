

//======================================= GAME CLASS (CONSTRUCTOR) ============

function GClass () 
{
	// Connections/Requirements
	this.sound = window.soundCannon;
    // Static data
	this.images = {
		"_path" : "images/"
		,"dirt1" : "dirt1.png"
		,"dirt2" : "dirt2.png"
		,"grass1" : "grass1.png"
		,"grass2" : "grass2.png"
		,"grass3" : "grass3.png"
		,"grass4" : "grass4.png"
		,"grass5" : "grass5.png"
		,"rock1" : "rock1.png"
		,"rock2" : "rock2.png"
		,"rock3" : "rock3.png"
		,"tree1" : "tree1.png"
		,"tree2" : "tree2.png"
		,"tree3" : "tree3.png"
		,"tree4" : "tree4.png"
		,"weeds1" : "weeds1.png"
		,"weeds2" : "weeds2.png"
		,"weeds3" : "weeds3.png"
		,"PC_down0" : "PC_down0.png"
		,"PC_down1" : "PC_down1.png"
		,"PC_down2" : "PC_down2.png"
		,"PC_up0" : "PC_up1.png"
		,"PC_up1" : "PC_up1.png"
		,"PC_up2" : "PC_up2.png"
		,"PC_left0" : "PC_left1.png"
		,"PC_left1" : "PC_left1.png"
		,"PC_left2" : "PC_left2.png"
		,"PC_right0" : "PC_right1.png"
		,"PC_right1" : "PC_right1.png"
		,"PC_right2" : "PC_right2.png"
		,"Bugorian1" : "Bugorian1.png"
		,"Bugorian2" : "Bugorian2.png"
		,"Extermobot1" : "Extermobot1.png"
		,"Extermobot2" : "Extermobot2.png"
		,"Rhibble1" : "Rhibble1.png"
		,"Rhibble2" : "Rhibble2.png"
		,"Human_fore_fists" : "Human_fore_fists.png"
		,"Human_fore_laserpistol" : "MikeBack_gun1.png"
		,"Human_fore_staticphaser" : "MikeBack_gun2.png"
		,"Human_fore_deathraycannon" : "MikeBack_gun3.png"
		,"Overlay_Explode" : "Overlay_Encounter.png"
		,"Overlay_Encounter" : "Overlay_Encounter.png"
		,"Screen_Splash" : "Screen_Splash.png"
		,"Screen_PlanetView" : "Screen_PlanetView.png"
		,"Screen_MemoryOf" : "Screen_MemoryOf.png"
		,"tower_top1" : "tower_top1.png"
		,"tower_top2" : "tower_top2.png"
		,"tower_bottom1" : "tower_bottom1.png"
		,"tower_bottom2" : "tower_bottom2.png"
		,"tower_wreck" : "tower_wreck.png"
		,"Emblem_down" : "Emblem_down.png"
		,"Head_Mike" : "Head_Mike.png"
		,"Head_Loc" : "Head_Loc.png"
		,"Head_Scruffy" : "Head_Scruffy.png"
	};
	
    this.enemySpeciesArray = ["Rhibble", "Extermobot", "Bugorian"];
	this.enemySpeciesChances = [50, 30, 20];
	this.totalTowers = 9;
	
    // State Data
	this.isGameStarted = false;
    this.state = "SPLASH"; // START, MOVING, STANDING, CUTSCENE, COMBAT ?
	this.anyKey = [];
	this.menu = ["Items", "Credits", "Quit"];
	this.menuSelectionIndex = 0;
	this.towersDestroyed = 0
	this.stepCount = 0;
	this.enemy = null;
	this.encounter = {
		victoryFunction : null
	};
	this.action = {		// the current/last action taken
		coords : { "x" : 25, "y" : 26 }
	};

    // The Map
    this.map = {
        "Z1" : new MapClass(this.totalTowers)
        //, "Z2" : new MapClass(this.totalTowers)
    };
	this.map["Z1"].generateRandom(25,25);
	// The Player Character
    this.pc = new CharacterClass("Human", this.map["Z1"], 25, 25);
	this.pc.gunNum = 1;
	this.pc.availableGuns = [1];	
	this.pc.points = 0;
	this.pc.giveItem("Laser Pistol");
	
	
	
    this.router = function (newState /* additional arguments */) 
	{
		var o = this;
		var oldState = this.state;
		this.state = newState;
		console.log("New State", newState);
		this.stopLoop();
        switch(newState.toUpperCase()){
            case "SPLASH":
				this.drawScreen("Screen_Splash");
                break;
            case "OVERLAND":
				this.startLoop();
                break;
            case "STORY":
				this.story();
                break;
			case "COMBAT":
				this.drawCombatDialogue();
				break;
			case "BOSS":
				this.encounter.victoryFunction = function() {
					o.destroyTower();
					o.encounter.victoryFunction = null;
				}
				this.startEncounter();
				break;
            case "ENCOUNTER":
				this.encounter.victoryFunction = null;
                this.startEncounter();
                break;
            case "MENU":
				this.openMenu();
                break;
			case "CREDITS":
				this.drawScreen("Screen_MemoryOf");
				this.drawTriangle();
				this.waitForAnyKey(function(){
					o.drawDialogue("Loc", ["Coding, graphics, etc.", "by Luke Nickerson", "Copyright 2014"]);
					o.drawTriangle();
				});
				break;
            default:
        }
		return this.state;
    }
	
    this.buttonEvent = function(keyName) 
	{
		console.log("buttonEvent", keyName, this.anyKey);
		if (this.anyKey.length > 0) {
			if (keyName == "A" || keyName == "B") {
				this.sound.play("blip");
				var f = this.anyKey.pop();
				//console.log("Popping a new ANYKEY function then calling it", f);
				f(keyName);
			}
		} else{
			switch(this.state){
				case "SPLASH":
					switch(keyName){
						case "SELECT": 	this.router("CREDITS"); break;
						case "START":
						case "A":
							this.isGameStarted = true;
							this.router("STORY");
							break;
						default:
					}
					break;
				case "STORY":
					//this.nextDialogue();
					break;
				case "OVERLAND":
					switch(keyName) {
						case "START": this.router("MENU"); break;
						case "SELECT": 	this.router("CREDITS"); break;
						case "A": this.doOverlandAction(); break;
						case "B": this.router("MENU"); break;
						default:
							this.travel(keyName);
					}
					break;
				case "MENU":
					switch(keyName) {
						case "UP": /* */ break;
						case "DOWN": /* */ break;
						case "A": /* action! */ break;
						case "LEFT": 
						case "RIGHT":
							break;
						default:
							this.router("OVERLAND");               
					}
					break;
				case "COMBAT":
					console.log("combat " + keyName);
					switch(keyName) {
						case "START": 	this.router("MENU"); break;
						case "SELECT": 	this.router("MENU"); break;
						case "A": 		this.doPlayerCombatRound("ATTACK"); break;
						//case "B": 		this.router("MENU"); break;
						case "LEFT":	this.doPlayerCombatRound("RUN"); break;
						case "UP":
						case "DOWN":						
							this.doPlayerCombatRound("CYCLE " + keyName); 
							break;
						case "RIGHT":
							this.doPlayerCombatRound("BE AGGRESSIVE"); 
							break;
						default:               
					}
					break;
				case "CREDITS":
					if (this.isGameStarted) {	this.router("OVERLAND"); 
					} else {					this.router("SPLASH"); }
					break;
				default:
			}
		}
        //console.log(keycode);
    }
    this.handleKeyUp = function(keycode) {
        switch(keycode) {
            //case 37: this.pc.moveLeft(); break;
            //case 38: this.pc.moveUp(); break;
            //case 39: this.pc.moveRight(); break;
            //case 40: this.pc.moveDown(); break;
        }
        //console.log(keycode);
    }
 
	this.openDialogue = function (t, callback) 
	{
		//console.log("open dialogue --> ", t, typeof callback);
		var line = ["", "", ""];
		var who = null;
		if (typeof t === 'string') {
			line = [
				t.substr(0,18).trim()
				,t.substr(18,36).trim()
				,t.substr(36).trim()
			];
		} else {
			if (t[0].substr(0,1) == "@") {
				who = t[0].substr(1);
				t.shift();
			}
			if (t[0] !== undefined) line[0] = t[0];
			if (t[1] !== undefined) line[1] = t[1];
			if (t[2] !== undefined) line[2] = t[2];
		}
		this.stopLoop(); // stop the overland loop
		this.drawDialogue(who, line, true);
		this.waitForAnyKey(callback);
	}
	
	this.waitForAnyKey = function (callback) {
		var o = this;
		var f = function(){ 
			o.startLoop();	// seems like the wrong place for this
			if (typeof callback === 'function') callback();
		};
		this.anyKey.push(f);
		//console.log("anykey was given another function: ", this.anyKey);		
	}
	
	
	

	//====================================== GAME LOGIC =======================
	
	this.travel = function(keyName) {
		var o = this;
		//console.log(keyName);
		this.stepCount++;
		if (this.stepCount == 15 || this.stepCount == 30 || this.stepCount == 80) {
			o.router("STORY");
		} else {
			this.pc.move(keyName, true, function(){
				o.checkForEncounter();
			});	
		}
	}
    this.checkForEncounter = function () {
		var encounterRoll = gameTools.roll1d(50);
		console.log(encounterRoll);
        if (encounterRoll == 1) {
            this.router("ENCOUNTER");
        }
    }
    this.startEncounter = function () {
		
		console.log("Starting encounter");
		
		this.stopLoop();
        this.drawOverland();
		
		var speciesIndex = 0;
		var speciesName = "";
		var speciesRoll = gameTools.roll1d(100);
		if (speciesRoll <= this.enemySpeciesChances[2]) {
			speciesIndex = 2;
		} else if (speciesRoll <= this.enemySpeciesChances[2] + this.enemySpeciesChances[1]) {
			speciesIndex = 1;
		} else {
			// keep 0
		}
		speciesName = this.enemySpeciesArray[speciesIndex];
		
		// Create enemy
		this.enemy = new CharacterClass (speciesName, this.pc.zone, this.pc.coords.x, this.pc.coords.y);

		this.drawScreen("Overlay_Encounter");
		this.sound.play("encounter");
        
		// Wait a second and then switch to combat screen
		var o = this;
		var encounterTimer = window.setTimeout(function(){
			o.drawCombat(o.pc, o.enemy);
            o.openDialogue([("A wild " + speciesName), "appears! Combat!"], function(){
				//var combatTimer = window.setTimeout(function(){
					o.router("COMBAT");
				//}, 1500);
			});
		}, 1500);
    }
	
	this.playCombatSound = function (c) {
		this.sound.play("combat_" + c.getEquippedItem().imageName);
	}
	
    this.doPlayerCombatRound = function (action) 
	{
		var o = this;
		var enemyKilled = false;
		var say = [];
		var dialogueFunction = function(){ 
			o.doEnemyCombatRound();
		};
		var dmgToEnemy = null;
		var dmgToPC = null;
		
		switch (action) {
			case "ATTACK":
				if (this.pc.hit()) {
					dmgToEnemy = this.pc.getDamage();			
					this.enemy.damage(dmgToEnemy);		
					say = ["", "", ("(" + dmgToEnemy.amount + " damage)")];
					this.playCombatSound(this.pc);
					if (this.enemy.isDead()) {
						say[0] = "You kill the " + this.enemy.species + "!";
						say[1] = "+" + this.enemy.points + " points";
						this.pc.addPoints(this.enemy.points);
						this.pc.healHalf();
						dialogueFunction = function(){
							if (typeof o.encounter.victoryFunction === 'function') {
								o.encounter.victoryFunction();
							} else {
								o.leaveCombat();
							}
						};
					} else {
						say[0] = "You hit the " + this.enemy.species + "!";
					}
				} else {
					this.sound.play("whiff");
					say = ["You miss!", "HAMMER: !@#$%", "smeghead!"];
				}
				
				break;
			case "RUN":
				if (this.pc.isAggressive) {
					this.pc.calmDown();
					say = ["You fall back!", "+ Bonus to accuracy", "- Penalty to damage"];
				} else {
					var runRoll = gameTools.roll1d(3);
					if (runRoll == 1) {
						say = ["You run away!", "HAMMER: It's a", "tactical withdrawal..."]
						dialogueFunction = function(){
							o.router("OVERLAND");
						};
					} else if (runRoll == 2) {
						say = ["The " + this.enemy.species, "persues you!"];
						dialogueFunction = function(){ }; // do nothing
					} else {
						say = ["The " + this.enemy.species, "stops you from", "running away!"];
					}
				}
				break;
			case "CYCLE UP":
				var item = this.pc.cycleEquippedItem(-1);
				say = ["You switch to the", item.name + "."];
				break;
			case "CYCLE DOWN":
				var item = this.pc.cycleEquippedItem(1);
				say = ["You switch to the", item.name + "."];
				break;
			case "BE AGGRESSIVE":
				this.pc.beAggressive();
				say = ["Be Aggressive!", "- Penalty to accuracy", "+ Bonus to damage"];
				break;
			default:
				say = [action + "???"];
		}
		// Output
		this.drawCombat(this.pc, this.enemy, dmgToPC, dmgToEnemy);
		this.openDialogue(say, dialogueFunction);
    }
	
	this.doEnemyCombatRound = function ()
	{
		var o = this;
		var say = [];
		
		this.drawCombat(this.pc, this.enemy);
		
		if (this.enemy.hit()) {
			var dmg = this.enemy.getDamage();
			this.pc.damage(dmg);
			this.drawCombat(this.pc, this.enemy, dmg, null);
			say = ["", "", ("(" + dmg.amount + " damage)")];
			this.playCombatSound(this.enemy);
			// Is the PC dead or just normally hit?
			if (this.pc.isDead()) {
				this.pc.subtractAllPoints();
				say = ["Enemy critically", "wounded you!","You lose all points. :("];
				this.openDialogue(say, function(){
					o.leaveCombat();
					o.openDialogue(["You are left wounded...","but slowly recover..."], function(){
						o.pc.healHalf();
						o.openDialogue(["HAMMER: This mission","is too important.", "Onward!"],function(){
							o.startLoop();
						});
					});
				});
			} else {
				say[0] = "Enemy hits you!";
				//console.log("before open dialogue for enemy hit");
				this.openDialogue(say, function(){
					//o.doEnemyCombatRound();
					//console.log("after open dialogue for enemy hit");
					o.drawCombatDialogue();
				});
			}
		} else {
			this.sound.play("whiff");
			say = [this.enemy.species + " misses!"];
			this.openDialogue(say, function(){
				//o.doEnemyCombatRound();
				o.drawCombatDialogue();
			});
		}
	}
	
	this.leaveCombat = function() {
		this.enemy = null;
		this.router("OVERLAND");
	}
    
	
	this.doOverlandAction = function()
	{
		var o = this;
		var zoneMap = this.pc.zone;
		var targetCoords = { "x" : this.pc.coords.x, "y" : this.pc.coords.y };
		switch (this.pc.facing) {
			case "UP": targetCoords.y--; break;
			case "DOWN": targetCoords.y++; break;
			case "LEFT": targetCoords.x--; break;
			case "RIGHT": targetCoords.x++; break;
		}
		// Do a double-step animation
		this.pc.doStep();
		var stepTimer = setTimeout(function(){ o.pc.doStep(); }, 200);		
		
		// Get the block, and do something...
		var block = zoneMap.getBlock(targetCoords);
		this.action.coords = targetCoords;
		console.log("Overland Action on block:", block);
		console.log(targetCoords, this.pc.coords);
		
		if (zoneMap.isBlockObstacle(block)) {
			
			if (block.obstacle.type == "tower") {
				// Initiate boss combat
				this.router("BOSS");
			} else {
				var isChopped = zoneMap.chopTerrain(targetCoords, 1);
				if (isChopped) this.sound.play("chop");
				else this.sound.play("whiff");
				
			}
		} else {
			this.sound.play("whiff");
		}
	}
	
	
    this.destroyTower = function () 
	{
		var o = this;
		var zoneMap = this.pc.zone;
		this.leaveCombat();
		this.towersDestroyed++;
		this.setSpeciesChances();
		this.openDialogue(["You defeated the", "tower guards and", "detonate the tower!"], function(){
			zoneMap.explodeTerrain(o.action.coords);
			o.drawScreen("Overlay_Explode");
			o.sound.play("explosion");
			o.openDialogue([
				"BOOM!", 
				"Towers destroyed: " + o.towersDestroyed, 
				"Towers left: " + (o.totalTowers - o.towersDestroyed)
			], function(){
				o.checkWin();
			});
		});
	}
	this.setSpeciesChances = function () {
		var p = this.towersDestroyed / this.totalTowers;
		if (p == 1) {
			this.enemySpeciesChances = [40, 30, 30];
		} else if (p > 0.7) {
			this.enemySpeciesChances = [20, 30, 50];
		} else if (p > 0.3) {
			this.enemySpeciesChances = [30, 50, 20];
		} else {
			this.enemySpeciesChances = [50, 30, 20];
		}
	}
	
	this.checkWin = function(){
		var o = this;
		if (o.towersDestroyed >= o.totalTowers) {
			console.log("You win!");
			o.router("STORY");
			return true;
		} else if (o.towersDestroyed == Math.round(o.totalTowers/3)
			|| o.towersDestroyed == Math.round(o.totalTowers * (2/3))) 
		{
			o.router("STORY");
			return false;
		}
	}

	
    //================================================ STORY 
	
	this.storyProgress = 0;
	this.story = function()
	{
		var o = this;
		var d = [
			["The adventures of","Major Hammer begin!","Press A to continue..."]
			,
			[	"@Mike"
				,"HAMMER: Major's Log"
				,"stardate 10064." 
				,"We have received a"
			],[
				"@Mike"
				,"distress signal"
				,"from Bugoptim Prime,"
				,"and I am preparing"
			],[
				"@Mike"					// index 3
				,"an away team to go"
				,"to the surface to"
				,"investigate..."
			],[ "...??!!"]
			,[	"HAMMER: Where's my"	// index 5
				,"team??"
			]
			,[	"...[comm static]..."
				,"HAMMER: Loc, can"
				,"you hear me?"
			],[	
				"@Loc"
				,"LOC: Major..."
				,"it would seem that"
				,"our teleporting"
			],[	"@Loc"
				,"is being jammed."
				,"I'm investigating..."
			],[	"@Mike"
				,"HAMMER: Looks like"	// index 9
				,"I'm on my own now."
			],[	"STOP"					// index 10
			],[	"@Loc"
				,"LOC: Fascinating!" 
				,"There are interfering"
				,"signals coming from "
			],[	"@Loc"
				,"the surface. We have"
				,"detected a number of"
				,"towers on the ground."
			],[	"@Loc",		
				"Perhaps you can find ",	"them and turn off ",	"the jamming."
			],[	"@Mike",	
				"HAMMER: I will find ",		"these towers...",		"and destroy them!"
			],["STOP"					// index 15
			],["@Loc",
				"LOC: It seems as if",		"there are hostile", 	"creatures on this"
			],["@Loc",
				"planet. Our sensors ",		"are picking up several", "types of life forms."
			],["@Mike",
				"HAMMER: Perhaps they",		"have weaknesses that",	"I can exploit."
			],["STOP"					// index 19
			],["@Loc",
				"LOC: Our sensors have",	"detected that the",	"towers were built"
			],["@Loc",
				"by the Bugorians, a ",		"ruthless race. It",	"seems to be a trap."
			],["@Mike",
				"HAMMER: Fear not, I",		"will spring the trap,","stop the evil"
			],["@Mike",
				"bugorians, and save",		"this planet!"
			],["STOP"					// index 24
			],[	"@Loc",
				"LOC: Looks like the ",		"jamming signal has",	"been weakened."
			],["@Loc",
				"Scrof is going to ",		"attempt to use the",	"warp system."
			],["@Scruffy",	
				"SCROF: Major, I can't",	"send crew members ",	"but I'm warping"
			],["@Scruffy",
				"you down a new ",			"weapon: a Static ",	"Phaser."
			],["@Mike",	
				"HAMMER: Should be",		"useful against those",	"killer trashcan bots."
			],["STOP"					// index 30
			],["@Scruffy",
				"SCROF: The jamming ",		"signal is much ",		"weaker. I can "
			],["@Scruffy",
				"send you the most",		"powerful weapon we", 	"have - the Deathray."
			],["@Mike",
				"HAMMER: That should ",		"help to squish the", 	"Bugorians."
			],["STOP"					// index 34
			],["@Scruffy",
				"SCROF: Teleporters",		"back on-line!",		"Hooray!"
			],["@Loc",
				"LOC: Good work Major.",	"We will be sending",	"down a brigade of"
			],["@Loc",
				"redshirts soon. ",			"Bugoptim Prime will",	"soon be secured."
			],["@Mike",
				"HAMMER: The needs of",		"the many outweigh",	"the needs of the"
			],["@Mike",
				"few. And I have a ",		"feeling there will",	"be a lot fewer "
			],["@Mike",
				"Bugorians when ",			"we're done here.", 	"Hammer out."
			],[	"* * * * * * * * *",		"YOU'VE WON!",			"* * * * * * * * *"]
			// ^ index 41
		];
		var say = d[this.storyProgress];
		if (say === undefined) {
			o.router("OVERLAND");
		} else {
			if (this.storyProgress <= 3 || say[0] == "@Loc" || say[0] == "@Scruffy") {
				this.drawScreen("Screen_PlanetView");
			} else {
				this.drawOverland();
			}
			switch (this.storyProgress) {
				case 4: this.sound.play("teleport");
					break;
				case 7: 
				case 16:
				case 20:
				case 25:
				case 31:
				case 35:
					this.sound.play("communicator");
					break;
				default:
					//this.sound.play("whiff");
			}
			
			if (this.storyProgress == 28) {
				this.pc.giveItem("Static Phaser");
				this.sound.play("teleport");
			} else if (this.storyProgress == 32) {
				this.pc.giveItem("Deathray Cannon");
				this.sound.play("teleport");
			}
			
			this.storyProgress++;
			if (this.storyProgress <= d.length && say[0] != "STOP") {
				this.openDialogue(say, function(){	
					o.story();
				});
			} else {
				o.router("OVERLAND");
			}
		}
	}
	
	
	
	
	//====================================== MENU ===================++========
	
    this.openMenu = function()
	{
		var scanResult = this.doScan();
		var a = [
			"Scan: " + scanResult
			,"Land Controls:"
			,"A = Action"
			,"(zap tree)"
			,"B = Help"
			,"Arrows= Move"
			,"Select=Credits"	
		];
		
		//a.concat( this.pc.getItemNameArray() );
		
		this.stopLoop();
		this.drawMenu(a);
	}
	
	this.doScan = function()
	{
		var zoneMap = this.pc.zone;
		var x,y,block,d;
		var scan = "";
		var lowestDistance = zoneMap.size.x + zoneMap.size.y;
		for (x = 0; x < zoneMap.size.x; x++) {
			for (y = 0; y < zoneMap.size.y; y++) {
				block = zoneMap.terrain[x][y];
				if (block.isObstacle) {
					if (block.obstacle.type == "antennae") {
						var d = zoneMap.getDistance(x,y, this.pc.coords.x, this.pc.coords.y);
						if (d < lowestDistance) {
							lowestDistance = d;
						}
					}
				}
			}
		}
		if (lowestDistance <= 5) 		scan = "/////";
		else if (lowestDistance < 7) 	scan = ".////";
		else if (lowestDistance < 9) 	scan = "..///";
		else if (lowestDistance < 11) 	scan = "...//";
		else if (lowestDistance < 13) 	scan = "..../";
		else 							scan = ".....";
		return scan;
	}
    
	
	

    //====================================== CANVAS ===========================

    // Pixel measurements
    this.blockSize = { "x" : 16, "y" : 16 };
    this.halfBlockSize = { "x" : 8, "y" : 8 };

    this.canvasCenterOffsetByHalfBlock = { 
        "x" : (this.canvasCenter.x - this.halfBlockSize.x)
        ,"y" : (this.canvasCenter.y - this.halfBlockSize.y)
    };
    this.dialogueMargin = 4;
    this.dialogueCanvas = {
        "x" : this.dialogueMargin
        ,"y" :  (this.canvasCenter.y + this.blockSize.y + this.dialogueMargin)
    };
    this.dialogueSize = {
        "x" : this.canvasSize.x - (2 * this.dialogueMargin)
        ,"y" : (this.canvasSize.y - this.dialogueCanvas.y - this.dialogueMargin)
    };
    // Map coordinates
    this.focus = { "x" : 0, "y" : 0 };
    
    this.drawOverland = function () 
    {
        //console.log(this.pc.coords);
        this.focus.x = this.pc.coords.x;
        this.focus.y = this.pc.coords.y;
        
        var zoneMap = this.pc.zone;
        var d = 5;
        var startX = Math.ceil(this.pc.coords.x) - d;
        var startY = Math.ceil(this.pc.coords.y) - d;
        var endX = Math.floor(this.pc.coords.x) + d;
        var endY = Math.floor(this.pc.coords.y) + d;
        var x, y;
        var canvasCoords = {};
        var block = {};
        if (startX < 0) startX = 0;
        if (startY < 0) startY = 0;
        if (endX >= zoneMap.size.x) endX = zoneMap.size.x - 1;
        if (endY >= zoneMap.size.y) endY = zoneMap.size.y - 1;
        
		this.ctx.save();
		this.clearCanvas();
		
        //console.log(x,y,startX,endX);
        for (y = startY; y <= endY; y++) {
            //console.log("Y!", y, endY);
            for (x = startX; x <= endX; x++) {
                // *** look at zoneBlock to get image
                block = zoneMap.terrain[x][y];
                if (typeof block === 'undefined') {
                    console.log("block is undefined @", x, y);
                }
                
                canvasCoords = this.getCanvasCoords(x, y);
                //console.log(x,y, canvasCoords);
				/*
                if (typeof block.tree !== 'undefined') {
                    this.ctx.fillStyle = "black";
                } else {
                    this.ctx.fillStyle = block.fillStyle;
                }
				
                this.ctx.fillRect(canvasCoords.x, canvasCoords.y, this.blockSize.x, this.blockSize.y);
				*/
				
				// Draw the terrain (grass)
				this.ctx.drawImage(	this.images[block.imageName]
				,canvasCoords.x, canvasCoords.y, this.blockSize.x, this.blockSize.y );
				
				// Draw any obstacles (trees, rocks, towers)
				if (zoneMap.isBlockObstacle(block)) {
					this.ctx.drawImage(	this.images[block.obstacle.imageName]
						,canvasCoords.x, canvasCoords.y, this.blockSize.x, this.blockSize.y );
				}
				
				
                /*
                this.ctx.fillStyle = "#000033";
                this.ctx.font = "7px Arial";
                this.ctx.fillText(x + "," + y, canvasCoords.x, canvasCoords.y);
                */
            }
        }
		
        // Draw PC
		this.ctx.drawImage(	this.images[this.pc.getOverlandImageName()]
			,this.canvasCenterOffsetByHalfBlock.x, this.canvasCenterOffsetByHalfBlock.y
			, this.blockSize.x, this.blockSize.y 
		);
        
        this.ctx.restore();
		this.applyCanvasFilter();
    }
	
	this.clearCanvas = function(){
		// Clear canvas
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.fillStyle = this.colors[0];
		this.ctx.clearRect(0,0,this.canvasSize.x,this.canvasSize.y);
	}
    
	this.drawScreen = function (imageName) {
		this.ctx.drawImage(	this.images[imageName]
			,0,0,this.canvasSize.x,this.canvasSize.y);
		this.applyCanvasFilter();
	}
	
    this.drawCombat = function (friendly, enemy, friendlyDmg, enemyDmg) 
	{
		var s = 40;
		var foreground = { "x" : 10, "y" : 50 };
		var background = { "x" : 100, "y" : 10 };
		if (friendly.isAggressive) {
			foreground.x += 8;
		}
		//foreground.x += (gameTools.roll1d(3) - 2);
		
		this.ctx.save();
		this.clearCanvas();
		this.ctx.font = "10px Verdana";
		this.ctx.fillStyle = this.colors[2];
		this.ctx.drawImage(	this.images[friendly.getForegroundImageName()]
			,foreground.x, foreground.y, s, s );
		this.ctx.fillText(friendly.hp + " hp", 60, 65);
		if (friendlyDmg !== undefined && friendlyDmg != null && friendlyDmg.amount != 0) {
			this.ctx.fillText("-" + friendlyDmg.amount, 60, 55);
		}
		
		this.ctx.drawImage(	this.images[enemy.getBackgroundImageName()]
			,background.x, background.y, s, s );
		this.ctx.fillText(enemy.hp + " hp", 50, 25);
		if (enemyDmg !== undefined && enemyDmg != null && enemyDmg.amount != 0) {
			this.ctx.fillText("-" + enemyDmg.amount, 50, 15);
		}
		this.ctx.restore();
		this.applyCanvasFilter();
    }
	
	this.drawCombatDialogue = function () {
		this.drawDialogue(null, ["A = Attack", "Left = Run", "Up/Down = Switch"], false, this.colors[1]);
	}
    
    this.drawDialogue = function (who, lines, includeTriangle, fillStyle) {
		var fontSize = 12;
		var padding = 4;
		var textCoords = {
			"x" : this.dialogueCanvas.x + padding
			,"y" : this.dialogueCanvas.y + (padding/2)
		};
		if (typeof fillStyle !== "string") fillStyle = this.colors[0];
		if (typeof includeTriangle !== "boolean") includeTriangle = false;
	
		this.ctx.save();
        this.ctx.fillStyle = fillStyle;
        this.ctx.strokeStyle = this.colors[3];
        this.ctx.font = fontSize + "px Verdana";
        this.ctx.fillRect(this.dialogueCanvas.x, this.dialogueCanvas.y, this.dialogueSize.x, this.dialogueSize.y);
        this.ctx.strokeRect(this.dialogueCanvas.x, this.dialogueCanvas.y, this.dialogueSize.x, this.dialogueSize.y);
		
		if (includeTriangle) {
			this.drawTriangle();
		}

		if (who != null && who != "") {
			this.ctx.drawImage(	this.images["Head_" + who]
				,(this.dialogueCanvas.x )
				,(this.dialogueCanvas.y - 16)
				, 16, 16 
			);
		}
		
        this.ctx.fillStyle = this.colors[3];
        this.ctx.fillText(lines[0], textCoords.x, textCoords.y);
		this.ctx.fillText(lines[1], textCoords.x, textCoords.y + (fontSize + 2));
		this.ctx.fillText(lines[2], textCoords.x, textCoords.y + ((fontSize + 2) * 2));
		
		this.ctx.restore();
		this.applyCanvasFilter();
    }
	
	this.drawTriangle = function() {
		this.ctx.drawImage(	this.images["Emblem_down"]
			,(this.dialogueCanvas.x + this.dialogueSize.x - 16)
			,(this.dialogueCanvas.y + this.dialogueSize.y - 16)
			, 16, 16 
		);
		this.applyCanvasFilter();
	}
	
	this.drawMenu = function(options, isBackground) 
	{
		var fontSize = 12;
		var i = 0;
		var padding = 4;
		var menuCoords = { 
			"x" : 30, "y" : padding 
		};
		var menuSize = { 
			"x" : 100
			,"y" : (this.canvasSize.y - (2 * padding))
		};
		var textCoordStart = { 
			"x" : (menuCoords.x + padding)
			,"y" : (menuCoords.y + padding) 
		};
		var bottomTextCoordStart = {
			"x" : textCoordStart.x
			,"y" : this.canvasSize.y - (2 * padding)
		};
		// Draw menu background
		this.ctx.save();
		if (isBackground) {
			menuCoords.x = padding;
			this.ctx.fillStyle = this.colors[1];
		} else {
			this.ctx.fillStyle = this.colors[0];
		}
        this.ctx.strokeStyle = this.colors[3];
        this.ctx.font = fontSize + "px Verdana";
        this.ctx.fillRect(menuCoords.x, menuCoords.y, menuSize.x, menuSize.y);
        this.ctx.strokeRect(menuCoords.x, menuCoords.y, menuSize.x, menuSize.y);
		// Write out menu text
		this.ctx.fillStyle = this.colors[3];
		for (i = 0; i < options.length; i++) {
			this.ctx.fillText(options[i], 
				textCoordStart.x, textCoordStart.y + (i * fontSize)
			);
		}
		// Write out bottom text
		this.ctx.fillStyle = this.colors[2];
		this.ctx.fillText(
			"Towers: " + (this.totalTowers - this.towersDestroyed) + " / " + this.totalTowers
			,bottomTextCoordStart.x, bottomTextCoordStart.y - fontSize
		);		
		this.ctx.fillText(
			"Points: " + this.pc.points
			,bottomTextCoordStart.x, bottomTextCoordStart.y - (fontSize * 2)
		);
		this.ctx.fillText(
			"HP: " + this.pc.hp + " / " + this.pc.maxHp
			,bottomTextCoordStart.x, bottomTextCoordStart.y - (fontSize * 3)
		);		
		
		this.ctx.restore();
	}
    
    this.getCanvasCoords = function (mapX,mapY) {
        var diffFromFocus = {
            "x" : (mapX - this.focus.x)
            ,"y" : (mapY - this.focus.y)
        };
        var canvasCoords = {
            "x" : this.canvasCenterOffsetByHalfBlock.x + (diffFromFocus.x * this.blockSize.x)
            ,"y" : this.canvasCenterOffsetByHalfBlock.y + (diffFromFocus.y * this.blockSize.y)
        };
        return canvasCoords;
    }


	//====================================== LOOP =============================

    this.isLooping 		= true;
	this.loopTimer 		= 0;
	this.loopIteration 	= 0;
	this.lastTime 		= 0;
	//==== Loop timing Constants
	this.loopDelay		= 14;
	// ^ Decrease for more fps
	// 1000 = 1 second
	// 100 = 1/10th of a second
	// 16 = 1/?th of a second = 62.5 fps (closest to 60 fps)
	// 10 = 1/100th of a second (better than 60 fps)
	// Needs to be less than 16 to accomodate for the time it takes to run the loop 'stuff'
	this.framesPerSecond = (1000 / this.loopDelay);
	this.secondsPerLoop	= (this.loopDelay / 1000);
	// Update certain things once every X iterations
	this.loopModulus		= Math.round(this.framesPerSecond); // once per second
	this.loopModulusAction	= Math.round(this.framesPerSecond / 2); // twice per second

	this.loop = function () 
	{
		var o = this;

		// Update every half second or so... For action...
		if ((o.loopIteration % o.loopModulusAction) == 0) {
			// *** look for collisions here?
		}
		this.drawOverland();


		// Update these only every second or so... 
		if ((o.loopIteration % o.loopModulus) == 0) {
			//console.log("Loop tick ~1/second");
		}			

		if (o.isLooping) {
			o.loopIteration++;
			if (o.loopIteration < 15000000) {
				o.loopTimer = window.setTimeout(function(){
					o.loop();
				}, o.loopDelay); 
			} else {
				o.loopIteration = 0;
				//o.togglePause(true);
			}
		}	
	}
	this.startLoop = function(){
		window.clearTimeout(this.loopTimer);
		if (this.state == "OVERLAND") {
			this.isLooping = true;
			this.loop();
		}
	}
	this.stopLoop = function (){
		this.isLooping = false;
		window.clearTimeout(this.loopTimer);
	}	



    //====================================== INIT =============================
    
	
	this.loadImages = function (imagesRefObj, callback) 
	{
		var o = this;
		var imagesCount = 0;
		var imagesLoadedCount = 0;
		var sourceUrl = "";
		var path = "";
		// Get the path
		if (typeof imagesRefObj._path !== 'undefined') {
			var path = imagesRefObj._path;
			delete imagesRefObj._path;
		}
		// Get the total count of images
		for (var v in imagesRefObj) {
			imagesCount++;
		}
		// Loop through once more to convert the imagesrefObj so it contains images
		for (var v in imagesRefObj) {
			sourceUrl = imagesRefObj[v];
			if (typeof sourceUrl === 'string') {
				imagesRefObj[v] = new Image();
				imagesRefObj[v].src = 'images/' + sourceUrl;
				imagesRefObj[v].onload = function () {
					imagesLoadedCount++;
					if (imagesLoadedCount >= imagesCount) {
						console.log("All " + imagesCount + " images loaded.");
						callback();
					}
				}
			}
		}
		console.log("Loading " + imagesCount + " images. (" + imagesLoadedCount + " done so far.)");
	}

	this.power = function(isPowerOn){
		var o = this;
		if (isPowerOn) {
			this.loadImages(this.images, function(){
				o.sound.play("startup");
				o.router("SPLASH");
			});
		}
	}
	
    this.init = function () {
	
		this.initializeGameToy(); // Inherited from GbClass
		
		this.sound.loadSounds([
			"blip",
			"chop",
			"combat_bite",
			"combat_deathraycannon"
			,"combat_extermolaser"
			,"combat_fists"
			,"combat_laserpistol"
			,"combat_laserrifle"
			,"combat_staticphaser"
			,"communicator"
			,"encounter"
			,"explosion"
			,"startup"
			,"teleport"
			,"whiff"
		]);		
		
        // Events
        var o = this;
        $(document).keydown(function(e){
            switch(e.which) {
                case 37: // left
                case 65: // a
                    o.buttonEvent("LEFT"); break;
                case 38: // up
                case 87: // w
                    o.buttonEvent("UP"); break;
                case 39: //right
                case 68: // d
                    o.buttonEvent("RIGHT"); break;
                case 40: //down
                case 83: // s
                    o.buttonEvent("DOWN"); break;
                case 69: // e
                case 32: // space
                case 13: // enter
                    o.buttonEvent("A"); break;
                case 81: // q
                case 96: // numpad 0
                    o.buttonEvent("B"); break;
                case 88: // x
                case 27: // Esc
                    o.buttonEvent("START"); break;
                case 90: // z
                case 9: // tab
                    o.buttonEvent("SELECT"); break;
            }            
            //console.log(e.which);
			e.preventDefault();
        }).keyup(function(e){
            o.handleKeyUp(e.which);
        });
        

        
        //this.openDialogue("Hello, World!");
    }
    this.init();
};
GClass.prototype = new GbClass();

$(document).ready(function(){
    window.g = new GClass();
    //console.log(window.g);
	
	//window.gb.buttonEvent = window.g.buttonEvent
});


