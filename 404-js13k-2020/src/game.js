// import Loop from '../node_modules/rocket-boots-loop/src/Loop.js';
import Ship from './Ship.js';
import SpaceObject from './SpaceObject.js';
import Asteroid from './Asteroid.js';
import Sun from './Sun.js';
import sounds from './sounds.js';

// import webglp from '../node_modules/webglp/webglp.js';

// import webglp from '../../../rocket-boots-repos/webglp/webglp.js';
import webglp from 'webglp';
import Blast from './Blast.js';
import Fragment from './Fragment.js';

const SHADERS = [
	['v.glsl', 'stars-f.glsl'],
	//['v.glsl', 'sun-f.glsl'],
	['space-v.glsl', 'space-f.glsl'],
];
const NUM_OF_ASTEROIDS = 404;
const ASTEROID_RADIUS = 120;
const ASTEROID_RADIUS_RANGE = 40;
const MAX_ASTEROID_RADIUS = 250;
const MAX_SHIP_RADIUS = 800;
const TIME_SCALE = 1;

const MAX_ZOOM_DELTA = 600;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 5000;
const ZOOM_MULTIPLIER = .001;

let zoom = 20.;
let glp;
let lastAsteroidCount = NUM_OF_ASTEROIDS;
let loop;
let isStarted = false;
let isDead = false;

const $ = (id) => document.getElementById(id);
const rand = (n = 1) => Math.random() * n;

const achievements = {};
const objects = [];
const effects = [];
const sun = setupSun();
const asteroids = setupAsteroids(sun);
const ship = setupShip(sun)

//------------------- DRAW

const draw = () => {
	const uniforms = [
		['iResolution', glp.gl.canvas.width, glp.gl.canvas.height],
		['zoom', zoom],
		['viewerPosition', ship.pos.x, ship.pos.y, 0.],
		['iTime', 0.],
	];

	// Draw stars background
	glp.use(0).draw({ uniforms, buffs: [['position']] });

	// Draw "space" galaxy
	const buffs = [
		['position', { size: 3, stride: 6 }],
		['color', { size: 3, stride: 6, offset: 3 }],
	];
	glp.use(1).draw({
		uniforms,
		buffs,
		verts: new Float32Array([]), 
		vertSize: 6,
		type: glp.gl.TRIANGLE_FAN,
		clear: false,
	});

	effects.concat(objects).forEach((o) => {
		// glp.unif('translation', 0, 0, 0); // o.x, o.y, o.z);
		glp.draw({
			// uniforms: [],
			buffs,
			verts: o.getVertColors(), // used to calculate the verts to draw
			vertSize: 6,
			type: glp.gl.TRIANGLE_FAN,
			clear: false,
		});
	});
};

//---------------- Achievements

function achieve(what) {
	if (achievements[what]) { return; }
	achievements[what] = true;
	const elt = $(`ach-${what}`);
	if (elt) {
		elt.classList.add('unlocked');
	}
	if (Object.keys(achievements).length >= 5) {
		$('intro').classList.add('closed');
	}
}

//--------------- OBJECT MANAGEMENT

const removeDeletedObjects = (deleteIndices = []) => {
	for(let d = deleteIndices.length - 1; d >= 0; d--) {
		const i = deleteIndices[d];
		objects.splice(i, 1);
	}
};

function resetFarAwayObject(o, r) {
	if (o.pos.getDistance(sun.pos) > r) {
		putInRandomOrbit(o, sun);
		return true;
	}
	return false;
}

const objectLoop = (t) => {
	let asteroidCount = 0;
	const deleteIndices = [];
	objects.forEach((o, i) => {
		if (o.delete) {
			deleteIndices.push(i);
			return;
		}
		if (o.ongoing) { o.ongoing(t); }
		o.rotate(t);
		o.calcVertsWithRotation();
		// Don't do gravity on bullets (performance) or the sun (because it can't move)
		if (o.gravitate && !(o instanceof Sun)) {
			o.gravitate(t, [sun]);
			// o.gravitate(t, objects);
		}
		o.move(t);
		o.collide(objects);
		// o.clearHit();
		// o.checkHits(objects);
		if (o instanceof Asteroid) {
			asteroidCount++;
			resetFarAwayObject(o, MAX_ASTEROID_RADIUS);
		} else if (o instanceof Ship) {
			if (resetFarAwayObject(o, MAX_SHIP_RADIUS)) {
				sounds.jump();
			}
		}
	});
	effects.forEach((o) => {
		o.rotate(t);
		o.calcVertsWithRotation();
	});
	removeDeletedObjects(deleteIndices);
	return { asteroidCount };
};

//-------------------- OBJECT CREATION

function makeDecay(o, n = 8) {
	o.decayTime = n;
	o.ongoing = (t) => {
		o.decayTime -= t;
		if (o.decayTime < 0) { o.delete = true; }
	};
}

