class Character extends Thing {
	constructor(world, x, y, f, job, trades, gossip) {
		super(world, x, y);
		let o = this;
		o.name = "Lost Person";
		o.job = job;
		o.trades = trades;
		o.verb = "talk";
		o.facing = 0;
		o.type = "NPC";
		o.color = "#fff";
		o.speed = 3;
		o.sightMin = 14;
		o.sightMultiplier = 50;		
		o.sight = 20;
		o.walkIndex = 0;
		o.traveled = 0;
		o.met = {};
		o.clarity = 0; // meditation progress 0-1
		o.focus = {}; // what the character is targeting
		o.inventory = {"boat": true, "tent": true, "water": true, "coat": true};
		o.virtues = {};
		o.virtueCount = 0;
		o.alpha = 0;
		o.askIndex = -1;
		o.gossip = (gossip instanceof Array) ? gossip : [];
		o.gossipIndex = -1;
		o.busyCooldown = 0;
		f = (f || "npc") + "_sheet";
		o.walking = [];
		o.spriteSheet = new SpriteSheet(f, (s) => {
			o.walking = [s[0], s[1], s[0], s[2]];
			o.setImage();
		});
		o.altSheet = new SpriteSheet("alt_sheet");
		o.img = null;
	}
	live(t, isNight) {
		let o = this;
		t /= 20; // TODO: adjust this scale if we change the frequency of ticks
		if (o.isMeditating) { o.meditate(t); }
		let cooled = o.cooldown();
		if (o.type == "NPC" && cooled) {
			if (isNight) {
				o.cancel();
				o.camp();
			} else if (randInt(5) == 1) {
				o.wander();
			} else {
				o.move();
			}			
		}
	}
	cooldown() {
		this.busyCooldown = Math.max((this.busyCooldown - 1), 0);
		return (this.busyCooldown <= 0) ? true : false;
	}
	focusOnNearest() {
		let o = this;
		o.focus = o.world.getNearestThing(o.loc, o.getActionDistance());		
	}
	wander() {
		if (!this.cooldown()) { return; }
		let i = randInt(4) - 1;
		this.move(i);
	}
	move(dir) {
		let o = this;
		if (!o.cooldown()) { return; }
		let l = o.loc;
		let s = o.getSpeed();
		if (typeof dir === 'undefined') { dir = o.facing; }
		o.cancel();
		if (dir == 0) { l.y -= s; }
		else if (dir == 1) { l.x += s; }
		else if (dir == 2) { l.y += s; }
		else if (dir == 3) { l.x -= s; }
		o.traveled += s;
		o.world.keepInBounds(o.loc);
		o.facing = dir;
		if (Math.round(o.traveled) % 5 == 0) {
			o.walkIndex++; 
			if (o.walkIndex >= o.walking.length) { o.walkIndex = 0; }
		}
	}
	getSpeed() {
		let o = this;
		let s = o.speed;
		let tt = o.world.getTerrainTypeAt(o.loc);
		if (tt == "W") {
			if (o.has("boat")) {
				s *= 2;
			} else {
				s /= 7;
			}
		} else if (tt == "M") {
			if (!o.has("coat")) {
				s /= 5;
			}
		} else if (tt == "D") {
			if (!o.has("water")) {
				s /= 5;
			}
		}
		return s;
	}
	getFaceLoc() {
		let o = this;
		let loc = new Coords(o.loc);
		let d = o.half;
		if (o.facing == 0) { loc.y -= d; }
		else if (o.facing == 1) { loc.x += d; }
		else if (o.facing == 2) { loc.y += d; }
		else if (o.facing == 3) { loc.x -= d; }
		return loc;		
	}
	getFootLoc() {
		let o = this;
		let loc = new Coords(o.loc);
		loc.y += o.half;
		return loc;
	}
	setImage() {
		let o = this;
		let s = o.spriteSheet.sprites;
		if (o.isMeditating) {
			o.img = o.altSheet.sprites[2];
		} else if (o.isCamping) {
			o.img = o.altSheet.sprites[3];
		} else if (o.isOnWater()) {
			o.img = o.altSheet.sprites[(o.has("boat")) ? 1 : 0];
		} else if (o.getSpeed() < o.speed) {
			o.img = o.spriteSheet.sprites[3];
		} else {
			o.img = o.walking[o.walkIndex];
		}
		if (o.facing == 1 || o.facing == 2) {
			o.img = o.img.flippedHorizontal;
		}
	}
	setSight() {
		let o = this;
		let tt = o.world.getTerrainTypeAt(o.loc);
		o.sight = o.sightMin + (o.sightMultiplier * o.world.light);
		if (o.has("torch")) {
			if (!o.isOnWater() || o.has("boat")) {
				o.sight *= 1.1;
			}
			o.sight += (randInt(30) == 1) ? 0.1 : 0;
		} else {
			if (tt == "F") {
				o.sight *= 0.5;
			}
		}
	}
	setRandomName() {
		let name = '';
		let n = randInt(2) + randInt(2);
		let s = ["al", "aka", "beth", "brit", "co", "du", "den", "far", "gen", "la", "mi", "no", "pre", "sha"];
		while (n > 0) {
			name += s[randInt(s.length - 1)];
			n--;
		}
		this.name = name.charAt(0).toUpperCase() + name.slice(1);
	}
	isOnWater() {
		let tt = this.world.getTerrainTypeAt(this.loc);
		return (tt == "W");
	}
	has(thing) {
		return (this.inventory[thing]);
	}
	discover(bounds) {
		let o = this;
		let faceLoc = o.getFaceLoc();
		/*
		let footLoc = o.getFootLoc();
		let w = o.isOnWater();
		*/
		o.world.loopOverTerrainInBounds((t) => {
			let d = faceLoc.getDistance(t.loc);
			t.visible = (d <= o.sight);
			if (t.visible) {
				t.discovered += 0.15;
				t.discovered = Math.min(t.discovered, 1);
			} else if (d <= (o.sight * 1.1)) {
				if (t.discovered < 0.6) {
					t.discovered += 0.05;
				}
			}
			/*
			if (!w) {
				let a = footLoc.getDistance(t.loc);
				if (a < 3) {
					t.hp = (a < 1) ? 0.7 : 0.8;
				} else {
					t.hp += 0.001;
					t.hp = Math.min(t.hp, 1);
				}
			}
			*/
		}, bounds);
		o.world.allThings.forEach((thing) => {
			let d = o.loc.getDistance(thing.loc);
			if (d <= o.sight) {
				thing.discovered += 0.1;
				thing.alpha = Math.min(thing.discovered, 1);
			} else {
				if (thing.discovered >= 1) {
					thing.alpha = 0.3;
				} else {
					thing.alpha = 0;
				}
			}
		});
	}	
	getActionDistance() {
		return Math.min(30, this.sight);
	}
	action() {
		let o = this;
		if (o.isCamping || o.isMeditating) {
			o.cancel();
			return;
		}
		o.focusOnNearest();
		if (o.focus) {
			if (o.focus instanceof Character) {
				o.ask(o.focus);
			} else if (o.focus instanceof Shrine) {
				o.toggleMeditate();
			} else if (o.focus instanceof Portal) {
				if (o.has("moonstone")) {
					o.focus.activateRed();
					o.speak("A transdimensional red moon gate!");
				} else {
					o.focus.toggle();
				}
			}
		} else {
			o.camp();
		}
	}
	camp() {
		let o = this;
		if (o.has("tent") && !o.isOnWater()) {
			o.isCamping = true;
			o.facing = -1;
			o.setImage();
		}
	}
	toggleMeditate() {
		let o = this;
		o.isMeditating = !o.isMeditating;
		if (!o.isMeditating) { o.cancel(); }
		o.setImage();
	}
	meditate(t) {
		let o = this;
		let spk = "∞";
		o.clarity += 0.001 * ((o.virtueCount/3) + 1) * t;
		o.clarity = Math.min(1, o.clarity);
		let clear = (o.clarity >= 1);
		o.facing = -1;
		
		if (o.focus instanceof Shrine) {
			spk = "-" + o.focus.mantra + "-";
			if (clear) {
				o.virtues[o.focus.virtue] = true;
				spk = ["I know the wisdom", "of " + o.focus.virtue];
			} else {
				spk += " (" + Math.ceil(o.clarity * 100) + "%)";
			}
		}
		o.virtueCount = 0;
		for (let v in o.virtues) {
			o.virtueCount++;
		}
		if (o.virtueCount >= 8) {
			o.inventory["enlightenment"] = true;
			spk = ["I have gained", "enlightnment of", "all 8 virtues."];
		}
		o.speak(spk);
	}
	cancel() {
		let o = this;
		o.isCamping = false;
		o.isMeditating = false;
		o.clarity = 0;
		o.label = "";
		o.setImage();
	}
	ask(char) {
		let o = this;
		let maxAskIndex = (char.gossip.length) ? 3 : 2;
		o.cancel();
		char.cancel();
		o.askIndex++;
		if (o.askIndex > maxAskIndex) { o.askIndex = 0; }
		if (o.askIndex == 0) {
			//o.speak("Name?");
			if (char.name == "Lost Person") { char.setRandomName(); }
			char.speak(["Name?", "I am " + char.name + "."]);
			o.met[char.name] = 1;
		} else if (o.askIndex == 1) {
			//o.speak("Job?");
			char.speak(["Job?", "I am a " + char.job + "."]);
		} else if (o.askIndex == 2) {
			let deal, demand, supply, dealSupply;
			//o.speak("Trade?");
			for (supply in char.trades) {
				demand = char.trades[supply];
				if (demand == "free" || o.has(demand)) {
					deal = demand;
					dealSupply = supply;
				}
			}
			if (deal == "free") {
				char.speak("Take this " + dealSupply + " for free.");
				char.give(dealSupply, o);
			} else if (deal) {
				char.speak("Take this " + dealSupply + " for your " + demand + ".");
				char.trade(dealSupply, demand, o);
			} else {
				char.speak("I will trade " + demand + " for " + supply + ".");
			}
		} else if (o.askIndex == 3) {
			char.gossipIndex++;
			if (char.gossipIndex > (char.gossip.length - 1)) { char.gossipIndex = 0; }
			char.speak(char.gossip[char.gossipIndex]);
		}
		char.busyCooldown = 10;
	}
	give(wut, whom) {
		this.inventory[wut] = false;
		whom.inventory[wut] = true;
	}
	trade(give, take, whom) {
		whom.give(take, this);
		this.give(give, whom);
	}
	speak(wut) {
		let m = 20;
		if (typeof wut == "string" && wut.length > m) {
			let wArr = wut.split(" ");
			let words = "";
			wut = [];
			wArr.forEach((w, i) => {
				if (i == 0) {
					words = w;
				} else {
					if (w.length + words.length < m) {
						words += " " + w;
					} else {
						wut.push(words);
						words = w;
					}
					if (i == (wArr.length - 1)) {
						wut.push(words);
					}				
				}
			});
		}
		this.label = wut;
	}
} 