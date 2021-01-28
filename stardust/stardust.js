// Globals
var PI2 = Math.PI*2;

// Coordinate class
function Coords(x,y){
    this.x = (typeof x == 'number') ? x : 0;
    this.y = (typeof y == 'number') ? y : 0;
}
Coords.prototype.set = function(coord){
    coord.check();
    this.x = coord.x;
    this.y = coord.y;
}
Coords.prototype.add = function(coord){
    coord.check();
    this.x += coord.x;
    this.y += coord.y;
    return this;
}
Coords.prototype.multiply = function(n){
    this.x *= n;
    this.y *= n;
    return this;
}
Coords.prototype.getMultiply = function(n){
    var x = this.x * n;
    var y = this.y * n;
    return new Coords(x, y);
}
Coords.prototype.getDot = function(coord){
    coord.check();
    // A dot B = ||A|| ||B|| cos theta ?
    // this.getMagnitude() * coord.getMagnitude()    ???
    return ((this.x * coord.x) + (this.y * coord.y));
}
Coords.prototype.clear = function(){
    this.x = 0;
    this.y = 0;
    return this;
}
Coords.prototype.setTangent = function(){
    var x = this.x;
    this.x = this.y;
    this.y = x;
    return this;
}
Coords.prototype.getDistance = function(coord){
    coord.check();
    return Math.sqrt(
        Math.pow( (this.x - coord.x), 2)
        + Math.pow( (this.y - coord.y), 2)
    );
}
Coords.prototype.getUnitVector = function(coord){
    coord.check();
    var x = 0, y = 0;
    var d = Math.abs(this.getDistance(coord));
    if (this.x != coord.x) {
        var dx = coord.x - this.x;
        x =  dx / d;
    }
    if (this.y != coord.y) { 
        var dy = coord.y - this.y;
        y = dy / d;
    }
    return new Coords(x, y);
}
Coords.prototype.getMagnitude = function(){
    return Math.sqrt(
        Math.pow(this.x, 2)
        + Math.pow(this.y, 2)
    );
}
Coords.prototype.isEqual = function(coord){
    return (this.x == coord.x && this.y == coord.y);
}
Coords.prototype.isEqualInteger = function(coord){
    return (Math.round(this.x) == Math.round(coord.x) && Math.round(this.y) == Math.round(coord.y));
}
Coords.prototype.check = function(){
    if (typeof this.x != "number") {
        console.error("Bad coord.x", this.x);
        this.x = 0;
    }
    if (typeof this.y != "number") {
        console.error("Bad coord.y", this.y);
        this.y = 0;
    }    
}




////////////////////////////////////////////////////////

function ObjectClass(n,x,y) {
    this.name = n;
    this.pos = new Coords(x,y);
    this.vel = new Coords(0,0);
    this.acc = new Coords(0,0);
    this.force = new Coords(0,0);
    this.impulse = new Coords(0,0);
    this.fireArea = 0;
    this.earthArea = 0;
    this.airArea = 0;
    this.waterArea = 0;
    this.fireSize = 0;
    this.earthSize = 0;
    this.waterSize = 0;
    this.airSize = 0;
    this.mass = 0;
    this.color = { r: 80, g: 70, b: 50 };
    this.isMassAbsorbing = true;
    this.isPlasma = false;
    this.illumination = 0;
    this.luminosity = 0;
    this.density = 1;
    this.heat = 0;
    this.isFrozen = false;
    this.isBoiling = false;
    this.life = 0;
    this.evolution = 0; // 0-100%
}
ObjectClass.prototype.hotThreshold = 900;
ObjectClass.prototype.absorbEarthRate = 0.5;
ObjectClass.prototype.absorbWaterRate = 2;
ObjectClass.prototype.absorbAirRate = 4;
ObjectClass.prototype.bigG = 0.5;

