
window.gameTools = {
    roll1d : function (sides) {
		return (Math.floor(Math.random()*sides) + 1);
	}
	,roll_d : function (n, sides) {
		var t = 0;
		for (var i = 0; i < n; i++) {
			t += window.gameTools.roll1d(sides);
		}
		return t;
	}
};

//===================================================== ITEMS =================

function ItemClass (itemName) {
	this.name = itemName;
	this.transferrable = true;
	this.damageDice = 0;
	this.damageDiceNum = 0;
	this.damageType = "physical";
	switch(itemName){
		case "Laser Pistol": 
			this.damageDice = 10;
			this.damageDiceNum = 3;
			this.damageType = "laser";		
			break;
		case "Static Phaser":
			this.damageDice = 15;
			this.damageDiceNum = 3;
			this.damageType = "static";		
			break;
		case "Deathray Cannon":
			this.damageDice = 20;
			this.damageDiceNum = 3;
			this.damageType = "deathray";
			break;
		case "Bite":
			this.damageDice = 8;
			this.damageDiceNum = 2;
			this.transferrable = false;
			break;
		case "Extermo-Laser":
			this.damageDice = 8;
			this.damageDiceNum = 2;
			this.transferrable = false;
			break;
		case "Laser Rifle":
			this.damageDice = 8;
			this.damageDiceNum = 3;
			this.transferrable = false;
			break;			
		case "Fists":
			this.damageDice = 6;
			this.damageDiceNum = 2;
			this.transferrable = false;
			break;
	}
	this.imageName = itemName.replace("-", "").replace(" ", "").toLowerCase();
}


//===================================================== CHARACTER =============