function die(reason) {
	isDead = true;
	ship.delete = true;
	makeFragments(ship, 10);
	makeBlast(ship.pos, ship.vel, 5);
	sounds.death();
	endGame(reason);
}

function destroy(o) {
	o.delete = true;
	makeFragments(o);
	makeBlast(o.pos, o.vel);
	sounds.explode();
}

const makeBullet = (ship, bulletPower) => {
	const baseVerts = [
		[0, .2, 0],
		[-.1, -.1, 0],
		[0, -.2, 0],
		[.1, -.1, 0],
	];
	const b = new SpaceObject(baseVerts);
	b.rotation = ship.rotation;
	const facing = ship.getFacingUnitVector().multiply(-1);
	b.pos.set(ship.pos).add(facing.getMultiply(ship.shipScale));
	b.vel.set(ship.vel).add(facing.getMultiply(bulletPower));
	b.mass *= 0.5;
	makeDecay(b, 10);
	b.damage = (dmg, objHit) => {
		b.baseColor[0] = .9; // red-ify the richoceting bullets
		// console.log(dmg / 10);
		b.decayTime *= 0.5;
		if (objHit instanceof Asteroid) {
			destroy(objHit);
		} else if (objHit instanceof Ship) {
			die('bullet');
		}
	};
	b.gravitate = null; // Don't apply gravity to bullets
	objects.push(b);
};

function makeBlast(pos, vel, scale = 1) {
	const b = new Blast(pos, vel, [1., 0.5, 0.], .2 * scale, 8);
	const b2 = new Blast(pos, vel, [1., 1., 0.], 0.05 * scale, 3);
	objects.push(b);
	objects.push(b2);
}

function makeExhaust() {
	const r = 0.07 + rand(.05);
	const baseVerts = SpaceObject.getRegularPolygonVerts(3, r);
	const p = new SpaceObject(baseVerts);
	p.baseColor = [.5, .3, .5];
	p.rotation = rand(Math.PI * 2);
	const facing = ship.getFacingUnitVector();
	p.pos.set(ship.pos).add(facing.getMultiply(ship.shipScale * 0.5));
	p.vel.set(ship.vel).add(facing.getMultiply(14.));
	makeDecay(p, 10);
	p.gravitate = null; // Don't apply gravity to exhaust
	objects.push(p);
}

function makeFragment(o, n) {
	const f = new Fragment(o, n);
	f.damage = (dmg, objHit) => {
		if (objHit === sun) {
			f.delete = true;
		}
	};
	makeDecay(f, 30);
	giveSpin(f);
	objects.push(f);
}

function makeFragments(o, extra = 4) {
	const n = 2 + Math.floor(rand(extra));
	for(let i = 0; i < n; i++) { makeFragment(o, n); }
}

function setupShip(sun) {
	const ship = new Ship();
	ship.pos.set({ x: ASTEROID_RADIUS, y: 0 });
	ship.setOrbitalVelocity(sun);
	ship.damage = (dmg, objHit) => {
		if (objHit === sun) {
			die('sun');
		}
	};
	objects.push(ship);
	return ship;
}

function putInRandomOrbit(o, bigObj) {
	const r = ASTEROID_RADIUS + rand(ASTEROID_RADIUS_RANGE);
	const theta = rand(Math.PI * 2);
	o.pos.setByPolarCoords(r, theta);
	o.setOrbitalVelocity(bigObj);
	giveSpin(o);
}

function giveSpin(o, n = .3) {
	o.rotVel = rand(n) - rand(n);
}

function setupAsteroids(sun) {
	// const baseVerts = [
	// 	[0, .4, 0],
	// 	[-.2, -.2, 0],
	// 	[.2, -.2, 0],
	// ];
	// let o = new SpaceObject(baseVerts);
	// o.pos.set({ x: 0, y: 0 });
	// o.vel.set({ x: 0, y: 0.1 });
	// objects.push(o);

	// const randVert = () => Math.round((Math.random() * 4 - 2) * 1000)/1000;

	for(let i = 0; i < NUM_OF_ASTEROIDS; i++) {
		const o = new Asteroid();
		putInRandomOrbit(o, sun);
		o.damage = (dmg, objHit) => {
			if (objHit === sun) {
				putInRandomOrbit(o, sun);
			}
		};
		objects.push(o);
	}
};

function makeOuterSun(s, r, color) {
	const baseVerts = SpaceObject.getRegularPolygonVerts(s, r);
	const outerSun = new SpaceObject(baseVerts);
	outerSun.baseColor = color;
	outerSun.mass = 0;
	outerSun.vel = null;
	outerSun.move = () => {};
	outerSun.collide = () => {};
	outerSun.gravitate = null;
	giveSpin(outerSun, .1);
	effects.push(outerSun);
}

