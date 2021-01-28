class Shrine extends Thing {
	constructor(world, x, y, v, mantra) {
		super(world, x, y);
		let o = this;
		o.world = world;
		o.virtue = v;
		o.name = "Shrine of " + o.virtue;
		o.mantra = mantra;
		o.verb = "meditate";
		o.img = new GameImage("shrine");
		o.minZoom = 0.5;
	}
}