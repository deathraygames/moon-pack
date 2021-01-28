(function(){
	class GameImage extends Image {
		constructor(options) { 
			super();
			options = options || {};
			const name = options.name || options;
			if (typeof name === "string") {
				this.src = "images/" + name + ".png";
			}
			const src = options.src || options.url || null;
			if (typeof src === "string") {
				this.src = src;
			}
			this.name = options.name || null;
			this.data = null;
			/*
				console.log(n);
				let c = this.getCanvasContext();
				c.putImageData(n, 0, 0);
				this.src = c._canvas.toDataURL();
			*/
			this.flippedHorizontal = null;
			this.flippedVertical = null;
			this.pixiTexture = null;
			this.pixiSprite = null;		
			this.outline = new Image();
			this.isLoaded = false;
			// Setup now and after loaded
			this.loaded = new Promise((resolve, reject) => {
				this.onload = () => {
					this.setup();
					this.isLoaded = true;
					resolve(this);
				};
			});
		}
		setup() {
			this.data = this.getImageData();
			this.flippedHorizontal = this.getFlippedImage(-1, 1);
			this.flippedVertical = this.getFlippedImage(1, -1);
			this.setOutline();
			if (RocketBoots && RocketBoots.PIXI) {
				this.setPixiProperties();
			}
		}
		getImageData(ctx) {
			if (!ctx) {
				ctx = this.getCanvasContext();
			}
			ctx.drawImage(this, 0, 0);
			return ctx.getImageData(0, 0, this.width, this.height);
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
		setSourceByCanvas(canvas) {
			this.src = canvas.toDataURL();
		}
		setSourceByCanvasContext(ctx) {
			this.setSourceByCanvas(ctx._canvas);
		}
		setOutline() { // TODO
			return;
			let data;
			// TODO Get outline data.... 
			let c = this.getCanvasContext();
			canvas.width = 0; // TODO
			canvas.height = 0; // TODO
			c.putImageData(data, 0, 0);
			this.outline = canvas.toDataURL();
		}
		createPixiTexture() {
			return new RocketBoots.PIXI.Texture.fromImage(this.src);
		}
		createPixiSprite() {
			const texture = this.createPixiTexture();
			return new RocketBoots.PIXI.Sprite(texture);
		}
		setPixiProperties() {
			this.pixiTexture = this.createPixiTexture();
			this.pixiSprite = new RocketBoots.PIXI.Sprite(this.pixiTexture);
			//console.log(this.pixiTexture, this.pixiSprite)
		}
		replaceColor(oldColor, newColor) {
			// Based on http://jsfiddle.net/m1erickson/4apAS/
			const ctx = this.getCanvasContext();
			const oldRed = oldColor.red;
			const oldGreen = oldColor.green;
			const oldBlue = oldColor.blue;
			const newRed = newColor.red;
			const newGreen = newColor.green;
			const newBlue = newColor.blue;
			let count = 0;
			let imageData = this.getImageData(ctx);
			for (let i = 0; i < imageData.data.length; i += 4) {
				// is this pixel the old rgb?
				if (
					imageData.data[i] == oldRed &&
					imageData.data[i + 1] == oldGreen &&
					imageData.data[i + 2] == oldBlue
				) {
					imageData.data[i] = newRed;
					imageData.data[i + 1] = newGreen;
					imageData.data[i + 2] = newBlue;
					count++;
				}
			}
			// TODO: can set by data directly?
			ctx.putImageData(imageData, 0, 0);
			this.setSourceByCanvasContext(ctx);
			return count;
		}

	}

	const component = {
		fileName: "GameImage",
		classes: {"GameImage": GameImage},
		requirements: ["PIXI"], // Recommended
		description: "GameImage class",
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