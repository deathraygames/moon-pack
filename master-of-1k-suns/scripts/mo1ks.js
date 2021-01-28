RocketBoots.loadComponents([
	"Coords", // Requirements don't work perfect yet, so need to bring this in
	"StateMachine",
	"Dice",
	"Loop",
	"Incrementer",
	"World"
])
/* .loadCustomComponents([
	"Node"
])*/.ready(function(rb){

////===== Constants

	var MAX_SYSTEMS 					= 1000, // it's the name of the game
		SYSTEMS_DISCOVERED_START		= 1,

		SCOUT_SHIPS_PER_SYSTEM 			= 42,
		COLONIAL_SHIPS_PER_SYSTEM 		= 20,
		CONSTRUCTOR_FLEET_PER_SYSTEM 	= 8,
		BATTLE_SHIPS_PER_SYSTEM 		= 20,
		RESOURCE_COLLECTORS_PER_SYSTEM 	= 40,
		READY_RATE_MULTIPIER			= 0.09,
		RESOURCE_MAX_PER_SYSTEM	 		= 200,
		RESOURCE_MAX_PER_COLLECTOR		= 50,

		BASE_CONSTRUCTION_PER_CONSTRUCTOR 		= 0.05,
		SCOUT_SHIP_MADE_PER_CONSTRUCTOR 		= BASE_CONSTRUCTION_PER_CONSTRUCTOR,
		COLONIAL_SHIP_MADE_PER_CONSTRUCTOR 		= BASE_CONSTRUCTION_PER_CONSTRUCTOR,
		CONSTRUCTOR_SHIP_MADE_PER_CONSTRUCTOR 	= BASE_CONSTRUCTION_PER_CONSTRUCTOR/2, // has to do split duty for exploit
		BATTLE_SHIP_MADE_PER_CONSTRUCTOR 		= BASE_CONSTRUCTION_PER_CONSTRUCTOR,
		COLLECTOR_MADE_PER_CONSTRUCTOR 			= BASE_CONSTRUCTION_PER_CONSTRUCTOR/2, // has to do split duty for exploit

		EXPLORATION_PER_SCOUT_SHIP 		= 1,
		COLONIZATION_PER_COLONIAL_SHIP 	= 1,

		RESOURCES_PER_COLLECTOR 		= 1,

		RESOURCE_COST_PER_SCOUT_SHIP 	= 2,
		RESOURCE_COST_PER_COLONIAL_SHIP = 100,
		RESOURCE_COST_PER_CONSTRUCTOR 	= 12,
		RESOURCE_COST_PER_BATTLE_SHIP 	= 100,
		RESOURCE_COST_PER_COLLECTOR 	= 30,

		CHANCE_OF_RIVAL = 50,

		X_SELECTIONS = ["game", "explore", "expand", "exploit", "exterminate"],
		EXPLORE = 1,
		EXPAND = 2,
		EXPLOIT = 3,
		EXTERMINATE = 4
		;


////===== Game, Loop, States

	window.g = new RocketBoots.Game({
		name: "Master of 1k Suns",
		instantiateComponents: [
			//{"state": "StateMachine"},
			{"loop": "Loop"},
			{"dice": "Dice"},
			{"incrementer": "Incrementer"}
		]
	});

	g.loop.set(function(){
		g.incrementer.incrementByElapsedTime(undefined, true);
		//g.world.draw();
		g.incrementer.calculate();
		g.checkRivals();
		g.setSuns();
	}, 200);

	g.state.addStates({
		"start": {

		},
		"game": {
			viewName: "game",
			start: function(){
				g.loop.start();
			},
			end: function(){
				g.loop.stop();
			}
		},
		"pause": {

		}
	});

////===== Game Functions

	g.xSelectedIndex = 0;
	g.lastSystemsDiscovered = SYSTEMS_DISCOVERED_START;

	var getShipBuildRate = function (c, thisCurrency, constructors, SELECTION, COST, MADE_PER_CONSTRUCTOR) {
		if (g.xSelectedIndex !== SELECTION || thisCurrency.val >= thisCurrency.max || c.resources.val < 1) { 
			return 0; 
		}
		if (c.resources.val < COST) {
			return ((constructors.floor * MADE_PER_CONSTRUCTOR) / 10);
		}
		return (constructors.floor * MADE_PER_CONSTRUCTOR);
	};

	var getConstructionRate = function (c, thisCurrency, SELECTION) {
		if (g.xSelectedIndex !== SELECTION) { 
			if (thisCurrency.val == 0) { 
				return 0;
			} else {
				return -1; 
			}
		} else {
			if (thisCurrency.val < thisCurrency.max) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	g.checkRivals = function () {
		var c = this.incrementer.currencies;
		var diff = c.systemsDiscovered.floor - this.lastSystemsDiscovered;
		if (diff >= 1) {
			this.lastSystemsDiscovered = c.systemsDiscovered.floor;
			while (diff > 0) {
				if (g.dice.roll1d(100) <= CHANCE_OF_RIVAL) {
					c.systemsRival.max += 1;
					c.systemsRival.add(1);
				}
				diff -= 1;
			}
			return true;
		} else {
			return false;
		}
	}
	

	g.incrementer.addCurrencies([

		// EXPLORE
		{
			name: "systemsDiscovered",
			displayName: "Systems Discovered",
			val: SYSTEMS_DISCOVERED_START,
			min: 0, 
			max: MAX_SYSTEMS,
			tip: "Create scout ships and explore to find more systems.",
			calcRate: function(c){
				if (g.xSelectedIndex !== EXPLORE) { return 0; }
				return c.explorationRate.floor * (0.01 / c.systemsDiscovered.floor);
			}
		},{
			name: "explorationRate",
			displayName: "Exploration Rate",
			tip: "# of ships exploring",
			calcRate: function(c){
				var direction = (g.xSelectedIndex === EXPLORE) ? 1 : -1;
				return (direction * c.scoutShips.floor * READY_RATE_MULTIPIER);
			},
			calcMax: function(c){
				//if (g.xSelectedIndex !== EXPLORE) { return 0; }
				return Math.floor(c.scoutShips.val) * EXPLORATION_PER_SCOUT_SHIP;
			}
		},{
			name: "scoutShips",
			displayName: "Scout Ships",
			val: 0,
			rate: 0,
			min: 0, max: 0,
			tip: "Cost: " + RESOURCE_COST_PER_SCOUT_SHIP + " resources",
			calcRate: function(c){
				return getShipBuildRate(c, this, c.scoutShipConstruction, EXPLORE, RESOURCE_COST_PER_SCOUT_SHIP, SCOUT_SHIP_MADE_PER_CONSTRUCTOR);
			},
			calcMax: function(c){
				return Math.floor(c.systemsSettled.val) * SCOUT_SHIPS_PER_SYSTEM;
			}
		},{
			name: "scoutShipConstruction",
			displayName: "Scout Ship Construction",
			tip: "Constructor fleets dedicated to scout ship building",
			calcRate: function(c){
				return getConstructionRate(c, this, EXPLORE);
			},
			calcMax: function(c){
				return c.constructorFleet.val;
			}
		},


		// EXPAND
		{
			name: "systemsSettled",
			displayName: "Systems Settled",
			val: 1,
			rate: 0,
			min: 0, max: MAX_SYSTEMS,
			tip: "Explore to find more systems &amp; use colonial ships to settle",
			calcRate: function(c){
				if (g.xSelectedIndex !== EXPAND) { return 0; }
				return c.colonizationRate.floor *  (0.01 / c.systemsSettled.floor);
			},
			calcMax: function(c){
				return c.systemsDiscovered.floor - Math.ceil(c.systemsRival.val);
			}
		},{
			name: "colonizationRate",
			displayName: "Colonization Rate",
			tip: "# of ships colonizing",
			calcRate: function(c){
				var direction = (g.xSelectedIndex === EXPAND) ? 1 : -1;
				return (direction * c.colonialShips.floor * READY_RATE_MULTIPIER);				
			},
			calcMax: function(c){
				//if (g.xSelectedIndex !== EXPAND) { return 0; }
				return (c.colonialShips.floor * COLONIZATION_PER_COLONIAL_SHIP);
			}
		},{
			name: "colonialShips",
			displayName: "Colonial Ships",
			val: 0,
			rate: 0,
			min: 0, max: 0,
			tip: "Cost: " + RESOURCE_COST_PER_COLONIAL_SHIP + " resources",
			calcRate: function(c){
				return getShipBuildRate(c, this, c.colonialShipConstruction, EXPAND, RESOURCE_COST_PER_COLONIAL_SHIP, COLONIAL_SHIP_MADE_PER_CONSTRUCTOR);
			},

			calcMax: function(c){
				return Math.floor(c.systemsSettled.val) * COLONIAL_SHIPS_PER_SYSTEM;
			}
		},{
			name: "colonialShipConstruction",
			displayName: "Colonial Ship Construction",
			tip: "Constructor fleets dedicated to colonial ship building",
			calcRate: function(c){
				return getConstructionRate(c, this, EXPAND);
			},
			calcMax: function(c){
				return c.constructorFleet.val;
			}
		},


		// EXPLOIT
		{
			name: "resources",
			displayName: "",
			val: 0, 
			tip: "Based on collectors and current ship construction",
			calcRate: function(c){
				// *** incorporate amount being used for building
				return (
					RESOURCES_PER_COLLECTOR * Math.floor(c.resourceCollectors.val)
					- (RESOURCE_COST_PER_SCOUT_SHIP * c.scoutShips.rate)
					- (RESOURCE_COST_PER_COLONIAL_SHIP * c.colonialShips.rate)
					- (RESOURCE_COST_PER_COLLECTOR * c.resourceCollectors.rate)
					- (RESOURCE_COST_PER_CONSTRUCTOR * c.constructorFleet.rate)
					- (RESOURCE_COST_PER_BATTLE_SHIP * c.battleShips.rate)
				);
			},
			calcMax: function(c){
				return (c.systemsSettled.floor * RESOURCE_MAX_PER_SYSTEM) 
					+ (c.resourceCollectors.floor * RESOURCE_MAX_PER_COLLECTOR);
			}
		},{
			name: "resourceCollectors",
			displayName: "Resource Collectors",
			val: 1,
			tip: "Automatically collect resources, even when focused elsewhere; cost: " + RESOURCE_COST_PER_COLLECTOR,
			calcRate: function(c){
				return getShipBuildRate(c, this, c.constructorFleetConstruction, EXPLOIT, RESOURCE_COST_PER_COLLECTOR, COLLECTOR_MADE_PER_CONSTRUCTOR);
			},
			calcMax: function(c){
				return c.systemsSettled.floor * RESOURCE_COLLECTORS_PER_SYSTEM;
			}
		},{
			name: "constructorFleet",
			displayName: "Constructor Fleet",
			val: 1,
			tip: "These ships help build other ships, including themselves; cost: " + RESOURCE_COST_PER_CONSTRUCTOR,
			calcRate: function(c){
				return getShipBuildRate(c, this, c.constructorFleetConstruction, EXPLOIT, RESOURCE_COST_PER_CONSTRUCTOR, CONSTRUCTOR_SHIP_MADE_PER_CONSTRUCTOR);
			},
			calcMax: function(c){
				return (c.systemsSettled.floor * CONSTRUCTOR_FLEET_PER_SYSTEM);
			}
		},{
			name: "constructorFleetConstruction",
			displayName: "Constructor Ship Construction",
			tip: "# of constructors building more constructors",
			calcRate: function(c){
				return getConstructionRate(c, this, EXPLOIT);
			},
			calcMax: function(c){
				return c.constructorFleet.floor;
			}
		},

		// EXTERMINATE
		{
			name: "systemsRival",
			displayName: "",
			val: 0, 
			max: 0,
			tip: "# of rival systems discovered that are unconquered",
			calcRate: function(c){
				var rate = 0.01 * this.val; // base regrow rate
				if (g.xSelectedIndex === EXTERMINATE) {
					rate += (c.warRate.floor * (-0.01));
				}
				return rate;
			}
		},{
			name: "warRate",
			displayName: "",
			val: 0, 
			tip: "More battle ships lead to faster conquering",
			calcRate: function(c){
				var direction = (g.xSelectedIndex === EXTERMINATE) ? 1 : -1;
				return (direction * c.battleShips.floor * READY_RATE_MULTIPIER);
			},
			calcMax: function (c){
				return c.battleShips.floor;
			}
		},{
			name: "battleShips",
			displayName: "",
			val: 0, 
			tip: "Cost: " + RESOURCE_COST_PER_BATTLE_SHIP + " resources",
			calcRate: function(c){
				return getShipBuildRate(c, this, c.battleShipConstruction, EXTERMINATE, RESOURCE_COST_PER_BATTLE_SHIP, BATTLE_SHIP_MADE_PER_CONSTRUCTOR);
			},
			calcMax: function (c){
				return (c.systemsSettled.floor * BATTLE_SHIPS_PER_SYSTEM);
			}
		},{
			name: "battleShipConstruction",
			displayName: "",
			val: 0, 
			tip: "Constructor fleets dedicated to battle ship building",
			calcRate: function(c){
				return getConstructionRate(c, this, EXTERMINATE);
			},
			calcMax: function (c){
				return c.constructorFleet.floor;
			}
		}
	]);


////===== User Interface

	var $tabs = $('div.tabs > div');
	var $navTabsContainer = $('nav.tabs');
	var $navTabs = $navTabsContainer.find('a');
	var $suns = $('.suns');

	g.selectTab = function (goTo, $clicked) {
		var $selected = $tabs.filter('.' + goTo);
		var $selectedNav = $clicked;
		$tabs.not($selected).add($navTabs).not($selectedNav).removeClass("selected");
		$selected.add($selectedNav).addClass("selected");
		this.xSelectedIndex = X_SELECTIONS.indexOf(goTo);
	};
	g.setupTabs = function() {
		var o = this;
		$navTabsContainer.off("click").on("click", "a", function(e){
			var $clicked = $(e.target);
			var goTo = $clicked.data("goto");
			o.selectTab(goTo, $clicked);
		});
		return this;
	};
	
	g.setSuns = function () {
		var systems = Math.floor(g.incrementer.currencies.systemsSettled.val);
		if (systems == MAX_SYSTEMS) {
			$suns.html('');
		} else {
			var systemsString = "" + systems;
			var zeroHeadingSuns = "000".substr(0, 4 - systemsString.length) + systemsString + "/";
			$suns.html(zeroHeadingSuns);
		}
	};

	g.setupOptions = function(){
		var o = this;
		$('.toggleShowAll').off("click").click(function(e){
			o.toggleShowAll();
		});
		return this;
	};
	g.toggleShowAll = function(){
		$('body').toggleClass("showAll");
		return this;
	};



	//g.state.transition("start");
	g.state.transition("game");
	g.setupTabs().setupOptions().selectTab("game");
});