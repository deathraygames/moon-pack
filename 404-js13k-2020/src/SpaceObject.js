import Polygon from './Polygon.js';
// import physics from '../../../rocket-boots-repos/physics/src/physics.js';
import physics from '../node_modules/rocket-boots-physics/src/physics.js';

// import { Coords } from 'rocket-boots-coords';
// physics.Coords = Coords;

physics.bigG = .000001;

class SpaceObject extends Polygon {
	constructor(baseVerts = []) {
		super([]);
		const c = () => Math.random() * 0.2 + 0.4;
		const o = this;
		Object.assign(
			o,
			{
				baseVerts,
				baseColor: [
					c(),
					c(),
					c(),
				],
				hitColor: [.7, 0., 0.],
				// boundingBox: [],
				hit: false,
				verts: [], // set in calc
				vc: null, // set in calc
				// Physics related values
				// pos: new Coords(),
				// force: new Coords(),
				// acc: new Coords(),
				// vel: new Coords(),
				r: 0,
				outerRadius: 0,
				innerRadius: 0,
				children: [],
			}
		);
		physics.physical(o, { mass: 10. });
		o.alignToCenter();
		o.calcRadii();
		o.calcVerts();
		o.calcMass();
		
		o.Coords = physics.Coords;
	}

	alignToCenter() {
		const center = Polygon.getCenter(this.baseVerts);
		this.baseVerts.forEach((bv) => {
			[0,1].forEach(i => bv[i] = bv[i] - center[i]);
		});
	}

	// calcRadii() {
	// 	const { inner, outer } = Polygon.getRadii(this.baseVerts);
	// 	this.r = outer;
	// 	this.innerRadius = inner;
	// }

	calcRadii() {
		let inner = Infinity;
		// Outer/largest radius
		this.outerRadius = this.r = this.baseVerts.reduce((n, v) => {
			// Store radius on each base vertex for quicker computation later
			const r = v.r = Polygon.getRadius(v);
			if (r < inner) { inner = r; }
			return (r > n) ? r : n; // Look for the largest
		}, 0);
		this.innerRadius = inner;
	}

	calcMass() {
		this.mass = Math.PI * Math.pow((this.innerRadius + this.r) / 2, 2) * 50;
		// console.log('mass', this.mass);
	}

	getVertColors() {
		return this.vc;
	}

	getColor(v, bv, i) {
		const bc = this.baseColor;
		return [
			bc[0] + (this.hit ? .1 : 0.),
			bc[1] + (this.isColliding ? .1 : .0),
			bc[2],
		];
	}

	calcVerts() {
		let vc = [];
		this.verts.length = 0;
		this.baseVerts.forEach((bv, i) => {
			const v = this.verts[i] = [bv[0] + this.pos.x, bv[1] + this.pos.y, 0]; // bv[2] + this.pos.z];
			vc = vc.concat(v).concat(this.getColor(v, bv, i));
		});
		this.vc = new Float32Array(vc);
	}

	calcVertWithRotation(vc, bv, i) {
		// Thanks https://stackoverflow.com/a/17411276/1766230
		const cos = Math.cos(this.rotation);
		const sin = Math.sin(this.rotation);
		this.verts[i] = [
			(cos * bv[0]) - (sin * bv[1]) + this.pos.x, 
			(cos * bv[1]) + (sin * bv[0]) + this.pos.y,
			0,
		];
		return vc.concat(this.verts[i]).concat(this.getColor());
	}

	calcVertsWithRotation() {
		this.verts.length = 0;
		let vc = this.baseVerts.reduce((vc, bv, i) => this.calcVertWithRotation(vc, bv, i), []);
		this.vc = new Float32Array(vc);
	}

	static rotate(xy, radians, center) {
		let x = xy[0] - center[0];
		x += center[0];
	}

	// clearHit() {
	// 	this.hit = false;
	// 	return this;
	// }

	// checkHits(objects) {
	// 	objects.forEach((b) => this.checkHit(b));
	// }

	// checkHit(obj) {
	// 	if (obj === this) { return; } // can't hit self
	// 	if (this.objectInside(obj)) {
	// 		this.hit = true;
	// 	}		
	// }

	setOrbitalVelocity(bigObj) {
		this.vel.set(physics.getOrbitalVelocity(this, bigObj));
	}
}

export default SpaceObject;
