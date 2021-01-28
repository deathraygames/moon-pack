class SpriteSheet {
	constructor(n, cb) {
		let o = this;
		o.sheet = new GameImage(n);
		o.sprites = [];
		o.sheet.onload = () => { 
			o.parse();
			if (typeof cb === "function") { cb(o.sprites); }
		};
	}
	parse() {
		let o = this;
		let canvas = document.createElement('canvas');
		let w = o.sheet.height;
		canvas.width = w;
		canvas.height = w; // assumes square
		let c = canvas.getContext('2d');
		let x = 0;
		while (o.sprites.length) { o.sprites.pop(); }
		while (x < o.sheet.width) {
			c.clearRect(0, 0, w, w);
			c.drawImage(o.sheet, x, 0, w, w, 0, 0, w, w);
			x += w;
			let src = canvas.toDataURL();
			o.sprites.push(new GameImage(null, src));
		}
	}
}