class GameImage extends Image {
	constructor(n, src) { 
		super();
		let o = this;
		if (typeof n === "string") {
			o.src = "images/" + n + ".png";
		}
		if (typeof src === "string") {
			o.src = src;
		}
		o.data = null;
		/*
			console.log(n);
			let c = o.getCanvasContext();
			c.putImageData(n, 0, 0);
			o.src = c._canvas.toDataURL();
		*/
		o.flippedHorizontal = null;
		o.flippedVertical = null;		
		o.outline = new Image();
		o.onload = () => { o.setup(); }
	}
	setup() {
		let o = this;
		o.data = o.getImageData();
		o.flippedHorizontal = o.getFlippedImage(-1, 1);
		o.flippedVertical = o.getFlippedImage(1, -1);
		o.setOutline();
	}
	getImageData() {
		let c = this.getCanvasContext();
		c.drawImage(this, 0, 0);
		return c.getImageData(0, 0, this.width, this.height);
	}
	getFlippedImage(a, b) {
		let c = this.getCanvasContext();
		c.save();
		c.scale(a, b);
		//c.translate(-this.width, this.height);
		c.translate((a < 1) ? -this.width : 0, (b < 1) ? -this.height : 0);
		//c.rotate(Math.PI);
		c.drawImage(this, 0, 0);
		c.restore();
		//let data = c.getImageData(0, 0, this.width, this.height);
		//c.putImageData(data, 0, 0);
		let img = new Image();
		img.src = c._canvas.toDataURL();
		return img;
	}
	getCanvasContext() {
		let canvas = document.createElement('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		let c = canvas.getContext('2d');
		c._canvas = canvas;
		return c;
	}	
	setOutline() {
		return;
		let data;
		// TODO Get outline data.... 
		let c = this.getCanvasContext();
		canvas.width = 0; // TODO
		canvas.height = 0; // TODO
		c.putImageData(data, 0, 0);
		this.outline = canvas.toDataURL();
	}
}