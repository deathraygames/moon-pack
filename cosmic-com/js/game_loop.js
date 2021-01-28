
function GameLoop () {
	
    this.isLooping 		= true;
	this.timer 			= 0;
	this.iteration 		= 0;
	this.maxIteration	= 15000000;
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
	
	this.everyIterationFunction = function(){ };
}

GameLoop.prototype.loop = function () 
{
	var o = this;
	o.everyIterationFunction();
	
	// Update every half second or so... For action...
	if ((o.iteration % o.loopModulusAction) == 0) {
		// *** look for collisions here?
	}

	// Update these only every second or so... 
	if ((o.iteration % o.loopModulus) == 0) {
		//console.log("Loop tick ~1/second");
	}			

	if (o.isLooping) {
		o.iteration++;
		if (o.iteration < o.maxIteration) {
			o.timer = window.setTimeout(function(){
				o.loop();
			}, o.loopDelay); 
		} else {
			o.iteration = 0;
			o.stop();
		}
	}	
}

GameLoop.prototype.start = function(){
	window.clearTimeout(this.timer);
	this.isLooping = true;
	this.loop();
}

GameLoop.prototype.stop = function(){
	this.isLooping = false;
	window.clearTimeout(this.timer);
}

GameLoop.prototype.toggle = function(){
	if (this.isLooping) this.stop();
	else this.start();
}
