class Thing {
	constructor(world, x, y) {
		let o = this;
		o.world = world;
		o.loc = new Coords(x, y);
		o.name = "Thing";
		o.verb = "touch";
		o.size = 16;
		o.half = o.size/2;
		o.alpha = 1;
		o.discovered = 0;
		o.minZoom = 0;
		o.selected = false;
	}
	draw(c, s) {
		let o = this;
		let pos = s.getScreenXY(o.loc);
		let sz = o.size * Math.max(s.zoom, o.minZoom);
		let h = o.half * s.zoom;
		if (o.discovered < 0.5) {
			c.font = "10px 'Lucida Console', Monaco";
			c.fillStyle = "rgba(255,255,255,0.5)";
			c.fillText("?", pos.x - 5.5, pos.y);
		} else {
			if (o.label) {
				let fontSize = Math.ceil(9 * s.zoom);
				if (fontSize > 4) {
					c.font =  fontSize + "px Verdana";
					c.shadowColor = "#000";
					c.shadowOffsetX = 1;
					c.shadowOffsetY = -1;
					c.fillStyle = "#fff";
					if (o.label instanceof Array) {
						o.label.forEach((a, i) => {
							c.fillText(a, pos.x - (a.length * 2 * s.zoom), pos.y - sz + 0.5 - ((o.label.length - i - 1) * 9));
						});
					} else {
						c.fillText(o.label, pos.x - (o.label.length * 2 * s.zoom), pos.y - sz + 0.5);
					}
				}
			}
			c.globalAlpha = o.alpha;
			if (o.img instanceof Image) {
				if (o.selected) {
					//c.shadowColor = "rgba(50,150,255,1)";
					c.shadowColor = "rgba(0,0,0,0.25)";
					c.shadowOffsetX = 0;
					c.shadowOffsetY = 0;
					c.shadowBlur = 8;
				} else {
					c.shadowColor = "rgba(0,0,0,0.25)";
					c.shadowOffsetX = 0;
					c.shadowOffsetY = 1;
					c.shadowBlur = 4;
				}
				c.imageSmoothingEnabled = false;
				c.drawImage(o.img, pos.x - h, pos.y - h, sz, sz);

			}
		}
	}
}