function setupSun() {
	const sun = new Sun();
	const color = sun.baseColor.map((c) => Math.max(0, c - 0.3));
	const r = sun.r * 1.1;
	[8,8,4,4,4,3].forEach((s) => makeOuterSun(s, r, color));
	// makeOuterSun(8, r, color);
	// makeOuterSun(8, r, color);
	// makeOuterSun(3, r, color);
	// makeOuterSun(4, r, color);
	objects.push(sun);
	return sun;
}

//--------------------------------------------------- Game Controls

const setupLoop = (ship, countElt) => {
	let t = 0;
	const drawDom = (c) => {
		if (lastAsteroidCount === c) { return; }
		countElt.innerHTML = c;
		lastAsteroidCount = c;
		if (c === 0) {
			$('win').style.display = 'block';
		}
	}
	loop = (dtOverride) => {
		window.requestAnimationFrame((now) => {
			const dt = (dtOverride === undefined) ? ((now - t) / 1000) * TIME_SCALE : dtOverride;
			if (ship.engaged) {
				makeExhaust();
			}
			const { asteroidCount } = objectLoop(dt);
			drawDom(asteroidCount);
			draw();
			t = now;
			loop();
		});
	};
	objectLoop(0);
	draw();
};

function startLoop() {
	if (isStarted) { return; }
	isStarted = true;
	$('main').classList.add('go');
	achieve('start');
	loop(0);
}

function endGame(reason = 'sun') { // Note: doesn't actually stop the loop
	$('main').classList.remove('go');
	if (isDead) {
		$('intro').classList.add('closed');
		$('dead').classList.remove('closed');
		$(reason).style.display = 'block';
	}
}

const getMousePosition = (e) => {
	// fix for Chrome
	const eFixed = (e.type.startsWith('touch')) ? e.targetTouches[0] : e;
	return [eFixed.pageX, eFixed.pageY];
}

const setupInput = (canvas, ship) => {
	const canvasSize = [canvas.width, canvas.height];
	const thrust = () => {
		ship.engage();
		sounds.thrust();
		makeExhaust();
		achieve('thrust');
	};
	const shoot = () => {
		const bulletPower = ship.fire();
		makeBullet(ship, bulletPower);
		sounds.gun();
		achieve('shoot');
	};
	window.addEventListener('wheel', (e) => {
		// control speed based on current zoom, throttle the speed
		const zoomSpeed = Math.min(MAX_ZOOM_DELTA, Math.abs(e.deltaY)) * ZOOM_MULTIPLIER * zoom;
		const zoomDir = (e.deltaY < 0 ? -1 : 1);
		// cap the zoom
		zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + zoomDir * zoomSpeed));
		// console.log(zoom);
		if (!isStarted) { draw(); }
		achieve('zoom');
	});
	window.addEventListener('keydown', (e) => {
		switch (e.key.toUpperCase()) {
			// case 'ESCAPE': { endGame(); } break;
			case 'W': { thrust(); } break;
		}
		// console.log(e.key);
	});
	window.addEventListener('keyup', (e) => {
		switch (e.key.toUpperCase()) {
			case 'W': { ship.disengage(); } break;
			case ' ': { shoot(); } break;
		}
	});
	window.oncontextmenu = (e) => e.preventDefault();
	canvas.onmousedown = canvas.ontouchstart = (e) => {
		if (isDead) { return; }
		if (e.which === 3) { thrust(); }
	};
	canvas.onmouseup = canvas.ontouchend = (e) => {
		if (isDead) { return; }
		if (!isStarted) {
			startLoop();
			return;
		}
		if (e.which === 3) {
			ship.disengage();
			return;
		}
		shoot();
	};
	canvas.onmousemove = canvas.ontouchmove = (e) => {
		if (isDead) { return; }
		if (!isStarted) { return; }
		const fixedCurrentMousePos = getMousePosition(e).map((n, i) => (
			(n - (canvasSize[i] / 2)) * (i === 1 ? -1 : 1)
		));
		const theta = Math.atan2(fixedCurrentMousePos[1], fixedCurrentMousePos[0]);
		ship.rotation = theta - Math.PI/2;
		achieve('rotate');
	};
	document.addEventListener('click', (e) => {
		console.log(e.target, e);
		if (e.target.id === 'restart') {
			location.reload();
		}
	});
};

// Create glp
const init = async () => {
	glp = await webglp.init('#canvas', SHADERS, { fullscreen: true });
	window.z.glp = glp;
	console.log(glp);
	setupInput(glp.gl.canvas, ship, sun);
	setupLoop(ship, $('count'));
	return glp;
}

document.addEventListener('DOMContentLoaded', init);

window.z = { SpaceObject, glp, objects };
