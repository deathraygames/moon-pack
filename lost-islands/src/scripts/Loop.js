class Loop {
	constructor(fn, t) {
		this.wait = t;
		this.timer = null;
		this.fn = fn;
	}
	start() {
		this.next(new Date());
	}
	next(last) {
		let o = this;
		let start = new Date(); // Now
		let t = start - last; // How long it's been since last run
		o.fn(t);
		let took = (new Date()) - start; //  How long the fn took
		let wait = Math.max(o.wait - took, 1); // How long should we wait
		o.timer = window.setTimeout(() => { o.next(start); }, wait);
	}
	stop() {
		window.clearInterval(this.timer);
	}
}