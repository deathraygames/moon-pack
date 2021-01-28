(function() {
	class Loop {
		constructor(fn, t) {
			this.wait = t;
			this.timer = null;
			this.fn = fn;
		}
		start() {
			this.next(new Date());
		}
		next(last) {
			let start = new Date(); // Now
			let t = start - last; // How long it's been since last run
			this.fn(t);
			let took = (new Date()) - start; //  How long the fn took
			let wait = Math.max(this.wait - took, 1); // How long should we wait
			this.timer = window.setTimeout(() => { 
				this.next(start); 
			}, wait);
		}
		stop() {
			window.clearInterval(this.timer);
		}
	}

	const component = {
		fileName: "EasyLoop",
		classes: {"EasyLoop": Loop},
		requirements: [],
		credits: "By Luke Nickerson, 2017"
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