class Player extends Character {
	constructor(world, x, y) {
		super(world, x, y, "stranger");
		let o = this;
		o.type = "PC";
		o.inventory = {"watch": true};
		o.alpha = 1;
		o.discovered = 1;
		o.name = "Stranger";
		o.label = "";
	}
}