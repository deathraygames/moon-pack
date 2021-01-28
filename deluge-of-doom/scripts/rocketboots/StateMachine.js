(function(){
	const component = {
		fileName: 		"StateMachine",
		classes:		{"StateMachine": StateMachine, "State": State},
		requirements:	[],
		description:	"State machine; requires jQuery ($)",
		credits:		"By Luke Nickerson, 2014, 2017"
	};

	function StateMachine(options) {
		if (typeof options !== 'object') { options = {}; }
		this.states = {};
		this.currentState = null;
		this.history = [];
		this._mainElementSelector = 'body';
		this._mainElementClassPrefix = 'state-';
		this._mainElementClassSuffix = '';
		this._pruneHistoryAt = 200;
		this._pruneHistoryTo = 100;
		// Alias
		Object.defineProperty(this, "current", { 
			get: function(){ return this.currentState; }, 
			set: function(x){ this.currentState = x; } 
		});
		if (options.states) {
			this.addStates(options.states);
		}
	}
	component.StateMachine = StateMachine;
	StateMachine.prototype.get 			= getStateByName;
	StateMachine.prototype.add 			= addState; // alias
	StateMachine.prototype.addState		= addState;
	StateMachine.prototype.addStates 	= addStates;
	StateMachine.prototype.hasState		= hasState;
	StateMachine.prototype.transition 	= transition;
	StateMachine.prototype.back 		= back;
	StateMachine.prototype.start 		= start;
	StateMachine.prototype._getStateFromElement 	= _getStateFromElement;
	StateMachine.prototype._setupTransitionLinks 	= _setupTransitionLinks;
	StateMachine.prototype.State = State;
	
	function State(name, options) {
		this.name	= name;
		this.viewName = options.viewName || name;
		this.$view	= $('.state.'+ this.viewName);
		this.start 	= null;
		this.end 	= null;
		this.update	= null;
		this.type 	= options.type || null;
		this.autoView = options.autoView || true;
		// Init
		this.setStart(options.start);
		this.setEnd(options.end);
		this.setUpdate(options.update);
	}
	component.State = State;
	State.prototype.setStart 	= setStart;
	State.prototype.setEnd 		= setEnd;
	State.prototype.setUpdate 	= setUpdate;
	State.prototype.getType 	= getType;

	// Install into RocketBoots if it exists otherwise put the classes on the global window object
	if (RocketBoots) {
		RocketBoots.installComponent(component);
	} else if (window) {
		for (let className in component.classes) {
			window[className] = component.classes[className];
		}
	}

	return;

	//================ Hoisted functions for StateMachine class ================

	// Getters
	function getStateByName(name) {
		if (typeof name == "undefined") {
			return this.currentState;
		} else if (typeof this.states[name] == "undefined") {
			console.error("State Machine: No such state " + name);
			return false;
		} else {
			return this.states[name];
		}
	}

	function addState(options){
		var name;
		if (typeof options === "string") {
			name = options;
			options = {};
		} else if (typeof options === "object") {
			name = options.name;
		}
		this.states[name] = new this.State(name, options);
		return this;
	}

	function addStates(obj) {
		var sm = this;
		$.each(obj, function(stateName, stateOptions){
			stateOptions.name = stateName;
			sm.add(stateOptions);
		});
		return sm;
	}

	function hasState(name) {
		return (typeof this.states[name] === "undefined") ? false : true;
	}

	function transition(newState, recordHistory) {
		var oldStateName = this.currentState.name;
		recordHistory = (typeof recordHistory === 'boolean') ? recordHistory : true;
		console.log("State Machine: Transition from " + oldStateName + " to " + newState, (recordHistory ? "": "(no history)"));
		this.currentState.end();
		this.currentState = this.get(newState);
		if (recordHistory) {
			this.history.push(newState);
			if (this.history.length > this._pruneHistoryAt) {
				this.history.splice(0, (this._pruneHistoryAt - this._pruneHistoryTo));
			}
		}
		$(this._mainElementSelector)
			.removeClass(this._mainElementClassPrefix + oldStateName + this._mainElementClassSuffix)
			.addClass(this._mainElementClassPrefix + newState + this._mainElementClassSuffix);
		this.currentState.start();
		return this;
	}

	function back() {
		if (this.history.length >= 2) {
			this.history.pop();
			var end = this.history.length - 1;
			this.transition(this.history[end], false);
		}
		return this;
	}

	function start(stateName) {
		$('.state').hide();
		this.currentState = this.get(stateName);
		this.currentState.start();
		return this;
	}

	function _getStateFromElement(elt) {
		var $elt = $(elt);
		var stateName = $elt.data("state");
		if (typeof stateName === 'undefined') {
			stateName = $elt.attr("href");
			if (stateName.substr(0, 1) === '#') {
				stateName = stateName.substr(1);
			}
		}
		return stateName;
	}

	function _setupTransitionLinks() {
		var sm = this;
		// Setup state transition clicks
		$('.goto, .goto-state').click(function(e){
			var stateName = sm._getStateFromElement(this);
			sm.transition(stateName);
		});
		$('.toggle-state').click(function(e){
			var $clicked = $(this);
			var nextStateName = sm._getStateFromElement(this);
			var lastStateName = $clicked.data("last-state");
			if (nextStateName === sm.currentState.name) {
				// TODO: Use `back` function?
				sm.transition(lastStateName);
				$clicked.removeClass("toggled-state-on");
			} else {
				$clicked.data("last-state", sm.currentState.name);
				$clicked.addClass("toggled-state-on");
				sm.transition(nextStateName);
			}
		});
		return sm;
	}


	//================ Hoisted functions for State class =======================
	// Setters
	function setStart(fn) {
		var s = this;
		this.start = function () {
			if (typeof fn == "function") {
				fn.apply(s); // TODO: use call or apply?
			}
			if (s.autoView) {
				s.$view.show(); 
			}
		};
		return s;
	}

	function setEnd(fn) {
		var s = this;
		this.end = function () {
			if (typeof fn == "function") {
				fn.apply(s); // TODO: use call or apply?
			}
			if (s.autoView) {
				s.$view.hide(); 
			}
		};
		return s;		
	}

	function setUpdate(fn) {
		if (typeof fn == "function") this.update = fn;
		else this.update = function(){	};
		return this;
	}

	// Getters
	function getType() {
		return this.type;
	}

})();