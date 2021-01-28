import SpaceObject from './SpaceObject.js';
// import { Coords } from 'rocket-boots-coords';

const ONE_MOMENT = 0.02; // typical time "t" for thrust
const SHIP_BASE_VERTS = [
	[.20, -.1, 0], // bottom center
	[.35, 0, 0], // right butt
	[.45, .10, 0],
	[.40, .30, 0],
	[.30, .40, 0],
	[.20, .8, 0], // point
	[.10, .40, 0],
	[0, .30, 0],
	[-.05, .10, 0],
	[.05, 0, 0], // left butt
];
const SHIP_SCALE = 1.5;
const SHIP_DENSITY = 3;
const SHIP_THRUST = 100;

class Ship extends SpaceObject {
	constructor() {
		super(SHIP_BASE_VERTS.map((v) => v.map((coord) => coord * SHIP_SCALE)));
		Object.assign(
			this,
			{
				shipScale: SHIP_SCALE, // for reference only
				engaged: false, // Are engines on?
				facingRotationOffset: -Math.PI/2,
				thrustPowerUpMax: 2,
				thrustPowerUpStart: 0.75,
				thrustPowerUp: 0.75,
				thrustPowerUpMultiplier: .5,
				thrustPowerDownMultiplier: 2.,
				
			}
		);
		this.mass *= SHIP_DENSITY;
		this.thrustMagnitude = SHIP_THRUST * this.mass;
		this.baseColor = [0.6, 1., .3];
	}

	setRotation(rot) {
		this.rotation = rot + this.facingRotationOffset;
	}

	getFacingUnitVector() {
		const rot = this.rotation + this.facingRotationOffset;
		const x = Math.cos(rot);
		const y = Math.sin(rot);
		return new this.Coords(x, y);
	}

	ongoing(t) {
		if (this.engaged) { this.thrust(t); }
		else { this.cooldownThrust(t); }
	}

	engage() {
		this.engaged = true;
		this.thrust(ONE_MOMENT);
	}

	disengage() {
		this.engaged = false;
	}

	thrust(t) {
		const i = this.thrustPowerUp;
		this.thrustPowerUp += t * this.thrustPowerUpMultiplier;
		this.thrustPowerUp = Math.min(this.thrustPowerUpMax, this.thrustPowerUp);
		// console.log(i, '-->', this.thrustPowerUp, t);
		const unit = this.getFacingUnitVector();
		const thrustForce = unit.getMultiply(t * -this.thrustMagnitude * this.thrustPowerUp);
		this.force.add(thrustForce);
	}

	cooldownThrust(t) {
		// console.log(this.thrustPowerUp);
		if (this.thrustPowerUp <= this.thrustPowerUpStart) { return; }
		this.thrustPowerUp -= t * this.thrustPowerDownMultiplier;
		this.thrustPowerUp = Math.max(this.thrustPowerUpStart, this.thrustPowerUp);
	}

	fire() {
		return 22 + Math.random() * 2;
	}

	// getVertColors() {
	// 	const vertices = new Float32Array([
	// 		// x,	y,		z,		r,	g,	b
	// 		// 0,    	.2, 	0, 		0., 0., 1., // point 1
	// 		// .2,	 	0, 		0, 		0., 1., 0., // point 2
	// 		// .6, 	0,	 	0, 		1., 0., 0.,  // point 3
	// 		// 0.1, 	-1, 	0, 		1., 1., 0.,

	
	// 		0, .10, 0, 0, .5, 1,
	// 		.10, 0, 0, 0, .5, 1,
	// 		.30, 0, 0, 0, .5, 1,
	// 		.40, .10, 0, 1, .5, 1,
	// 		.40, .30, 0, 1, .5, 1,
	// 		.30, .40, 0, 0, .5, 1,
	// 		.10, .40, 0, 0, .5, 1,
	// 		0, .30, 0, 1, .5, 1,

	// 	]);
	// 	return vertices;
	// }

	// static getTriangle() {
	// 	const arr = [];
	// 	// [
	// 	// 	// x,	y,		z,		r,	g,	b
	// 	// 	-.1,    	0, 	0, 		0., 0., 1., // point 1
	// 	// 	0,	 	.2, 		0, 		0., 1., 0., // point 2
	// 	// 	.1, 	0,	 	0, 		1., 0., 0.,  // point 3
	// 	// ]
	// 	for(let i = 0; i < 3; i++) {
	// 		arr.push((Math.random() * .2) - .1);
	// 		arr.push((Math.random() * .2) - .1);
	// 		arr.push((Math.random() * .2) - .1);
	// 		arr.push((Math.random() * 2) - 1);
	// 		arr.push((Math.random() * 2) - 1);
	// 		arr.push((Math.random() * 2) - 1);
	// 	}
	// 	return new Float32Array(arr);
	// }
}

export default Ship;
