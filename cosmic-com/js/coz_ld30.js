
window.cc = {
	// Connections/Requirements
	sound: window.soundCannon
	,loop: new GameLoop()
	// Planets
	,planetNames: ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", 
		"Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", 
		"Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi",
		"Psi", "Omega"
	]
	,planets: [
		{
			population: 150000000
			,satellites: 1
			,satBuildPercent: 0
			,customers: 0
			,fuelCost: 1000
			,size: 5
			,color: "rgb(102,153,255)"
			,isLocked: false
		}
	]
	,base: {
		fuel: 0
		,money: 0
		,engineerUpgrades: 0
		,marketingUpgrades: 0
	}
	,planetCount: 0
	,totalSatellites: 0
	,totalCustomers: 0
	,totalProfitPerSecond: 0
	//,planetCapacity: 0
	,planetSatCost: 0
	// Upgrades
	,engineerUpgradeCost: 0
	,marketingUpgradeCost: 0
	// Per Click Values
	,buildPerClick: 0
	,acquirePerClick: 0
	
	,elts: { }
	,currentPlanetIndex: 0
	,background: { x: 0, y: 0 }
}

cc.drawStats = function() {
	var thisPlanet = this.planets[this.currentPlanetIndex];
	//console.log(this);
	this.elts.population.innerHTML =	thisPlanet.population.toLocaleString();
	this.elts.satellites.innerHTML = 	thisPlanet.satellites;
	this.elts.satBuildPercent.innerHTML = thisPlanet.satBuildPercent;
	this.elts.customers.innerHTML =		parseInt(thisPlanet.customers).toLocaleString();
	this.elts.fuelCost.innerHTML = 		thisPlanet.fuelCost;
	this.elts.fuel.innerHTML = 			this.base.fuel;
	this.elts.money.innerHTML = 		Math.floor(this.base.money).toLocaleString();
	this.elts.planetCount.innerHTML = 	this.planetCount;
	this.elts.totalSatellites.innerHTML = 		this.totalSatellites;
	this.elts.totalCustomers.innerHTML = 		parseInt(this.totalCustomers).toLocaleString();
	this.elts.totalProfitPerSecond.innerHTML = 	this.totalProfitPerSecond.toLocaleString();
	//this.elts.planetCapacity.innerHTML = 		this.planetCapacity;
	this.elts.planetSatCost.innerHTML = 		this.planetSatCost;
	this.elts.planetCustomersPercent.innerHTML = Math.floor( (thisPlanet.customers / thisPlanet.population) * 100 )
	// Upgrades
	this.elts.engineerUpgrades.innerHTML = 		this.base.engineerUpgrades;
	this.elts.marketingUpgrades.innerHTML = 	this.base.marketingUpgrades;
	this.elts.engineerUpgradeCost.innerHTML = 	this.engineerUpgradeCost.toLocaleString();
	this.elts.marketingUpgradeCost.innerHTML = 	this.marketingUpgradeCost.toLocaleString();
	// Per Click
	this.elts.buildPerClick.innerHTML = 	this.buildPerClick;
	this.elts.acquirePerClick.innerHTML = 	this.acquirePerClick;
	
}
cc.drawPlanets = function() {
	var h = "";
	for (var i = 0; i < this.planets.length; i++) {
		h += '<li class="clickable '
			+ ((i == this.currentPlanetIndex) ? 'here' : '')
			+ '" data-pid="' + i + '">'
			+ '<div class="planet" style="' + this.getPlanetStyle(i) + '">'
			+ this.planetNames[i] 
			+ '</div></li>';
	}
	if (this.planets.length < this.planetNames.length) {
		h += '<li class="unlock clickable">'
			+ '<div class="planet unlock">'
			+ 'Unlock Planet<br />(' 
			+ parseInt(this.getPlanetUnlockCost()).toLocaleString() + ' gc)'
			+ '</div></li>';
	}
	$('.planetList').html(h);
}
cc.openPlanets = function() {
	cc.drawPlanets();
	$('.planets').fadeIn();
}
cc.closePlanets = function() {
	$('.planets').slideUp();
}
cc.drawFuelOrFlyDirections = function() {
	if (this.base.fuel >= 100) {
		$('.fuelDirections').hide();
		$('.flyDirections').slideDown();
	} else {
		$('.fuelDirections').slideDown();
		$('.flyDirections').hide();
	}
}
cc.drawCurrentPlanet = function() {
	var thisPlanet = this.planets[this.currentPlanetIndex];
	var $planetBox = $('.planetBox');
	$planetBox.find('.h').html("Planet: " + this.planetNames[this.currentPlanetIndex] );
	$planetBox.find('.planet').attr("style", this.getPlanetStyle());
	this.drawStats();
}





