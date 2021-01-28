var PI2 = Math.PI*2;


class Game {
	constructor() {
		var o = this;
		o.world = {};
		o.pc = {};
		o.screen = {};
		o.loop = {};
		o.time = new Date();
		// "Elt" objects created in setupDOM
		o.invOpen = false;
	}
	gameLoop(t) {
		let o = this;
		o.advanceTime(t / 5);
		let ct = (Math.round(o.time.getMinutes()) == 0);
		//if (ct) console.time("game loop");
		o.setLight();
		o.drawTime();
		o.pc.setSight();
		o.screen.clear();
		
		o.pc.discover(o.screen.getBoundaries());
		o.pc.live(t);
		o.pc.focusOnNearest();
		if (o.pc.focus) {
			o.nameElt.innerHTML = o.pc.focus.name;
			o.verbElt.innerHTML = "[E] " + o.pc.focus.verb;
			o.nameElt.style.display = "block";
			o.verbElt.style.display = "block";
		} else {
			o.nameElt.style.display = "none";
			o.verbElt.style.display = "none";
		}

		o.world.allThings.forEach((t) => {
			t.selected = (t === o.pc.focus);
			if (t instanceof Portal) { t.checkTeleport(o.pc); }
		});
		

		if (o.invOpen) {
			o.drawInventory();
		}

		{
			let i = randInt(o.world.npcs.length) - 1; // npc index
			let npc = o.world.npcs[i];
			npc.live(t, o.isNighttime());
		}

		/*
		o.world.portals.forEach((p) => {
			p.checkTeleport(o.pc);
		});
		*/

		let c = o.screen.ctx;
		//if (ct) console.time("draw game loop");
		o.screen.draw([o.world, o.world.shrines, o.world.portals, o.world.npcs, o.pc]);		
		//if (ct) console.timeEnd("draw game loop");
	}
	advanceTime(t) {
		let o = this;
		if (o.pc.isCamping) { t *= 30; }
		else if (o.pc.isMeditating) { t *= 10; }
		o.time.setSeconds(o.time.getSeconds() + t);
	}
	drawTime() {
		let o = this;
		if (o.pc.has("watch")) {
			o.timeElt.innerHTML = o.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		}
	}
	drawInventory() {
		let o = this;
		let h = '';
		for (let item in o.pc.inventory) {
			if (o.pc.inventory[item]) {
				h += '<li>' + item + '</li>';
			}
		}
		o.itemsElt.innerHTML = h;
		h = '';
		for (let v in o.pc.virtues) {
			h += '<li>' + v + '</li>';
		}
		o.virtuesElt.innerHTML = (h) ? h : '<li>None</li>';
		o.virtueCountElt.innerHTML = (Math.ceil((o.pc.virtueCount * 100) / 8)) + "% complete";
		let people = 0;
		for (let p in o.pc.met) { people++; }
		o.peopleElt.innerHTML = people + "/" + o.world.npcs.length + " met";

	}
	isNighttime() {
		let hr = g.time.getHours();
		return (hr > 22 || hr < 6);
	}
	setLight() {
		let o = this;
		let hr = g.time.getHours();
		let l;
		if (hr > 12 && hr < 24) {
			l = (12 - (hr % 12))/10;
		} else {
			l = hr / 10;
		}
		if (o.pc.isMeditating) {
			o.world.hue = [-50,-100,50];
		} else {
			o.world.hue = [0,0,0];
		}
		o.world.light = Math.min(Math.max(l, 0.3), 1);
	}
	init() {
		let o = this;
		console.time("init/setup");
		console.log("%c☥", "font-size: 400%; color: yellow;", "\nStarting the game...");
		o.setupDOM();
		o.setupEvents();		
		o.setupData();
		o.screen.setup();
		console.timeEnd("init/setup");
		setTimeout(() => { o.intro(); }, 200);
	}
	intro() {
		let o = this;
		o.loop.stop();
		o.introElt.style.display = "block";
		o.titleElt.style.display = "block";
		o.loadingElt.style.display = "none";
		o.bodyElt.style.display = "none";
	}
	beginAdventure() {
		let o = this;
		o.loop.start();
		o.introElt.style.display = "none";
		o.titleElt.style.display = "none";
		o.invElt.style.display = "block";
		o.loadingElt.style.display = "none";
		o.bodyElt.style.display = "block";
		o.invOpen = true;
		o.pc.speak(["Where am I?", "Lost in a foreign land..."]);		
	}
	setupData() {
		let o = this;
		console.time("build world");
		let w = o.world  = new World(1200); // size 2000
		let h = o.loadingElt.innerHTML;
		function fn(txt) {
			h += txt;
			o.loadingElt.innerHTML = h;			
		}
		fn("<br>Generating terrain...");
		w.buildTerrainMarkers();
		fn("<br>Growing NPCs...");
		w.buildNPCs();
		fn("<br>Creating Shrines...");
		w.buildShrines();
		fn("<br>Building Ancient Moon Gates...");
		w.buildPortals(() => { o.win(); });
		fn("<br>Assembling the World...<br>");
		w.buildTerrain();
		console.timeEnd("build world");
		console.time("setup other data");
		o.pc = new Player(o.world, 0, 0);
		o.screen = new Screen("g", 0.25, o.pc.loc);
		o.loop = new Loop((t) => { 
			o.gameLoop(t); 
		}, 20);		
		console.timeEnd("setup other data");
	}
	setupDOM() {
		let o = this;
		o.nameElt = o.elt("what");
		o.verbElt = o.elt("verb");
		o.invElt = o.elt("inventory");
		o.timeElt = o.elt("time");
		o.itemsElt = o.elt("items");
		o.virtuesElt = o.elt("virtues");
		o.titleElt = o.elt("title");
		o.loadingElt = o.elt("loading");
		o.bodyElt = o.elt("body");
		o.winElt = o.elt("win");
		o.virtueCountElt = o.elt("virtueCount");
		o.peopleElt = o.elt("people");
		o.introElt = o.elt("intro");
	}
	elt(id) {
		return document.getElementById(id);
	}
	setupEvents() {
		let o = this;
		o.elt("beginButton").onclick = () => { o.beginAdventure(); }
		document.addEventListener("keydown", (e) => {
			e.pd = e.preventDefault;
			switch(e.keyCode){
				case 80: // p
					o.intro();
					e.pd();
					break;
				case 13: // enter
					o.beginAdventure();
					e.pd();
					break;
				case 37: // left
				case 65: // a
					o.pc.move(3);
					o.cancel();
					e.pd();
					break;
				case 38: // up
				case 87: // w
					o.pc.move(0);
					o.cancel();
					e.pd();
					break;
				case 39: // right
				case 68: // d
					o.pc.move(1);
					o.cancel();
					e.pd();
					break;
				case 40: // down
				case 83: // s
					o.pc.move(2);
					o.cancel();
					e.pd();
					break;
				case 187: o.screen.zoomIn(); break;
				case 189: o.screen.zoomOut(); break;
				case 69: // e
				case 32: // space
					o.pc.action();
					e.pd();
					break;
				case 73: // i
				case 9: // tab
					o.toggleInventory();
					e.pd();
					break;
				case 77: // m
					o.pc.toggleMeditate();
					e.pd();
					break;
				case 27: // esc
					o.cancel();
					e.pd();
					break;
				default:
					console.log(e.keyCode);
			}
		}, false);		
	}
	toggleInventory() {
		let style = this.invElt.style;
		this.invOpen = (style.display == "none");
		if (this.invOpen) {
			style.display = "block";
		} else {
			style.display = "none";
		}
	}
	cancel() {
		//this.invElt.style.display = "none";
		this.pc.cancel();
	}
	win() {
		this.bodyElt.style.display = "none";
		this.winElt.style.display = "block";
		this.titleElt.style.display = "block";
	}
}