ObjectClass.prototype.absorbEarth = function(b){
    if (this.isMassAbsorbing && b.isMassAbsorbing) {
        var a = this.absorbEarthRate;
        if (this.isPlasma) a *= 10;
        else a *= (this.mass/b.mass);
        a = Math.min(b.earthArea, a)
        this.earthArea += a;
        b.earthArea -= a;
    }
}
ObjectClass.prototype.absorbWater = function(b){   
    if (b.waterArea > 0) {
        var a = (b.isFrozen) ? this.absorbEarthRate : this.absorbWaterRate;
        a *= (this.mass/b.mass);
        a = Math.min(b.waterArea, a);
        this.waterArea += a;
        b.waterArea -= a;
    }
}
ObjectClass.prototype.absorbAir = function(b){   
    if (b.airArea > 0) {
        var a = this.absorbAirRate * (this.mass/b.mass);
        a = Math.min(b.airArea, a);
        this.airArea += a;
        b.airArea -= a;
    }
}
ObjectClass.prototype.setMass = function(){
    this.mass = ((this.fireArea + this.earthArea) * this.density)
        + (this.waterArea / 2)
        + (this.airArea / 4);
    return this;
}
ObjectClass.prototype.setRadiusSizes = function(){
    var o=this;
    o.fireSize = Math.sqrt(o.fireArea / Math.PI);
    var a = this.fireArea + o.earthArea;
    o.earthSize = Math.sqrt(a / Math.PI);
    if (o.waterArea > 0) {
        a += o.waterArea;
        o.waterSize = Math.sqrt(a / Math.PI);
    } else {
        o.waterSize = 0;
    }
    if (o.airArea > 0) {
        a += o.airArea;
        o.airSize = Math.sqrt(a / Math.PI);
    } else {
        o.airSize = 0;
    }
    return this;
}
ObjectClass.prototype.setNewCollisionVels = function(o2, elasticity){
    // http://www.gamasutra.com/view/feature/131424/pool_hall_lessons_fast_accurate_.php?page=3
    var o1 = this;
    if (o1.mass <= 0 || o2.mass <= 0) {
        return false;
    }
    //console.log(o1.name, o2.name);
    //console.log("original", o1.vel.x, o1.vel.y, o2.vel.x, o2.vel.y);
    //console.log("momentum before", (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude()));
    var p = (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude());
    var n = o1.pos.getUnitVector(o2.pos);
    //console.log("n = ", n);
    var a1 = o1.vel.getDot(n);
    var a2 = o2.vel.getDot(n);
    var optimizedP = (2 * (a1 - a2)) / (o1.mass + o2.mass);
    o1.vel.add( n.getMultiply(-1 * optimizedP * o2.mass) );
    o1.vel.multiply(elasticity);
    o2.vel.add( n.getMultiply(optimizedP * o1.mass) );
    o1.vel.multiply(elasticity);
    //var pNew = (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude());
    //console.log(pNew - p);
    //if (pNew > p) {
         //console.log(o1.name, o2.name, "pNew > p", pNew, p);
    //}else console.log(o1.name, o2.name, "pNew <= p", pNew, p);
    //console.log("after", newV1.x, newV1.y, newV2.x, newV2.y);
    //console.log("momentum after", (o1.mass * o1.vel.getMagnitude()) + (o2.mass * o2.vel.getMagnitude()));
	return true;
}
ObjectClass.prototype.physicsOneObject = function(b){
    var o=this;
    if (b.mass > 0) {
        var r = o.pos.getDistance(b.pos);
        var mm, lm; // More Massive, Less Massive
        var edgeToEdgeDistance = r - o.earthSize - b.earthSize;
        var waterToWaterDistance = r - o.waterSize - b.waterSize;
        var airToAirDistance = r - o.airSize - b.airSize;
            
        // Calculate illumination
        if (b.isPlasma && edgeToEdgeDistance <= 3000) {
            var lum = 1 - (edgeToEdgeDistance / 3000);
            o.illumination += lum;
            o.heat += (lum * 1000);
        }
        
        // Get the absorder (mm = more massive) 
		// and the absorbee (lm = less massive)
        if ((o.mass >= b.mass && !b.isPlasma) || (o.isPlasma && !b.isPlasma)) {
            mm = o;
            lm = b;
        } else {
            mm = b;
            lm = o;
        }
        
        if (Math.round(edgeToEdgeDistance) <= 0) {    // Earth Collision! No gravity
 
            mm.absorbEarth(lm);
            mm.absorbWater(lm);
            mm.absorbAir(lm);
            
            // Collision overlap issues
            o.collisionHeat += 10;
            
            var pushBack = (edgeToEdgeDistance / 1);
            if (b.isPlasma || o.isPlasma) {
                o.vel.multiply(0.9);                
            } else {
                
                if (o.mass <= b.mass) {
                    o.pos.add( o.pos.getUnitVector(b.pos).multiply(pushBack) );
                } else {
                    b.pos.add( b.pos.getUnitVector(o.pos).multiply(pushBack) );           
                }
                o.setMass().setRadiusSizes();
                
                var elas = 0.9; // (o.isPlasma) ? 0.1 : 0.9;
                o.setNewCollisionVels(b, elas);
            }
            // Damage to life
            o.damageLife(o.life/100);
            b.damageLife(b.life/100);
            
        } else {                // Gravity, not collided
            // Apply gravity forces
            //F = G (m1 m2) / r^2
            // http://en.wikipedia.org/wiki/Newton's_law_of_universal_gravitation#Vector_form            
            //console.log("Forces on", this.name, " due to ", b.name);
            var rv = o.pos.getUnitVector(b.pos);
            //console.log("unit vector", JSON.stringify(rv));
            
            var Gmm = o.bigG * o.mass * b.mass;
            var rSquared = Math.pow( r, 2);
            var n = (rSquared == 0) ? 0 : (Gmm/rSquared);
            rv.multiply(n);
            //console.log(JSON.stringify(rv));
            o.force.add(rv);
            //console.log("physics", i, b, this.bigG, this.mass, b.mass);
            //console.log(rSquared, rv, fm);
            
            if (Math.round(waterToWaterDistance) <= 0) {
                o.vel.multiply(0.9);
                mm.absorbWater(lm);
                mm.absorbAir(lm);
            } else if (Math.round(airToAirDistance) <= 0) {
                o.vel.multiply(0.95);
                mm.absorbAir(lm);
            }
        }
    } 
}
ObjectClass.prototype.physics = function(nearbyEnts){
    var o=this;
    var ne;
    // time = 1
    o.setMass().setRadiusSizes();
    
    if (o.collisionHeat > 0) o.collisionHeat -= 1;
    
    if (o.isPlasma) {
        o.heat = 1000;
        o.illumination = 1;
    } else {
        o.heat = 0;
        o.illumination = 0;
    }
    
    
    for(var i = 0; i < nearbyEnts.length; i++) {
        ne = nearbyEnts[i];
        o.physicsOneObject(ne);
    }
    
    if (o.illumination > 1) o.illumination = 1;
    if (o.heat > o.hotThreshold) {
        o.isFrozen = false;
        o.isBoiling = true;        
        var a = Math.min(o.waterArea, 10);
        o.waterArea -= a;
        o.airArea += a;
        var a = Math.min(o.waterArea, 2);
        o.airArea -= a;

        o.damageLife(100);
    } else if (o.heat <= 0) {
        o.isFrozen = true;
        o.isBoiling = false;        
    } else {
        o.isFrozen = false;
        o.isBoiling = false;
    }

    if (o.mass > 0) {
        // Friction to slow down suns
        //if (o.isPlasma) o.vel.multiply(0.99);
        // Standard physics...
        o.force.add(o.impulse);
        var forceAcc = new Coords((o.force.x / o.mass), (o.force.y / o.mass));
        o.acc.add(forceAcc);
        o.vel.add(o.acc);
        o.pos.add(o.vel);
        o.acc.clear();
        o.force.clear();
    } else {
        //console.log(o.name + " has mass zero");
    }
}
ObjectClass.prototype.damageLife = function(a){
    var o=this;
    if (o.life > 0) {
        o.life -= Math.min(o.life, Math.random() * a);
    }
    if (this.life <= 0) {
        o.life = 0;
        o.evolution -= 1;
        if (o.evolution < 0) o.evolution = 0;
    }
}
ObjectClass.prototype.checkLife = function(){
    var o=this;
    if (o.earthArea > 1000 && o.waterArea > 1000 
        && o.airArea > 1000 && o.heat > 0) 
    {
        if (o.evolution < 100) {
            o.evolution++;
        } else {
            o.life += Math.random() * 5;
        }
        
    } else {
        o.damageLife(5);
    }
}
ObjectClass.prototype.getColorString = function(type){
    var o = this;
    var lum = Math.max(o.illumination, 0.35);
    var c = [];
    switch (type){
        case "earth":
        case "fire":      c = [o.color.r, o.color.g, o.color.b];  break;
        case "water":     c = [0,100,255]; break;
        case "air":       c = [230,200,240]; break;
    }
    if (o.isFrozen) {
        if (type == "water") { c = [200,200,255]; }
    } else if (o.isBoiling) {
        var heatOver = (o.heat - o.hotThreshold);
        c[0] += (heatOver / 2);
    }
	if (o.collisionHeat > 0) c[0] = 255;
    var cStr = "rgb(" 
        + Math.min(Math.floor(c[0] * lum), 255)
        + "," + Math.min(Math.floor(c[1] * lum), 255)
        + "," + Math.min(Math.floor(c[2] * lum), 255)
        + ")";
    //console.log(c);
    return cStr;
}




