(function(){


const partTypes = {
	"core": {
		name: "Starship Core",
		icon: "border_outer",
		cost: null, // not for sale
		energyGain: 1.5,
		energyUse: 0.1,
		gridSize: {x: 2, y: 2},
		energyMax: 30,
		animations: 4,
		onDefault: false
	},
	"structure-E": {
		name: "Structure Block I",
		icon: "border_all",
		cost: 8,
		energyMax: 5
	},
	"structure-D": {
		name: "Structure Block II",
		icon: "border_all",
		cost: 16,
		energyMax: 10
	},
	"corner-1": {
		name: "Corner Structure (1)",
		icon: "network_cell",
		cost: 4,
		energyMax: 5
	},
	"corner-2": {
		name: "Corner Structure (2)",
		icon: "network_cell",
		cost: 4,
		energyMax: 5
	},
	"corner-3": {
		name: "Corner Structure (3)",
		icon: "network_cell",
		cost: 4,
		energyMax: 5
	},
	"corner-4": {
		name: "Corner Structure (4)",
		icon: "network_cell",
		cost: 4,
		energyMax: 5
	},
	"battery-E": {
		name: "Battery Class-E",
		icon: "battery_charging_full",
		cost: 20,
		action: "toggle",
		energyMax: 50
	},
	"battery-D": {
		name: "Battery Class-D",
		icon: "battery_charging_full",
		cost: 150,
		action: "toggle",
		energyMax: 400
	},
	"solar-panels-E": {
		name: "Solar Panels E",
		icon: "flash_on",
		cost: 20,
		action: "toggle",
		energyGain: 5,
		energyMax: 5
	},
	"solar-panels-D": {
		name: "Solar Panels D",
		icon: "flash_on",
		cost: 80,
		action: "toggle",
		energyGain: 25,
		energyMax: 25
	},
	"cargo-space-E": {
		name: "Small Cargo Space",
		icon: "archive",
		cost: 10,
		storageMax: 10,
		energyMax: 5
	},
	"miner-E": {
		name: "Miner-Drones E",
		icon: "terrain",
		cost: 20,
		action: "toggle",
		oreGain: 1,
		energyUse: 10,
		energyMax: 10
	},
	"miner-D": {
		name: "Miner-Drones D",
		icon: "terrain",
		cost: 300,
		action: "toggle",
		oreGain: 5,
		energyUse: 40,
		energyMax: 80
	},
	"telescope-E": {
		name: "Telescope Class-E",
		icon: "scanner",
		cost: 12,
		action: "toggle",
		scanPower: 0.5,
		energyUse: 1,
		energyMax: 10
	},
	"telescope-D": {
		name: "Telescope Class-D",
		icon: "scanner",
		cost: 120,
		action: "toggle",
		scanPower: 4,
		energyUse: 6,
		energyMax: 24
	},
	"engine-E": {
		name: "Engine Class-E",
		icon: "brightness_low",
		cost: 20,
		action: "toggle",
		speed: 1,
		energyUse: 5,
		energyMax: 5
	},
	"engine-D": {
		name: "Engine Class-D",
		icon: "brightness_low",
		cost: 200,
		action: "toggle",
		speed: 8,
		energyUse: 30,
		energyMax: 30
	}
};

const defaultPartType = {
	action: null,
	cost: 1,
	scanPower: null,
	energyUse: null,
	energyGain: null,
	energyMax: null,
	oreGain: null,
	speed: null,
	storageMax: null,
	gridSize: {x: 1, y: 1}
};

_.each(partTypes, function(partType, partTypeKey){
	_.defaults(partType, defaultPartType);
	partType.key = partTypeKey;
	partType.imageNames = {
		"on": [partTypeKey + "-on"],
		"off": [partTypeKey + "-off"]
	};
	for (var i = 0; i < partType.animations; i++) {
		partType.imageNames.on.push(partTypeKey + "-on-" + i);
	}
	partType.images = { // These will be loaded during setup
		"on": [null],
		"off": [null]
	}
});

// Expose

window.data = {
	partTypes: partTypes
};

})();