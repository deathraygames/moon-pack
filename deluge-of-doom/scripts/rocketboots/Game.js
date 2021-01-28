(function(){
	const component = {
		fileName: 		"Game",
		classes:		{"Game": Game},
		requirements:	[],
		description:	"Game Class for RocketBoots",
		credits:		"By Luke Nickerson, 2016, 2017"
	};

	function Game (options) {
		if (typeof options === "string") {
			options = {name: options};
		} else {
			options = options || {};
		}
		this.name = options.name || "Game made with RocketBoots";
		this.version = options.version || "";
		
		this.init(options);
	}
	component.Game = Game;

	Game.prototype.init = init;
	Game.prototype.instantiateComponents = instantiateComponents;
	Game.prototype.addComponent = addComponent;
	Game.prototype._setupStates = _setupStates;
	Game.prototype._addStages = _addStages;

	// Install into RocketBoots if it exists otherwise put the classes on the global window object
	if (RocketBoots) {
		RocketBoots.installComponent(component);
	} else if (window) {
		for (let className in component.classes) {
			window[className] = component.classes[className];
		}
	}

	return;

	//============================================ Hoisted Game Functions ======

	function init(options) {
		//console.log("Initializing Game");
		var g = this;
		var defaultComponents = [{"state": "StateMachine"}];
		var useDefaultComponents = true;
		if (typeof options.defaultComponents !== "undefined") {
			useDefaultComponents = options.defaultComponents ? true : false;
			if (options.defaultComponents instanceof Array) {
				defaultComponents = options.defaultComponents;	
			}
		}
		if (useDefaultComponents) {
			g.instantiateComponents(defaultComponents);
		}
		if (typeof options.instantiateComponents === "object") {
			g.instantiateComponents(options.instantiateComponents);
		}
		g._addStages(options);
		g._setupStates();
		return this;
	}

	// `components` should be an array of objects with one or two properties,
	// like: {"loop": "Loop", "options": { ...etc... }}
	// One property can be "options", while the other is a key-value pair for
	// the component's new property name and the associated component class.
	function instantiateComponents(components) {
		var g = this;
		components.forEach(function(component){
			var options = undefined;
			var key;
			var compClass;
			if (typeof component.options !== "undefined") {
				options = component.options;
				delete component.options;
			}
			for (key in component) {
				compClass = component[key];
				//console.log("Instantiating component class", compClass, "as", key, "with options", options);
				g.addComponent(key, compClass, options);
			}
		});
		return g;
	}

	function addComponent(gameCompName, componentClass, arg) {
		var g = this;
		if (RocketBoots.hasComponent(componentClass)) {
			//console.log("RB adding component", gameCompName, "to the game using class", componentClass, "and arguments:", arg);
			g[gameCompName] = new RocketBoots[componentClass](arg);
		} else {
			console.warn(componentClass, "not found as a RocketBoots component");
		}
		return g;
	}

	// TODO: Smart default configuration
	function _setupStates() {
		var g = this;
		// Setup default states (mostly menu controls)
		/*
		var startMenu = function(){ 
			//$('header, footer').show();
		};
		var endMenu = function(){
			//$('header, footer').hide();
		}
		*/
		if (!g.state.hasState("boot")) {
			g.state.addState({
				name: "boot",
				autoView: true
			});
		}
		if (!g.state.hasState("preload")) {
			g.state.addState({
				name: "preload",
				autoView: true
			});
		}
		if (!g.state.hasState("game")) {
			g.state.addState({
				name: "game"
			});
		}

		/*
		g.state.addStates({
			"boot": { 		autoView: true },
			"preload": { 	autoView: true },
			"mainmenu": { 	autoView: true, start: startMenu, end: endMenu },
			"new": { 		autoView: true, start: startMenu, end: endMenu },
			"save": { 		autoView: true, start: startMenu, end: endMenu },
			"load": { 		autoView: true, start: startMenu, end: endMenu },
			"help": { 		autoView: true, start: startMenu, end: endMenu },
			"settings": { 	autoView: true, start: startMenu, end: endMenu },
			"credits": { 	autoView: true, start: startMenu, end: endMenu },
			"share": { 		autoView: true, start: startMenu, end: endMenu },	
			"game": {}
		});
		*/
		/*
		g.state.add("game",{
			start : function(){
				$('header, footer').hide();
				this.$view.show();
			}, end : function(){
				$('header, footer').show();
				this.$view.hide();
			}
		});
		*/
		
		//g.state.get("game").$view.show();

		g.state._setupTransitionLinks();
		g.state.start("boot");
		return g;
	}

	// TODO: Refactor this; remove jQuery dependency
	function _addStages(options) {
		var g = this;
		var stageData;
		if (typeof RocketBoots.Stage !== "function") {
			return g;
		}
		if (typeof options.stages === 'object') {
			stageData = options.stages;
		} else if (typeof options.stage === 'object') {
			stageData = [options.stage];
		} else {
			return g;
		}
		if (stageData.length > 0) {
			g.stages = g.stages || [];
			$.each(stageData, function(i, stageOptions){
				g.stages[i] = new RocketBoots.Stage(stageOptions);
				if (typeof stageOptions.layerNames === 'object') {
					$.each(stageOptions.layerNames, function(x, layerName){
						g.stages[i].addLayer(layerName);
					});
				}
				g.stages[i].resize();
			});
			g.stage = g.stages[0];
		}
		return g;
	}

})();