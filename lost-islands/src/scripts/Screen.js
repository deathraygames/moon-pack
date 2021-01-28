
class Screen {
	constructor(id, multiplier, focus) {
		var o = this;
		o.id = id;
		o.multiplier = multiplier;
		o.canvas = null;
		o.ctx = null;
		o.zoom = 1;
		o.size = new Coords(0,0); // sized-up pixels
		o.half = new Coords(0,0); 
		o.focus = focus;
	}
	setup() {
		let o = this;
		o.canvas = document.getElementById(o.id);
		o.ctx = o.canvas.getContext("2d");
		o.ctx.imageSmoothingEnabled = false;
		o.canvas.style.imageRendering = "pixelated";
		o.setSize();
		window.onresize = (e) => { o.setSize(); };
	}
	setSize() {
		var o = this;
		var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0],
			x = w.innerWidth || e.clientWidth || g.clientWidth,
			y = w.innerHeight|| e.clientHeight|| g.clientHeight,
			v = o.canvas,
			m = o.multiplier;
		o.size.set(x*m, y*m);
		o.half.set(x*m/2, y*m/2);
		
		v.style.width = x + "px";
		v.style.height = y + "px";
		v.width = x * m;
		v.height = y * m;
	}
	clear() {
		this.ctx.clearRect(0,0, this.size.x, this.size.y);
	}
	draw(what) {
		if (what instanceof Array) {
			what.forEach((w) => { this.draw(w); });
			return;
		}
		let c = this.ctx;
		c.save();
		if (typeof what.draw === 'function') {
			what.draw(c, this);
		} else if (typeof what.img === 'object') {
			let pos = this.getScreenXY(what.loc);
			let sz = what.size * this.zoom;
			let h = what.half * this.zoom;
			this.ctx.drawImage(what.img, pos.x - h, pos.y - h, sz, sz);
		}
		c.restore();
	}
	getBoundaries() {
		let o = this;
		return {
			min: {
				x: Math.floor(o.focus.x - o.half.x / o.zoom), 
				y: Math.floor(o.focus.y - o.half.y / o.zoom) 
			},
			max: {
				x: Math.ceil(o.focus.x + o.half.x / o.zoom),
				y: Math.ceil(o.focus.y + o.half.y / o.zoom)
			} 
		};
	}
	getFocusOffset() {
		let o=this;
		return {
			x: o.half.x / o.zoom - o.focus.x, 
			y: o.half.y / o.zoom - o.focus.y
		};
	}
	getScreenXY(x, y) {
		let xy = new Coords(x, y);
		let fo = this.getFocusOffset();
		return {
			x: Math.round((xy.x + fo.x) * this.zoom), 
			y: Math.round((xy.y + fo.y) * this.zoom)
		};
	}
	getScreenXYOffset(x, y) {
		let xy = this.getScreenXY(x, y);
		xy.x += 0.5;
		xy.y += 0.5;
		return xy;
	}	
	zoomIn() { if (this.zoom < 3) { this.zoom *= 1.2 } }
	zoomOut() { if (this.zoom > 0.2) { this.zoom /= 1.2 } }
}