////////////////////////////////////////////////////////

g = {
    maxEnts: 240,
    ents: [],
    stars: [],
    bgStars: [],
    particles: [],
    intId: 0,
    iteration: 0,
    endIter: 53000,
    timeBetweenIntervals: 30,
    lifeIntId: 0,
    timeBetweenLifeIntervals: 1000,
    size: null, // screen size
    halfSize: null,
    player: null,
    galaxySize: 6000,
    canvasElt: null,
    introElt: null,
    isWon: false,
    isObjectInfoOn: false,
	isSplash: true
};
g.getRandomAround = function(n){
    var a = Math.random() * n;
    var b = Math.random() * n;
    return (a-b);
}
g.draw = function(){
    var o = this;
    ctx.clearRect(0,0,o.size.x,o.size.y);
    //ctx.fillRect(0,0,100,100);
    ctx.beginPath();
    var star, p, ent;
    var i, el = o.ents.length;
    var r = 0, g = 0, b = 0;;
    var x, y;
    var nearestSun = null;
    var sunCount = 0;
    //console.log(this.player.pos.x);
    var offsetX = -1 * o.player.pos.x + o.halfSize.x,
        offsetY = -1 * o.player.pos.y + o.halfSize.y,
        sOX = offsetX/1.2,
        sOY = offsetY/1.2,
        bgSOX = offsetX/2,
        bgSOY = offsetY/2;
    //console.log(offsetX, offsetY, sOX);
    // Draw background stars
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;    
    ctx.save();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 80;
    
    for(i = 0; i < o.stars.length; i++) {
        star = this.stars[i];
        //console.log(star);
        x = star.pos.x + sOX;
        y = star.pos.y + sOY;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, star.size, 0, PI2, true);
        ctx.fillStyle = "#aa8";
        ctx.fill();
        ctx.closePath();
    }
    for(i = 0; i < o.bgStars.length; i++) {
        star = this.bgStars[i];
        //console.log(star);
        x = star.pos.x + bgSOX;
        y = star.pos.y + bgSOY;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, star.size, 0, PI2, true);
        ctx.fillStyle = "#aa8";
        ctx.fill();
        ctx.closePath();
    }    
    
    ctx.restore();
    
    for(i = 0; i < el; i++){
        ent = this.ents[i];
        if (ent.isPlasma && ent.earthSize > 0) {
            x = ent.pos.x + offsetX;
            y = ent.pos.y + offsetY;
            ctx.arc(x, y, ent.earthSize, 0, PI2, true);
            ctx.fillStyle = ent.getColorString("fire");
            ctx.closePath();
            ctx.fill();            
            ctx.save();
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 30;
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            // Get distance to player
            nearestSun = ent.pos.getDistance(o.player.pos);
            sunCount++;
        }
    }
    
    
    for(i = 0; i < el; i++){
        ent = this.ents[i];
        if (!ent.isPlasma) {
            x = ent.pos.x + offsetX;
            y = ent.pos.y + offsetY;
//console.log(ent.isShip, "x", x, "ent pos x", ent.pos.x, "player pos x", this.player.pos.x, "halfsize x", o.halfSize.x, "size x", o.size.x);            
            ctx.beginPath();
            ctx.moveTo(x, y);
         
            if (ent.earthSize > 0) {
                ctx.save();
                ctx.arc(x, y, ent.earthSize, 0, PI2, true);
                ctx.fillStyle = ent.getColorString("earth");
                ctx.closePath();
                ctx.fill();
            }
            if (ent.waterSize > 0) {
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.arc(x, y, ent.waterSize, 0, PI2, true);
                ctx.fillStyle = ent.getColorString("water");
                ctx.fill();
                ctx.restore();
            }
            if (ent.airSize > 0) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.arc(x, y, ent.airSize, 0, PI2, true);
                ctx.fillStyle = ent.getColorString("air");
                ctx.fill();
                ctx.restore();                
            } 
        }
        if (ent.mass > 10) {
            o.drawText(ent, x, y);
        }

        //ctx.stroke();
    } // end for loop over ents
    if (o.isObjectInfoOn) {
        ctx.fillStyle = "#999";
        ctx.fillText("-¤ StarDust ¤- "
            + o.ents.length + " objects (" 
            + sunCount + " sun" + ((sunCount==1) ? "":"s") 
            + "), nearest sun: " 
            + (Math.round(nearestSun/100)*100) , 20,20);
    }
}
g.drawText = function(ent, x, y){
    var R = Math.round;
    ctx.font = "14px Verdana";
    if (this.player.isElementScanOn) {
        var esx = x + ent.earthSize + 8;
        ctx.fillStyle = "#ccc";
        ctx.fillText(R(ent.earthArea) + "e" , esx, y-12);
        ctx.fillText(R(ent.waterArea) + "w" , esx, y);
        ctx.fillText(R(ent.airArea) + "a" , esx, y+12);
    }
    if (this.player.isThermoScanOn) {
        if (ent.isFrozen) ctx.fillStyle = "#33a";
        else if (ent.isBoiling) ctx.fillStyle = "#a33";
        else ctx.fillStyle = "#ec3";
        ctx.fillText("" + R(ent.heat) + "°", x - 10, y + ent.earthSize + 24);           
    }
    if (ent.life > 0) {
        ctx.fillStyle = "#6f6";
        ctx.fillText("Life: " + R(ent.life) , x-30, y-24);
    } else if (ent.evolution > 0) {
        ctx.fillStyle = "#6f6";
        ctx.fillText("evolution: " + R(ent.evolution) + "%", x-45, y-30);
    } 
}
g.makeEnt = function(n,x,y,s){
    if (typeof x == 'undefined') x = this.player.pos.x;
    if (typeof y == 'undefined') y = this.player.pos.y;
    if (typeof s == 'undefined') s = (Math.random() * 8) + 1;
    var sz = Math.max(this.size.x, this.size.y);
    x += this.getRandomAround(sz);
    y += this.getRandomAround(sz);
    var ent = new ObjectClass(n,x,y);
    ent.vel.x = this.getRandomAround(20);
    ent.vel.y = this.getRandomAround(20);
    // Set areas
    ent.earthArea = Math.PI * Math.pow(s, 2);
    if (Math.random() < 0.2) {
        ent.waterArea = Math.random() * 300 + 100;
    }
    if (Math.random() < 0.25) {
        ent.airArea =  Math.random() * 300 + 100;
    }
    ent.setMass();
    ent.setRadiusSizes();
    this.ents.push(ent);
    return ent;
}
g.makeEnts = function(n){
    if ((this.ents.length+n) <= this.maxEnts) {
        for (var i = 0; i < n; i++) {
            this.makeEnt("O" + i, this.player.pos.x, this.player.pos.y);
        }
    }
    //this.makeSun("Sun1");
    //this.makeSun("Sun2");
    //this.makeSun("Sun3");
}
g.makeSun = function(n,x,y) {
    var sun = this.makeEnt(n,x,y);
    sun.pos.x = Math.random() * this.galaxySize;
    sun.pos.y = Math.random() * this.galaxySize;
    sun.isPlasma = true;
    sun.color.r = 255;
    sun.color.g = 150;
    sun.fireArea = sun.earthArea;
}
g.makeStar = function(starArray){
    var z=this.galaxySize;
    var star = { 
        pos: new Coords(
             this.getRandomAround(z),
           this.getRandomAround(z)
        ),
        size: (Math.floor(Math.random() * 2) + 1)
    };
    starArray.push(star);
}
g.makeStars = function(n){
    for (var i = 0; i < n; i++) {
        this.makeStar(this.stars);
    }
}
g.makeBackgroundStars = function(n){
    for (var i = 0; i < n; i++) {
        this.makeStar(this.bgStars);
    }
}
g.makePlayerShip = function(n) {
    var s = new ShipClass(n,0,0);
    s.color = { r: 50, g: 190, b: 50 };
    s.pos.x = this.halfSize.x;
    s.pos.y = this.halfSize.y;
    //s.isMassAbsorbing = false;
    s.earthArea = 200;
    s.luminosity = 0.2;
    s.density = 1.5;
    s.setMass();
    s.setRadiusSizes();    
    this.player = s;
    this.ents.push(s);    
}
g.moment = function(){
    var nearbyEnts;
    var i;
    var ent;
    var edge = this.galaxySize;
    var negEdge = edge * -1;
    //console.log(this.player.pos.x);
    for(i = 0; i < this.ents.length; i++) {
        nearbyEnts = this.ents.slice(0);
        nearbyEnts.splice(i,1);
        ent = this.ents[i];
        //console.log(i, nearbyEnts);
        ent.physics(nearbyEnts);

        if (ent.pos.x < negEdge) ent.pos.x += (edge * 2);
        else if (ent.pos.x > edge) ent.pos.x += (negEdge * 2);
        if (ent.pos.y < negEdge) ent.pos.y += (edge * 2);
        else if (ent.pos.y > edge) ent.pos.y += (negEdge * 2);
    }
    
    this.draw();
    if (this.player.mass <= 0) {
        this.stop();
		document.getElementById("gameover").style.display = "block";
    }
    //console.log(this.ents);
}
g.reclaimEnts = function(){
    for(var i = 0; i < this.ents.length; i++){
        if (this.ents[i].mass <= 0) {
            this.ents.splice(i,1);
        }
    }
}

