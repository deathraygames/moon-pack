(function(){
	const component = {
		fileName: 		"PIXI",
		classes:		{"PIXI": window.PIXI},
		requirements:	[]
	};

	// Install into RocketBoots if it exists otherwise put the classes on the global window object
	if (RocketBoots) {
		RocketBoots.installComponent(component);
	}
})();