cc.incrementTime = function(t) {
	this.setCalculatedStats();
	
	this.base.money += this.totalProfitPerSecond * t;
}

cc.setCalculatedStats = function() {
	var planet;
	this.planetCount = this.planets.length;
	this.totalCustomers = 0;
	this.totalSatellites = 0;
	for (var i = 0; i < this.planetCount; i++) {
		planet = this.planets[i];
		this.totalCustomers += planet.customers;
		this.totalSatellites += planet.satellites;
	}
	
	var thisPlanet = this.planets[this.currentPlanetIndex];
	this.planetSatCost = Math.round(Math.pow(100, 1 + (thisPlanet.satellites * 0.1)));
	//this.planetCapacity = 1; // *** Should be based off # of satellites
	var profitPerCustomerPerSecond = 0.1;
	this.totalProfitPerSecond = profitPerCustomerPerSecond * this.totalCustomers;
	// Upgrades
	this.engineerUpgradeCost = Math.round(Math.pow(1000, 1 + (this.base.engineerUpgrades * 0.05)));
	this.marketingUpgradeCost = Math.round(Math.pow(1000, 1 + (this.base.marketingUpgrades * 0.05)));
	// Per Click
	this.buildPerClick = 1 + (this.base.engineerUpgrades * 0.5);
	this.acquirePerClick = 10 * thisPlanet.satellites * (1 + (this.base.marketingUpgrades * 0.5));
	
}

cc.getPlanetUnlockCost = function() {
	if (this.planets.length == 1)	return 0;
	else return parseInt( Math.pow(1000, 1 + (this.planets.length * 0.2)) );
}
cc.getPlanetStyle = function(planetIndex) {
	if (typeof planetIndex === 'undefined') planetIndex = this.currentPlanetIndex;
	var planet = this.planets[planetIndex];
	var s = "background-color: " + planet.color + ";"
		+ "width: " + planet.size + "em;"
		+ "height: " + planet.size + "em";
	return s;
}



//======================================== Actions

cc.buildSatellite = function() {
	var thisPlanet = this.planets[this.currentPlanetIndex];
	if (thisPlanet.satBuildPercent >= 100) {
		thisPlanet.satBuildPercent = 0;
		thisPlanet.satellites += 1;
		return true;
	} else if (this.base.money >= this.planetSatCost) {
		this.base.money -= this.planetSatCost;
		thisPlanet.satBuildPercent += this.buildPerClick;
		return true;
	} else {
		return false;
	}
}

cc.acquireCustomers = function() {
	var thisPlanet = this.planets[this.currentPlanetIndex];
	
	thisPlanet.customers += this.acquirePerClick;
	if (thisPlanet.customers > thisPlanet.population) {
		thisPlanet.customers = thisPlanet.population;
	}
}

cc.buyEngineers = function() {
	if (this.base.money >= this.engineerUpgradeCost) {
		this.base.money -= this.engineerUpgradeCost;
		this.base.engineerUpgrades += 1;
		return true;
	} else {
		return false;
	}
}

cc.buyMarketing = function() {
	if (this.base.money >= this.marketingUpgradeCost) {
		this.base.money -= this.marketingUpgradeCost;
		this.base.marketingUpgrades += 1;
		return true;
	} else {
		return false;
	}	
}

cc.unlockPlanet = function() {
	var planetCost = this.getPlanetUnlockCost();
	if (this.planets.length >= this.planetNames.length) {
		return false;
	} else if (this.base.money >= planetCost) {
		this.base.money -= planetCost;
		var size = dice.roll1d(10);
		var color = "rgb(" + dice.roll1d(255) 
			+ "," + (dice.roll1d(235) + 20)
			+ "," + (dice.roll1d(235) + 20)
			+ ")";
		var planet = {
			population: 		(dice.roll1d(20) * size * 1000000)
			,satellites: 		0
			,satBuildPercent: 	0
			,customers: 		0
			,fuelCost: 			dice.roll1d(20) * 100
			,size: 				size
			,color:				color
			,isLocked: 			false
		};
		this.planets.push(planet);
		this.drawPlanets();
		return true;
	} else {
		return false;
	}
}