g.start = function(){   
    var o = this;    
    //console.log(this.ents);
    o.intId = window.setInterval(function(){
        o.iteration++;
        if (o.iteration < o.endIter){
            o.moment();
        } else {
            o.stop();
        }
    }, this.timeBetweenIntervals);
    o.lifeIntId = window.setInterval(function(){
        for(var i = 0, el = o.ents.length; i < el; i++){
            o.ents[i].checkLife();
        }
        o.reclaimEnts();
        if (!o.isWon && o.player.evolution == 100) {
            o.isWon = true;
			o.stop();
			document.getElementById("victory").style.display = "block";
        }
    }, this.timeBetweenLifeIntervals);
}
g.stop = function(){
    console.log("Stopped");
    clearInterval(this.intId);
    clearInterval(this.lifeIntId);
    this.intId = 0;
}
g.setup = function(){
    var o=this;
	
    o.canvasElt = document.getElementById("s");
    o.introElt = document.getElementById("intro");
	o.splashElt = document.getElementById("splash");
	o.isSplash = true;
	o.splashElt.style.display = "block";
	
	o.setupScreen();
    window.ctx = o.canvasElt.getContext('2d');
    ctx.font = "14px Verdana";
    //ctx.webkitImageSmoothingEnabled = false;
    //ctx.mozImageSmoothingEnabled = false;
    //ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "red";
    ctx.strokeStyle = "yellow";
    //ctx.fillText("Sample String", 10, 50);    
    ctx.save();
    console.log(o.canvasElt, o.size, o.halfSize);
	
    o.setupEvents();
}
g.setupScreen = function(){
	var o=this;
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
	x -= 20;
	y -= 20;
    o.size = new Coords(x,y);
    o.halfSize = new Coords(x/2, y/2);
    
    o.canvasElt.style.width = x + "px";
    o.canvasElt.style.height = y + "px";
    o.canvasElt.width = x;
    o.canvasElt.height = y;
}
g.activate = function(L){
    var o=this;
    console.log(L);
    switch(L){
        case "e":     o.player.isElementScanOn = !o.player.isElementScanOn; break;h
        case "t":     o.player.isThermoScanOn = !o.player.isThermoScanOn; break;
        case "o":     o.isObjectInfoOn = !o.isObjectInfoOn; break;
        case "esc":
        case "p":
            if (o.intId) o.stop(); else o.start();
            break;
        case "enter":
        case "h":
            if (o.intId) {
                o.stop();
                o.introElt.style.display = "block";
            } else {
                o.start(); 
                o.introElt.style.display = "none";              
            }
            break;
    }
	if (o.intId) {
		document.getElementById("victory").style.display = "none";
		document.getElementById("gameover").style.display = "none";
	}
}
g.setupEvents = function(){
    var o = this;
    /*o.toolsElt.addEventListener("click", function(e){
        console.log(e);
    });*/
	var endSplash = function(){
		o.isSplash = false;
		o.splashElt.style.display = "none";
		o.introElt.style.display = "block";	
	}
    document.getElementById("enter").addEventListener("click", function(e){
        o.activate("enter");
    });
	o.splashElt.addEventListener("click",function(e){
		endSplash();
	});
    document.addEventListener("keydown", function(e){
		if (o.isSplash) {
			endSplash();
			return false;
		}
        switch(e.keyCode){
            case 37: // left
            case 65: // a
                o.player.propulsion( new Coords(-1, 0) );
				e.preventDefault();
                break;
            case 38: // up
            case 87: // w
                o.player.propulsion( new Coords(0, -1) );
				e.preventDefault();
                break;
            case 39: // right
            case 68: // d
                o.player.propulsion( new Coords(1, 0) );
				e.preventDefault();
                break;
            case 40: // down
            case 83: // s
                o.player.propulsion( new Coords(0, 1) );
				e.preventDefault();
                break;
            case 32: // space
                o.makeEnts(10);
                break;
            case 69: o.activate("e"); break;
            case 84: o.activate("t"); break;
            case 72: o.activate("h"); break;
            case 79: o.activate("o"); break;
            case 80: o.activate("p"); break;
            case 27: o.activate("esc"); break;
            case 13: o.activate("enter"); break;
            case 81: // q
                break;
            default:
                console.log(e.keyCode);
                console.log(g.player);
        }
        
    }, false);
	window.onresize = function(e){
		o.setupScreen();
	}
}



function ShipClass() {
    this.isShip = true;
    this.isElementScanOn = false; 
    this.isThermoScanOn = false;
    this.isLightOn = false;
}
ShipClass.prototype = new ObjectClass("ship", 0, 0);
ShipClass.prototype.propulsion = function(dir){
    dir.multiply(1000 + this.mass/2);
    //console.log(dir);
    this.force.add(dir);
}

g.setup();
g.makeStars(500);
g.makeBackgroundStars(2000);
g.makePlayerShip("player");
g.makeEnts(120); //20);
g.makeSun("Sun1");
g.makeSun("Sun2");
g.draw();

console.log(g);
//ctx.stroke();


