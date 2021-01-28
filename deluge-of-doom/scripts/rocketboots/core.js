var RocketBoots = {

	isInitialized : false,
	readyFunctions : [],
	components : {},
	loadedScripts: [],
	version: {
		major: 0, minor: 12, patch: 0, 
		codeName: "stars",
		get full(){
			return this.major.toString() + "." + this.minor.toString() +  "." + this.patch.toString();
		}
	},
	_autoLoadRequirements: true,
	_initTimer : null,
	_MAX_ATTEMPTS : 300,
	_BOOTING_ELEMENT_ID : "booting-up-rocket-boots",
	_: null, // Lodash
	$: null, // jQuery
	jQueryVersion: "3.1.1",
	scriptsPath: "scripts/",
	libsPath: "libs/",
	defaultComponents: [], //["Game"],
	
//==== Classes

	Component: function(c){
		this.fileName = c;
		this.name = null;
		this.classes = {};
		this.description = null;
		this.credits = null;
		this.isLoaded = false;
		this.isInstalled = false;	
	},
	
//==== General Functions
	log: console.log,
	useGitHubScripts: function(){
		this.scriptsPath = "https://rocket-boots.github.io/rocket-boots/scripts/";
		return this;
	},
	loadScript: function(url, callback){
		//console.log("Loading script", url);
		// http://stackoverflow.com/a/7719185/1766230
		var o = this;
		var s = document.createElement('script');
		var r = false;
		var t;
		s.type = 'text/javascript';
		s.src = o.scriptsPath + url + ".js";
		s.className = "rocketboots-script";
		s.onload = s.onreadystatechange = function() {
			//console.log( this.readyState ); //uncomment this line to see which ready states are called.
			if ( !r && (!this.readyState || this.readyState == 'complete') ) {
				r = true;
				o.loadedScripts.push(url);
				if (typeof callback == "function") callback();
			}
		};
		t = document.getElementsByTagName('script')[0];
		t.parentNode.insertBefore(s, t);
		return this;
	},
	getUniqueId: function () {
		return Number(new Date()) + Math.round(Math.random() * 999999);
	},

//==== Component Functions

	hasComponent: function (componentClass) {
		return Boolean(typeof RocketBoots[componentClass] === "function");
	},

	installComponent: function (options, callback, attempt) {
		options = options || {}; // { fileName, classes, requirements, description, credits }
		const classNames = options.classNames || [];
		const classes = options.classes;
		if (classes) {
			for (let className in classes) {
				classNames.push(className);
			}
		}
		const description = options.description || null;
		const credits = options.credits || null;
		const mainClassName = classNames[0];
		const mainComponentClass = options.classes[mainClassName];
		const requirements = options.requirements;
		const fileName = options.fileName || mainClassName;
		var callbacks = [];
		var i;
		// Setup array of callbacks
		if (typeof callback === 'function') { 			callbacks.push(callback); }
		if (typeof options.callback === 'function') { 	callbacks.push(options.callback); }
		if (typeof options.callbacks === 'object') { 	callbacks.concat(options.callbacks); }
		// Check for possible errors
		if (typeof mainClassName !== 'string') {
			console.error("Error installing component: mainClassName is not a string", mainClassName, options);
			console.log("options", options);
			return;
		} else if (!mainComponentClass) {
			console.error("Error installing component: mainComponentClass", mainClassName, "not found", options);
			console.log("options", options);
			return;
		}
		if (!fileName) {
			console.error("No fileName for component.");
		}
		
		//console.log("Installing", fileName, " ...Are required components", requirements, " loaded?", o.areComponentsLoaded(requirements));
		if (!this.areComponentsLoaded(requirements)) {
			var tryAgainDelay, compTimer;

			if (typeof attempt === "undefined") { 
				attempt = 1; 
			} else if (attempt > this._MAX_ATTEMPTS) {
				console.error("Could not initialize RocketBoots: too many attempts");
				return false;
			} else {
				attempt++;
			}

			if (this._autoLoadRequirements) {
				console.log(fileName, "requires component(s)", requirements, " which aren't loaded. Autoloading...");
				this.loadComponents(requirements);
				tryAgainDelay = 100 * attempt;
			} else {
				console.warn(fileName, "requires component(s)", requirements, " which aren't loaded.");
				tryAgainDelay = 5000;
			}
			compTimer = window.setTimeout(() => {
				this.installComponent(options, callback, attempt);
			}, tryAgainDelay);

		} else {
			if (this.components[fileName] === undefined) {
				this.components[fileName] = new this.Component(fileName);
			}
			/*
			for (i = 0; i < callbacks.length; i++) {
				if (typeof callbacks[i] === "function") {
					callbacks[i]();
				}
			}
			*/
			this.components[fileName].name = mainClassName;
			this.components[fileName].isInstalled = true;
			this.components[fileName].callbacks = callbacks;
			this.components[fileName].classes = classes;
			this.components[fileName].description = description;
			this.components[fileName].credits = credits;
			for (let className in classes) {
				this[className] = classes[className];
			}
		}
		return this;
	},
	getComponentByName: function (componentName) {
		for (let cKey in this.components) {
			if (this.components[cKey].name == componentName) {
				return this.components[cKey];
			}
		};
		return;
	},
	areComponentsLoaded: function (componentNameArr) {
		var o = this, areLoaded = true;
		if (typeof componentNameArr !== 'object') {
			return areLoaded;
		}
		for (var i = 0; i < componentNameArr.length; i++) {
			if (!o.isComponentInstalled(componentNameArr[i])) { areLoaded = false; }
		};
		return areLoaded;
	},
	isComponentInstalled: function (componentName) {
		var comp = this.getComponentByName(componentName);
		return (comp && comp.isInstalled);
	},
	loadComponents: function(arr, path){
		var o = this;
		var componentName;
		path = (typeof path === 'undefined') ? "rocketboots/" : path;

		for (var i = 0, al = arr.length; i < al; i++){
			componentName = arr[i];
			if (typeof o.components[componentName] == "undefined") {
				o.components[componentName] = new o.Component(componentName);
				o.loadScript(path + arr[i], function(){
					o.components[componentName].isLoaded = true;
				});
			} else {
				//console.warn("Trying to load", componentName, "component that already exists.");
			}
		}
		return this;
	},
	loadCustomComponents: function (arr, path) {
		path = (typeof path === 'undefined') ? "" : path;
		return this.loadComponents(arr, path);
	},
	areAllComponentsLoaded: function(){
		let componentCount = 0;
		let componentsInstalledCount = 0;
		for (let c in this.components) {
			// if (o.components.hasOwnProperty(c)) {  do stuff	}
			componentCount++;
			if (this.components[c].isInstalled) {
				componentsInstalledCount++;
			}
		}
		console.log("RB Components Installed: " + componentsInstalledCount + "/" + componentCount);
		return (componentsInstalledCount >= componentCount);
	},

//==== Ready and Init Functions

	ready: function(callback){
		if (typeof callback == "function") {
			if (this.isInitialized) {
				callback(this);
			} else {
				this.readyFunctions.push(callback);
			}
		} else {
			console.error("Ready argument (callback) not a function");
		}
		return this;
	},
	runReadyFunctions: function(){
		var o = this;
		// Loop over readyFunctions and run each one
		var f, fn;
		for (var i = 0; o.readyFunctions.length > 0; i++){
			f = o.readyFunctions.splice(i,1);
			fn = f[0];
			fn(o);
		}
		return this;	
	},
	init: function(attempt){
		const o = this;
		// TODO: allow dependecies to be injected rather than forcing them to be on the window scope
		var isJQueryUndefined = (typeof $ === "undefined");
		var isLodashUndefined = (typeof _ === "undefined");
		var areRequiredScriptsMissing = isJQueryUndefined || isLodashUndefined;

		if (typeof attempt === "undefined") { 
			attempt = 1; 
		} else if (attempt > o._MAX_ATTEMPTS) {
			console.error("Could not initialize RocketBoots: too many attempts");
			return false;
		} else {
			attempt++;
		}
		//console.log("RB Init", attempt, (areRequiredScriptsMissing ? "Waiting on required objects from external scripts" : ""));

		if (!isJQueryUndefined) {
			o.$ = $;
			o.$('#' + o._BOOTING_ELEMENT_ID).show();
		}
		if (!isLodashUndefined) {
			o._ = _;
			o.each = o.forEach = _.each;
		}

		function tryAgain () {
			// Clear previous to stop multiple inits from happening
			window.clearTimeout(o._initTimer);
			o._initTimer = window.setTimeout(function(){
				o.init(attempt);
			}, (attempt * 10));
		}

		// On first time through, do some things
		if (attempt === 1) {
			// Create "rb" alias
			if (typeof window.rb !== "undefined") {
				o._rb = window.rb;
			}
			window.rb = o;
			
			// Aliases
			o.window = window;
			o.document = window.document;

			// Load default components
			o.loadComponents(o.defaultComponents);

			// Load required scripts
			if (isJQueryUndefined) {
				o.loadScript(o.libsPath + "jquery-" + o.jQueryVersion + ".min", function(){
					//o.init(1);
				});
			} 
			if (isLodashUndefined) {
				o.loadScript(o.libsPath + "lodash.min", function(){ });
			}
		}

		if (o.areAllComponentsLoaded() && !areRequiredScriptsMissing) {
			console.log("RB Init - All scripts and components are loaded.", o.loadedScripts, "\nRunning component callbacks...");
			// TODO: These don't necessarily run in the correct order for requirements
			o.each(o.components, function(component){
				o.each(component.callbacks, function(callback){
					console.log("Callback for", component.name);
					callback(); // TODO: Make this run in the right context?
				});
			});
			console.log("RB Init - Running Ready functions.\n");
			o.$('#' + o._BOOTING_ELEMENT_ID).hide();
			o.runReadyFunctions();
			o.isInitialized = true;
			return true;
		}

		tryAgain();
		return false;
	}
};