cc.fuelOrFly = function() {
	var thisPlanet = this.planets[this.currentPlanetIndex];
	
	if (this.base.fuel >= 100) {
		this.openPlanets();
		return true;
	} else {
		if (this.base.money >= thisPlanet.fuelCost) {
			this.base.money -= thisPlanet.fuelCost;
			this.base.fuel += 1;
			this.drawFuelOrFlyDirections();
			return true;
		} else {
			return false;
		}
	}
}

cc.flyTo = function(planetIndex) {
	if (this.base.fuel >= 100) {
		this.closePlanets();
		var distance = Math.abs( this.currentPlanetIndex - planetIndex );
		// *** do fuel based on distance?
		var fuelUsed = distance * 10;
		this.base.fuel -= fuelUsed;
		if (this.base.fuel < 0) this.base.fuel = 0;
		this.currentPlanetIndex = planetIndex;
		this.drawCurrentPlanet();
		this.drawFuelOrFlyDirections();
		return true;
	} else {
		return false;
	}
}



cc.setup = function() {
	var o = this;
	$(document).ready(function(){
		o.elts.population = $('.planetPopulation')[0];
		o.elts.satellites = $('.planetSatellites')[0];
		o.elts.satBuildPercent = $('.planetSatBuildPercent')[0];
		o.elts.customers = $('.planetCustomers')[0];
		o.elts.fuelCost = $('.planetFuelCost')[0];
		o.elts.fuel = $('.fuel')[0];
		o.elts.money = $('.money')[0];
		o.elts.planetCount = $('.planetCount')[0];
		o.elts.totalSatellites = $('.totalSatellites')[0];
		o.elts.totalCustomers = $('.totalCustomers')[0];
		o.elts.totalProfitPerSecond = $('.totalProfitPerSecond')[0];
		o.elts.planetCapacity = $('.planetCapacity')[0];
		o.elts.planetSatCost = $('.planetSatCost')[0];
		o.elts.planetCustomersPercent = $('.planetCustomersPercent')[0];
		// upgrades
		o.elts.engineerUpgrades = $('.engineerUpgrades')[0];
		o.elts.marketingUpgrades = $('.marketingUpgrades')[0];
		o.elts.engineerUpgradeCost = $('.engineerUpgradeCost')[0];
		o.elts.marketingUpgradeCost = $('.marketingUpgradeCost')[0];
		// Per Click
		o.elts.buildPerClick = $('.buildPerClick')[0];
		o.elts.acquirePerClick = $('.acquirePerClick')[0];
		
		
		$('.clickable').mousedown(function(e){ e.preventDefault(); });
		
		$('.satellites').click(function(e){
			o.buildSatellite();
		});
		$('.customers').click(function(e){
			o.acquireCustomers();
		});
		$('.ship').click(function(e){
			o.fuelOrFly();
		});
		$('.engineers').click(function(e){
			o.buyEngineers();
		});
		$('.marketing').click(function(e){
			o.buyMarketing();
		});
		$('.planetList').on("click", "li", function(e){
			var $li = $(this);
			if ($li.hasClass("unlock")) {
				o.unlockPlanet();
			} else {
				var pid = parseInt($li.data("pid"));
				o.flyTo(pid);
			}
		});
		$('.closePlanets').click(function(e){
			o.closePlanets();
		});
		
		o.base.fuel = 50;
		o.drawFuelOrFlyDirections();
		o.loop.start();
		
		o.backgroundTimer = setInterval(function(){
			o.background.y += 0.9;
			o.background.x += 0.2;
			$('body').css("background-position", parseInt(o.background.x) + "px " + parseInt(o.background.y) + "px");
		}, 1000);
	});
}



//====================================================== CONNECT WITH LOOP ====
cc.loop.everyIterationFunction = function() {
	cc.incrementTime( 1/60 );
	cc.drawStats();
}

//========================== START IT UP
cc.setup();
