(function(){
	const component = {
		fileName: 		"SoundBank",
		classes:		{"SoundBank": SoundBank},
		requirements:	[],
		description:	"Sound loader/player; formerly SoundCannon",
		credits:		"By Luke Nickerson, 2014-2017"
	};
	
	function SoundBank() {
		this.sounds = {};
		this.isSoundOn = true;
		this.isMusicOn = true;
		this.soundHook = function(){}; 
		this.musicHook = function(){};
	};
	SoundBank.prototype._set = function(bool){
		if (!bool) this._setMusic(false);
		this.isSoundOn = bool;
		this.soundHook(bool);
	};
	SoundBank.prototype._setMusic = function(bool){
		if (bool) this._set(true);
		this.isMusicOn = bool;
		this.musicHook(bool);
	};
	SoundBank.prototype.on = function() {
		this._set(true);
		return this;
	};
	SoundBank.prototype.off = function() {
		this._set(false);
		return this;
	};
	SoundBank.prototype.soundOn = SoundBank.prototype.on; // alias
	SoundBank.prototype.soundOff = SoundBank.prototype.off; // alias

	SoundBank.prototype.musicOn = function() {
		this._setMusic(true);
		return this;
	};
	SoundBank.prototype.musicOff = function() {
		this._setMusic(false);
		return this;
	};

	SoundBank.prototype.toggle = function (forceSound) {
		if (typeof forceSound === 'boolean') { 	
			this._set(forceSound);
		} else {
			this._set( !this.isSoundOn );
		}
		return this.isSoundOn;	
	};
	SoundBank.prototype.toggleSound = SoundBank.prototype.toggle; // alias

	SoundBank.prototype.toggleMusic = function (forceMusic) {
		if (typeof forceMusic === 'boolean') { 	
			this._setMusic(forceMusic);
		} else {
			this._setMusic(!this.isMusicOn);
		}
		return this.isMusicOn;	
	};

	SoundBank.prototype.loadSounds = function(soundNameArray, directory, extension) {
		if (typeof directory != "string") directory = "sounds/";
		if (typeof extension != "string") extension = "mp3";
		var sn, snL = soundNameArray.length;
		for (var i = 0; i < snL; i++) {
			sn = soundNameArray[i];
			// *** TODO: if array is another array, then use index 0 as name, index 1 as volume
			this.sounds[sn] = new Audio(directory + sn + '.' + extension);
			this.sounds[sn].volume = 0.6;
		}
		console.log("Loaded", snL, "sounds.");
	};

	SoundBank.prototype.play = function (soundName, isLooped) {
		if (this.isSoundOn) {	
			if (typeof this.sounds[soundName] === 'undefined') {
				console.log("Sound does not exist: " + soundName);
				return false;
			} else {
				if (typeof isLooped !== 'boolean') {
					isLooped = false;
				}
				this.sounds[soundName].loop = isLooped;
				if (!isLooped || this.isMusicOn) {
					this.sounds[soundName].play();
				}
				return true;
			}
		} else {
			return false;
		}
	}
	
	SoundBank.prototype.stop = function(soundName){
		if (this.sounds[soundName]) {
			this.sounds[soundName].pause();
		} else {
			console.warning("Sound not found", soundName, this.sounds);
		}
	};


	// Install into RocketBoots if it exists otherwise put the classes on the global window object
	if (RocketBoots) {
		RocketBoots.installComponent(component);
	} else if (window) {
		for (let className in component.classes) {
			window[className] = component.classes[className];
		}
	}
})();