class Loop {
	constructor(fn) {
		this.lastLoopTime = 0;
		this.continueLoop = true;
		this.looper = (typeof fn === 'function') ? fn : () => {};
		this.timeScale = 1;
	}
	begin() {
		this.lastLoopTime = performance.now();
		this.continueLoop = true;
		this.loopOnNextFrame();
	}
	setup(fn) {
		this.looper = fn;
		return this;
	}
	loopOnNextFrame() {
		if (!this.continueLoop) { return; }
		window.requestAnimationFrame((now) => { this.loop(now); });
	}
	loop(now) {
		if (!this.continueLoop) { return; }
		const deltaT = ((now - this.lastLoopTime) / 1000) * this.timeScale;
		const returnStop = this.looper(deltaT, now);
		this.lastLoopTime = now;
		this.continueLoop = (returnStop) ? false : true;
		this.loopOnNextFrame();
	}
	start() {
		this.continueLoop = true;
	}
	stop() {
		this.continueLoop = false;
	}
	changeTimeScale(a = 1) {
		this.timeScale = a;
	}
}

export default Loop;