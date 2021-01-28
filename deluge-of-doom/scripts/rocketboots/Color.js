(function(){
	class Color {
		constructor(r, g, b) {
			this.red = r;
			this.green = g;
			this.blue = b;
		}
	}

	const component = {
		fileName: "Color",
		classes: {"Color": Color},
		requirements: [],
		description: "Color class",
		credits: "By Luke Nickerson, 2018"
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