(function(){
	class Screen {
		constructor(id, multiplier, focus) {
			this.id = id;
			this.multiplier = multiplier;
			this.canvas = null;
			this.ctx = null;
			this.zoom = 1;
			this.size = new RocketBoots.Coords(0,0); // sized-up pixels
			this.half = new RocketBoots.Coords(0,0); 
			this.focus = focus;
			this.window = window;
		}
		setup() {
			this.canvas = document.getElementById(this.id);
			this.ctx = this.canvas.getContext("2d");
			this.ctx.imageSmoothingEnabled = false;
			this.canvas.style.imageRendering = "pixelated";
			this.setSize();
			this.window.onresize = (e) => { o.setSize(); };
		}
		setSize() {
			var w = window,
				d = document,
				e = d.documentElement,
				g = d.getElementsByTagName('body')[0],
				x = w.innerWidth || e.clientWidth || g.clientWidth,
				y = w.innerHeight|| e.clientHeight|| g.clientHeight,
				m = this.multiplier;
			this.size.set(x * m, y * m);
			this.half.set(x * m / 2, y * m / 2);
			
			this.canvas.style.width = x + "px";
			this.canvas.style.height = y + "px";
			this.canvas.width = x * m;
			this.canvas.height = y * m;
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
			return {
				min: {
					x: Math.floor(this.focus.x - this.half.x / this.zoom), 
					y: Math.floor(this.focus.y - this.half.y / this.zoom) 
				},
				max: {
					x: Math.ceil(this.focus.x + this.half.x / this.zoom),
					y: Math.ceil(this.focus.y + this.half.y / this.zoom)
				} 
			};
		}
		getFocusOffset() {
			return {
				x: this.half.x / this.zoom - this.focus.x, 
				y: this.half.y / this.zoom - this.focus.y
			};
		}
		getScreenXY(x, y) {
			let xy = new RocketBoots.Coords(x, y);
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
		zoomIn() { 
			if (this.zoom < 3) {
				this.zoom *= 1.2;
			}
		}
		zoomOut() { 
			if (this.zoom > 0.2) {
				this.zoom /= 1.2;
			}
		}
	}

	const component = {
		fileName: "Screen",
		classes: {"Screen": Screen},
		requirements: ["Coords"], 
		credits: "By Luke Nickerson, 2017-2018"
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