function CharacterClass (species, zone, x, y) {
    this.species = species;
	this.points = 100;
	this.hp = 100;
	this.maxHp = 100;
    this.zone = zone;
    this.coords = { "x" : x, "y" : y };
    this.speed = 0.5;
	this.imageNum = gameTools.roll1d(2);
	this.overlandImageNameBase = "PC_";
	this.combatForegroundImageNameBase = "MikeBack_";
	this.step = 1;
	this.facing = "DOWN";
	this.weakVsDamageTypes = ["deathray"];
	this.items = [];
	this.equippedItemIndex = 0;
	this.isAggressive = false;
    
    this.move = function (directionWord, doChecks, callback) {
		directionWord = directionWord.toUpperCase();
		// If not facing that direction, then change face first
		if (doChecks && this.facing !== directionWord) {
			// Just turning...
			this.facing = directionWord;
			this.step = 0;
		} else {
			var axis = "x";
			var direction = "0";
			doChecks = (typeof doChecks === 'boolean') ? doChecks : true;
			//console.log(arguments);
			switch(directionWord){
				case "UP": axis = "y"; 
					direction = -1;
					break;
				case "DOWN": axis = "y"; 
					direction = 1;
					break;
				case "LEFT": axis = "x"; 
					direction = -1;
					break;
				case "RIGHT": axis = "x"; 
					direction = 1;
					break;
			}
			this.coords[axis] += (this.speed * direction);
			this.doStep();
			if (doChecks) {
				this.checkZoneBoundaries();
				this.checkObstacles();
				this.heal(gameTools.roll1d(2));
			}
		}
        if (typeof callback === 'function') callback();
        return this;
    }
    this.checkZoneBoundaries = function () {
        var maxCoords = zone.size;
        if (this.coords.x < 0) this.coords.x = 0;
        else if (this.coords.x > maxCoords.x) this.coords.x = maxCoords.x;
        if (this.coords.y < 0) this.coords.y = 0;
        else if (this.coords.y > maxCoords.y) this.coords.y = maxCoords.y;
    }
    this.checkObstacles = function (c) {
        var topLeft = {
            "x" : Math.floor(this.coords.x)
            ,"y" : Math.floor(this.coords.y)
        };
        var bottomRight = {
            "x" : Math.ceil(this.coords.x)
            ,"y" : Math.ceil(this.coords.y)
        };
        var topRight = {
            "x" : bottomRight.x
            ,"y" : topLeft.y
        };
        var bottomLeft = {
            "x" : topLeft.x
            ,"y" : bottomRight.y
        };
        //console.log(topLeft, topRight, bottomRight, bottomLeft);
		
        if (zone.terrain[topLeft.x][topLeft.y].isObstacle) {
            this.move("DOWN", false).move("RIGHT", false);  
        }
        if (zone.terrain[topRight.x][topRight.y].isObstacle) {
            this.move("DOWN", false).move("LEFT", false);  
        }
        if (zone.terrain[bottomLeft.x][bottomLeft.y].isObstacle) {
            this.move("UP", false).move("RIGHT", false);  
        } 
        if (zone.terrain[bottomRight.x][bottomRight.y].isObstacle) {
            this.move("UP", false).move("LEFT", false);  
        }         
    }
	this.doStep = function(){
		this.step = (this.step == 2) ? 1 : 2;
	}
	
	this.hit = function(){
		var hitRoll = gameTools.roll1d(10);
		console.log("hitRoll=", hitRoll);
		var difficulty = 2;
		if (this.isAggressive) {
			difficulty = 4;
		}
		if (hitRoll >= difficulty) {
			return true;
		} else {
			return false;
		}
	}
	this.beAggressive = function() {
		this.isAggressive = true;
	}
	this.calmDown = function() {
		this.isAggressive = false;
	}
	this.getDamage = function() {
		var weapon = this.getEquippedItem();
		var dmg = {
			"amount" : gameTools.roll_d(weapon.damageDiceNum, weapon.damageDice)
			,"type" : weapon.damageType
		};
		if (this.isAggressive) {
			dmg.amount = Math.round(dmg.amount * 1.4); // + 40%
		}
		return dmg;
	}
	this.getDamageType = function() {
		var weapon = this.getEquippedItem();
		return weapon.damageType;
	}
	this.damage = function (dmg) {
		if (dmg.type == this.weakVsDamageTypes[0]) {
			dmg.amount = dmg.amount * 2;
		}
		this.hp -= Math.round(dmg.amount);
		if (this.hp < 0) this.hp = 0;
	}
	this.heal = function (h) {
		this.hp += Math.round(h);
		if (this.hp > this.maxHp) this.hp = this.maxHp;
	}
	this.healHalf = function () {
		var h = (this.maxHp - this.hp)/2;
		this.heal(h);
	}
	this.isDead = function(){
		return (this.hp <= 0);
	}
	this.addPoints = function(p){
		this.points += p;
	}
	this.subtractAllPoints = function(){
		this.points = 0;
	}
	
	//======== Items/Equip
	this.giveItem = function(itemName){
		var item = new ItemClass(itemName);
		this.items.push(item);
		return true;
	}
	this.equipItem = function(itemId){
		if (typeof itemId === 'number') {
			if (itemId < 0 || itemId > (this.items.length - 1)) {
				return false;
			} else {
				this.equippedItemIndex = itemId;
				return true;
			}
		} else {
			// *** if string, search and find...
			// *** 
			this.equipItem(x);
			return false;
		}
	}
	this.cycleEquippedItem = function(dir){
		var itemIndex = this.equippedItemIndex + dir;
		var b = (this.items.length);
		itemIndex = itemIndex % b;
		if (itemIndex < 0) itemIndex += b;
		console.log(this.equippedItemIndex, dir, itemIndex, b);
		this.equipItem(itemIndex);
		return this.getEquippedItem();
	}
	this.getEquippedItem = function() {
		return this.items[this.equippedItemIndex];
	}
	
	//======== Images
	this.getOverlandImageName = function(){
		return this.overlandImageNameBase + this.facing.toLowerCase() + this.step;
	}
	this.getForegroundImageName = function() {
		return (this.species + "_fore_" + this.getEquippedItem().imageName);
	}
	this.getBackgroundImageName = function() {
		return (this.species + this.imageNum);
	}
	
	//======== Construction
	var speciesData = {
		"human" : {
			"maxHp" 		: 100
			,"damageDice" 	: 20
			,"damageDiceNum" : 3
			,"weakVsDamageTypes" : ["deathray"]
			,"startingItemName" : "Fists"
		}
		,"bugorian" : {
			"maxHp" 		: 120
			,"damageDice" 	: 20
			,"damageDiceNum" : 3
			,"weakVsDamageTypes" : ["deathray"]
			,"startingItemName" : "Laser Rifle"
		}
		,"extermobot" : {
			"maxHp" 		: 100
			,"damageDice" 	: 10
			,"damageDiceNum" : 3
			,"weakVsDamageTypes" : ["static"]
			,"startingItemName" : "Extermo-Laser"
		}
		,"rhibble" : {
			"maxHp" 		: 60
			,"damageDice" 	: 6
			,"damageDiceNum" : 3
			,"weakVsDamageTypes" : ["laser"]
			,"startingItemName" : "Bite"
		}
	};
	var myData = speciesData[this.species.toLowerCase()];
	if (typeof myData === 'object') {
		this.maxHp = myData.maxHp;
		this.damageDice = myData.damageDice;
		this.damageDiceNum = myData.damageDiceNum;
		this.hp = this.maxHp;
		this.weakVsDamageTypes = myData.weakVsDamageTypes;
		this.giveItem(myData.startingItemName);
	} else {
		console.error("Unknown species");
	}
}



//===================================================== MAP ===================

