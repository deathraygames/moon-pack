(function(){
	const component = {
		fileName: 		"JQuery",
		classes:		{"$": window.jQuery},
		requirements:	[]
	};

	// Install into RocketBoots if it exists otherwise put the classes on the global window object
	if (RocketBoots) {
		RocketBoots.installComponent(component);
	}
})();