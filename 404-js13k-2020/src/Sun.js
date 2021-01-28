import SpaceObject from './SpaceObject.js';

const SUN_MASS_MULTIPLIER = 10000;
const SUN_RADIUS = 40;
const SUN_VERT_NUM = 40;

class Sun extends SpaceObject {
	constructor() {
		const baseVerts = SpaceObject.getRegularPolygonVerts(SUN_VERT_NUM, SUN_RADIUS);
		super(baseVerts);
		this.pos.set({ x: 0, y: 0 });
		this.mass *= SUN_MASS_MULTIPLIER;
		this.innerRadius *= 0.94; // so that objects appear to get absorbed
	}
	move() {} // override the move function so that sun never moves
}

export default Sun;