function MapClass (towerNum) {
    this.size = { "x" : 50, "y" : 50 };
    this.terrain = [];
	this.towerNum = towerNum;
	
    this.generateRandom = function(deadZoneX, deadZoneY){
        var x, y, i, t, ob;
        for (y = 0; y < this.size.y; y++) {
            for (x = 0; x <= this.size.x; x++) {
                t = this.terrain[x][y] = {
                    "type" : "grass"
                    //,"fillStyle" : "rgb(100," + (gameTools.roll1d(155) + 100) + ",200)"
					,"imageName" : "grass"
                    ,"isObstacle" : false
                };
				t.imageName = "grass" + gameTools.roll1d(5);
				
				if (this.getDistance(x, y, deadZoneX, deadZoneY) > 4) {
					var obstacleRoll = gameTools.roll1d(20);
					if (obstacleRoll <= 10) {
						t.isObstacle = true;
						t.obstacle = {
							"type" : "tree"
							,"imageName" : "tree" + gameTools.roll1d(4)
							,"hp" : 2
							,"isStructure" : false
						}
					} else if (obstacleRoll == 11) {
						t.isObstacle = true;
						t.obstacle = {
							"type" : "rock"
							,"imageName" : "rock" + gameTools.roll1d(3)
							,"hp" : 5
							,"isStructure" : false
						}
					} else if (obstacleRoll == 12) {
						t.isObstacle = false;
						t.obstacle = {
							"type" : "weeds"
							,"imageName" : "weeds" + gameTools.roll1d(3)
							,"hp" : 1
							,"isStructure" : false
						}					
					} else {
						// Non-obstacle
					}
				}				
            }
        }

		// Generate towers
		var towersLeft = this.towerNum;
		var madeTower = false;
		while (towersLeft > 0) {
			x = gameTools.roll1d(this.size.x) - 1;
			y = gameTools.roll1d((this.size.y - 1));
			// ^ can't have zero y because tower is two blocks tall
			if (this.getDistance(x, y, deadZoneX, deadZoneY) > 3) {
				madeTower = this.makeTower(x, y);
				if (madeTower) { towersLeft -= 1; }
			}
		}
    }
	this.makeTower = function(x, y) {
		var block1 = this.terrain[x][y];
		var block2 = this.terrain[x][y-1];
		if (!block1.isStructure && !block2.isStructure) {
			block1.isObstacle = true;
			block1.obstacle = {
				"type" : "tower"
				,"imageName" : "tower_bottom" + gameTools.roll1d(2)
				,"hp" : 10
				,"isStructure" : true
			};
			block2.isObstacle = true;
			block2.obstacle = {
				"type" : "antennae"
				,"imageName" : "tower_top" + gameTools.roll1d(2)
				,"hp" : 10
				,"isStructure" : true
			};
			return true;
		} else {
			return false;
		}
	}
	
	this.getDistance = function (x1, y1, x2, y2) {
		return (Math.sqrt( Math.pow((x1 - x2),2) + Math.pow((y1 - y2),2) ));
	}
	this.getBlock = function(x,y){
		if (typeof x === 'object') {
			var coords = x;
			x = coords.x;
			y = coords.y;
		}
		x = Math.round(x);
		y = Math.round(y);
		return (this.terrain[x][y]);
	}
	this.isBlockObstacle = function(block){
		return (typeof block.obstacle === 'object' 
			&& typeof block.obstacle.imageName === 'string');
	}
	this.removeBlockObstacle = function(block){
		delete block.obstacle;
		block.isObstacle = false;
	}
	this.chopTerrain = function(targetCoords, dmg) {
		var block = this.getBlock(targetCoords);
		if (this.isBlockObstacle(block)) {
			console.log(block);
			block.obstacle.hp -= dmg;
			if (block.obstacle.hp <= 0) {
				block.imageName = "dirt" + gameTools.roll1d(2);
				if (block.obstacle.type == "tower") {
					// Transform the tower into a wreck
					block.obstacle.type = "wreck";
					block.obstacle.imageName = "tower_wreck";
					block.obstacle.hp = 3;
					// Remove the antennae
					var antennaeBlock = this.getBlock(targetCoords.x, (targetCoords.y - 1));
					if (antennaeBlock.obstacle.type == "antennae") {
						this.removeBlockObstacle(antennaeBlock);
					}
				} else {
					this.removeBlockObstacle(block);
				}
			}
			return true;
		}
		return false;
	}
	this.explodeTerrain = function(coords) {
		//console.log("Explode terrain @", coords);
		var block = this.getBlock(coords);
		this.chopTerrain(coords, 100);
		// *** Do 2 damage to all surrounding squares
	}
	this.clearTerrain = function(x,y, burst) {
		var block = this.getBlock(x,y);
		this.removeBlockObstacle(block);
		if (burst) {
			this.clearTerrain(x-1, y-1, false);
			this.clearTerrain(x+0, y-1, false);
			this.clearTerrain(x+1, y-1, false);
			this.clearTerrain(x-1, y, false);
			this.clearTerrain(x+1, y, false);
			this.clearTerrain(x-1, y+1, false);
			this.clearTerrain(x+0, y+1, false);
			this.clearTerrain(x+1, y+1, false);
		}
	}
    this.clearAllTerrain = function () {
        var x, y;
        for (x = 0; x <= this.size.x; x++) {
            this.terrain[x] = [];
            for (y = 0; y <= this.size.y; y++) {
                this.terrain[x][y] = {};
            }
        }        
    }
    this.init = function () {
        this.clearAllTerrain();
    }
    this.init();
}

