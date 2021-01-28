import SpaceObject from './SpaceObject.js';

class Blast extends SpaceObject {
	constructor(pos, vel, baseColor = [1., 0.5, 0.], baseR = .2, sides = 8) {
		const baseVerts = SpaceObject.getRegularPolygonVerts(sides, baseR);
		super(baseVerts);
		this.pos.set(pos);
		this.vel.set(vel);
		Object.assign(
			this,
			{
				mass: 0,
				baseColor,
				baseR,
				maxR: baseR * 10,
				r: baseR,
				explosionSpeed: 6 + Math.random() * 3,
			}
		);
	}

	ongoing(t) {
		this.r += t * this.explosionSpeed;
		if (this.r > this.maxR) {
			this.delete = true;
		}
		this.baseVerts = SpaceObject.getRegularPolygonVerts(8, this.r);
		this.calcVerts();
	}
}

export default Blast;
