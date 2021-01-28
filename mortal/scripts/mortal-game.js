document.addEventListener('DOMContentLoaded', function(){

	const g = {
		name: "Mortal",
		version: "v1.1.0" // Now with 100% less jQuery and 100% less rocketboots
	};
	console.log(g);

	g.age = 0;
	g.rate = 1;
	g.lastYear = 0;

	updateUI();
	updateGraphic(getYears());

	document.addEventListener('click', function(e) {
		if (!e.target.closest('.age-button')) { return; }
		increment();
	});

	function $(selector) { return document.querySelector(selector); }

	function increment() {
		g.age += Math.round(g.rate);
		g.rate += 2;
		updateUI();
		const year = getYears();
		if (year > g.lastYear) {
			g.lastYear = year;
			updateGraphic(year);
		}
		if (year >= 99) {
			$('.clickers').style.display = 'none';
		}		
	}

	function updateGraphic(year) {
		const i = getGraphicIndex(year);
		$('.character').classList.remove('age-0', 'age-1', 'age-2', 'age-3', 'age-4', 'age-5', 'age-6');
		$('.character').classList.add('age-' + i);
	}

	function updateUI() {
		$('.age-years').innerHTML = getYears();
		$('.age-days').innerHTML = g.age.toLocaleString();
		$('.rate').innerHTML = g.rate.toLocaleString();
	}

	function getYears() {
		return Math.floor(g.age / 365);
	}

	function getGraphicIndex(year) {
		if (year <= 0) {
			return 0;
		} else if (year < 5) {
			return 1;
		} else if (year < 10) {
			return 2;
		} else if (year < 22) {
			return 3;
		} else if (year < 43) {
			return 4;
		} else if (year < 70) {
			return 5;
		} else if (year < 99) {
			return 6;
		}
		return 7;
	}
});
