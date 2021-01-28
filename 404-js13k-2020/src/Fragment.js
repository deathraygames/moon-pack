import SpaceObject from './SpaceObject.js';

const SPEED = 20;
const randVel = () => Math.random() * SPEED * (Math.random() < 0.5 ? 1 : -1);

class Fragment extends SpaceObject {
	constructor(parentObj, n = 2) {
		const r = 0.75 * parentObj.r / n; // 0.75 to account for extra random radius
		const vertNum = Math.max(3, Math.round(parentObj.verts.length * Math.random()));
		const baseVerts = SpaceObject.getRegularPolygonVerts(vertNum, r, r);
		super(baseVerts);
		this.baseColor = parentObj.baseColor.map((c) => Math.max(0, c - 0.3));
		this.pos.set(parentObj.pos);
		const blastVel = {
			x: randVel(),
			y: randVel(),
		};
		this.vel.set(parentObj.vel).add(blastVel);
	}
}

export default Fragment;