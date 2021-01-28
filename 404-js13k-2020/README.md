# 404 Orbiting Asteroids for JS13k 2020

[Play the latest version: https://deathraygames.github.io/404-js13k-2020/dist/](https://deathraygames.github.io/404-js13k-2020/dist/)

## JS13k

* [JS13k Rules](http://2020.js13kgames.com/#rules): Make a game with a package size less than 13k (13,312 bytes)
* Timeframe: one month (8/13 to 9/13)
* Theme: *"404"*
* [Entry for this game on js13kgames.com](https://js13kgames.com/entries/404-orbiting-asteroids)
* See all the entries for the competition at http://2020.js13kgames.com/

![404 Orbiting Asteroids](./images/Smaller1.png)

## Post Mortem

### Theme

The theme of "404" didn't inspire me to come up with a real unique idea, and I enjoyed working with basic spaceship flying as part of [Return to the Moon](https://github.com/deathraygames/lunar-lander-13k) in 2019, so I settled on making a simple [Asteroids](https://en.wikipedia.org/wiki/Asteroids_(video_game)) "clone". The user would control a spaceship, and the "404" theme would relate to the number of asteroids.

I decided to use this challenge as an excuse to [learn WebGL](https://xem.github.io/articles/webgl-guide.html) and to improve [my physics library](https://github.com/rocket-boots/physics). Originally I thought I might be able to put in thousands of asteroids thanks to WebGL (maybe even `4e4`!) but quickly realized I would need a lot more optimization to make that happen, so ended up sticking with `404`.
Because there wasn't a lot of originality to the gameplay, I stuck with a very literal title: *"404 Orbiting Asteroids"*.

### Background

I spent most of the month learning WebGL and working on a starfield background, which resulted in two libraries: [webgl-starfield](https://github.com/rocket-boots/webgl-starfield), and [webglp](https://github.com/rocket-boots/webglp) to help smooth out some of the ugly WebGL js code. I originally wanted to use the [Star Nest shader](https://www.shadertoy.com/view/XlfGRj) (by the brilliant Kali), but wasn't happy with the amount of star flickering, and thought it might be a little too busy-looking compared to the simple asteroids. Ultimately I went with a much simpler starfield of random dots based of some noise algorithms from the [Simplicity Galaxy shader](https://www.shadertoy.com/view/MslGWN) (by CBS). The background still has star flickering, but works well enough for simple space scenery.

### Gameplay

As a clone of a classic, the gameplay didn't require too much thought: *Fly around & shoot asteroids*. I knew I wanted some gravity to make flying more interesting, and since it [didn't make too much sense](https://twitter.com/deathraygames/status/1300966473280753664/photo/1) to have the asteroids with a strong force of gravity, I decided to add a big mass in the center. I originally wanted both a sun and a few planets (like [Star Hopper Glitch Jump](https://github.com/deathraygames/star-hopper-glitch)), but knew it would be too complicated to keep the planets in orbit (it would be a bit chaotic if the player could bump the planet into the sun), so I stuck with only one mass: a sun.

![Early development screenshot](./images/triangles_small.png)

Luckily I already had an [algorithm for determining the velocity vector needed to put an object in orbit](https://github.com/deathraygames/lunar-lander-13k/blob/master/src/scripts/physics.js#L23), which I used to set the asteroid's initial velocity, but I quickly found that it didn't work well with the game, and the asteroids always fell into the sun. Part of the problem comes from the asteroids constantly bumping into each other and losing energy, but even without that problem (i.e., if using just 1 asteroid) I found that they still don't enter a perfect orbit. I'm still not sure what the problem is, but after plenty of testing, I found that the falling asteroids actually made for interesting gameplay. Fallin asteroids could bump the player into the dangerous sun, and it was easy enough to make the asteroids re-spawn once they hit the sun, so I decided not to try to fix the gravity problem.

A lot of my development process involved testing the game, re-working several of the universal constants of the game - the mass of the sun, the gravitational constant, the distance the asteroids start from the sun, and the speed of the spaceship - and then more testing until everything just *felt right*.

#### Challenge

Once main departure from Asteroids is that the asteroids don't harm the player. I wanted the screen somewhat crammed with asteroids, and the ship doesn't handle well enough to allow dodging them, so I decided to just let the ship bounce off the asteroids.

I knew it would be possible for the ship to fall into the sun, and decided early on that this would be the main challenge for the user, rather than asteroid collisions. It is fairly easy to avoid falling into the sun, but since I generally prefer somewhat relaxing games, this wasn't a problem. 

While testing I realized that the way I had programmed the bullets led to the possibility that they would bounce back, hitting the player's ship, destroying it. I debated whether or not to keep this, but ultimately decided that the game needed more challenge, so left it in. [A happy accident!](https://www.youtube.com/watch?v=_Tq5vXk0wTk)

Of course the biggest challenge in the game is really the boredom that comes from having to destroy all 404 asteroids. Honestly, I haven't properly beaten the game myself yet. I'm okay with this, since I never expect most players of small competition games to actually spend more than a few minutes on the game. Yet it also provides some long gameplay for those rare players who are having fun and want to zone-out while patiently blasting every asteroid.

### Controls

When thinking about controls, I decided to copy [Reassembly](https://www.anisopteragames.com/) - a game that feels intuitive to play, and is a game I really enjoy. Rotation of the ship follows the mouse, and clicking fires the weapons. To make the game playable entirely by mouse I made right-click fire the engines. Later on, as an after-thought, I also added some keyboard controls: "w" to fire engines and space bar to fire.

Because games made for competitions like js13k are naturally only played for a few minutes, I knew it was important to making learning the controls as simple as possible. Originally I just did this with some instructions in the introduction text for the game, but [no one reads instructions](https://uxmyths.com/post/647473628/myth-people-read-on-the-web). I finally came up with the idea of **achievements**. Each control is its own achievement which gets checked-off on the instructions as the user does each action (this is something that is also done in Reassembly). This worked really well and I think it helps to make the game quickly accessible. We'll see if the judges agree.

### Polish

After making the key components - a ship, some asteroids, bullets, etc. - the game was technically playable, but felt dull and empty. I realized it desperately needed some **sounds** to give the experience more depth. I considered [jsfxr](https://github.com/mneubrand/jsfxr), but then found that [ZzFX micro](https://github.com/KilledByAPixel/ZzFX/blob/master/ZzFX.micro.js) is smaller and offered simple sound effects that I was looking for. I created the sounds by experimenting with [the ZzFX tool](https://killedbyapixel.github.io/ZzFX/), and put everything into a `sounds.js` file.

Towards the end of development I also added in explosion effects and asteroid fragments, which really helped to make the destruction of each asteroid much more satisfying. Adding particles for the thruster exhaust also made it clear when the ship was moving due to its thrust, and since the particles are governed by physics, it adds a touch of realism. Finally I added some effects around the edge of the sun to make it look more like a (cartoon) sun, and hopefully makes it seem a little bit more intimidating.

### Compression

Compression of the files was handled with webpack (`optimization: { minimize: true }`), followed by a simple zip file made in Windows. I realized that the minimization process did a good job at collapsing my code, so while I did a few things to condense my code, I didn't go too far out of my way to write in a minimal style. I really enjoy seeing what some people (like [Xem](https://twitter.com/MaximeEuziere)) can do to minimize JavaScript, but turns out I didn't need anything so extensive.

* Source: ~56.3 KB
	* new js scripts 26.5 KB
	* js libraries ~20.19 KB
		* webglp 7.03 KB (heavily commented)
		* Coords ~4.74 KB (but I think it was inserted more than once)
		* physics 8.42 KB
	* shaders (glsl) 6.13 KB
	* html/css 3.48 KB
* Minified JS: 29.4 KB
* Zipped: **12.0 KB** (1 KB left over!)

### Future

If I was to keep working on this I would do a few other things...

- Fix screen distortion so the canvas doesn't have to be square (a bug I didn't have time to fix)
- Better model for the ship (multiple polygons)
- Improved gravity/orbiting algorithms
- More optimization re: collisions ([sort and sweep?](https://www.toptal.com/game/video-game-physics-part-ii-collision-detection-for-solid-objects))
- Shader for the sun to make it prettier and more intimidating
- Proper polygon-based collisions
- Proper collision rotations
- Rework how the starfield is displayed
- Some kind of upgrade path (More weapons or power-ups?)
- Music

## Credits

Thanks to [Xem](https://github.com/xem) ([great article](https://xem.github.io/articles/js13k19.html)), [Frank Force](https://github.com/KilledByAPixel), [Mr. Art of Code](https://www.youtube.com/channel/UCcAlTqd9zID6aNX3TzwxJXg), and [gfx fundamentals](https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html).

![404 Orbiting Asteroids](./images/Bigger1.png)
