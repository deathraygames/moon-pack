class Panner {
	constructor() {

	}
	setup(canvasElt, moveDeltaCallback, movingClassElt) {
		// Copied from Radioactive Cavemen (`radc-game.js`)
		const movementThreshold = 1;
		movingClassElt = movingClassElt || document.getElementsByTagName("body");
		const $movingClassElt = $(movingClassElt);
		let isDown = false;
		let didMove = false;
		let downPos = new RocketBoots.Coords();
		
		$(canvasElt).on('mousedown touchstart', onDown)
			.on('mousemove touchmove', onMove)
			.on('mouseup touchend', onUp)
			.on('click touch', onTap);

		function getX(e) {
			if (e.pageX !== undefined) {
				return e.pageX;
			}
			return e.originalEvent.touches[0].pageX;
		}
		function getY(e) {
			if (e.pageY !== undefined) {
				return e.pageY;
			}
			return e.originalEvent.touches[0].pageY;
		}

		function onDown(e) {
			isDown = true;
			didMove = false;
			downPos.set({x: getX(e), y: getY(e)});
		}

		function onUp(e) {
			if (didMove) {
				e.preventDefault();
			}
			isDown = false;
			downPos.clear();
			$movingClassElt.removeClass("moving");			
		}

		function onMove(e){
			if (isDown) {
				let newPos = new RocketBoots.Coords(getX(e), getY(e));
				let delta = downPos.subtract(newPos);
				let distance = delta.getMagnitude();
				// TODO: Rework this so that the movementThreshold avoids movement
				// until you've moved beyond the amount (like a friction on the drag)

				// New way of movement:
				moveDeltaCallback(delta);
				// Old rocketboots way: g.stage.camera.move(delta);
				downPos.set(newPos);
				didMove = (distance > movementThreshold);
				if (didMove) {
					$movingClassElt.addClass("moving");
				}
				e.preventDefault();
			}

			// Get stage coordinates from mouse position (e.offsetX, e.offsetY)
			// i.e. g.mousePos = g.stage.getPosition(e.offsetX, e.offsetY);
			// Do other stuff, show shadow of block to build
		}
		
		function onTap(e) {
			if (!didMove) {
				// Get stage coordinates from mouse position (e.offsetX, e.offsetY)
				// Do other stuff, possibly based on the tool you have
			}
			didMove = false;			
		}
	}
}